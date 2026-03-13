#!/usr/bin/env node

/**
 * The Code Agency- 统一主服务器
 * 
 * 功能:
 * - Web GUI 静态文件服务
 * - CLI 引擎 API 服务
 * - 机器人 Webhook 服务
 * - 任务管理和状态跟踪
 * - AI 代码生成（集成 Coding Plan）
 */

const express = require('express');
const path= require('path');
const fs = require('fs');
const EventEmitter = require('events');
const axios = require('axios').default;
const CodingPlanService = require('./services/coding-plan');
const promptTemplates = require('./services/prompt-templates');

// 初始化 Express 应用
const app = express();
app.use(express.json());

// 全局事件发射器（用于任务状态更新）
const taskEmitter = new EventEmitter();

// 配置文件路径
const CONFIG_DIR = path.join(__dirname, 'config');
const CODING_PLAN_CONFIG_FILE = path.join(CONFIG_DIR, 'coding-plan.json');

// 确保配置目录存在
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

 // 从配置文件读取 Coding Plan 配置
 function loadCodingPlanConfig() {
   const defaultConfig = {
     ali: {
       enabled: false,
       apiKey: '',
       endpoint: 'https://dashscope.aliyuncs.com/api/v1',
       planType: 'qwen-coder-plus'
     },
     tencent: {
       enabled: false,
       secretId: '',
       secretKey: '',
       endpoint: 'https://hunyuan.tencentcloudapi.com',
       planType: 'hunyuan-code-pro'
     },
     baidu: {
       enabled: false,
       apiKey: '',
       secretKey: '',
       endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1',
       planType: 'ernie-bot-code-pro'
     },
     custom: {
       enabled: false,
       apiKey: '',
       endpoint: '',
       planType: ''
     }
   };

   try {
     if (fs.existsSync(CODING_PLAN_CONFIG_FILE)) {
       const fileContent = fs.readFileSync(CODING_PLAN_CONFIG_FILE, 'utf8');
       const config = JSON.parse(fileContent);
       console.log('✅ 已从配置文件加载 Coding Plan 配置');
       return config;
     }
   } catch (error) {
     console.error('❌ 加载配置文件失败:', error.message);
   }
   
   // 如果配置文件不存在，创建默认配置
   fs.writeFileSync(CODING_PLAN_CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
   console.log('✅ 已创建默认 Coding Plan 配置文件');
   return defaultConfig;
 }

// 加载配置
const codingPlanConfig = loadCodingPlanConfig();

// 机器人配置（从环境变量读取）
const robotConfig = {
 dingtalk: {
  enabled: process.env.DINGTALK_ENABLED === 'true',
  webhook: process.env.DINGTALK_WEBHOOK,
  secret: process.env.DINGTALK_SECRET
 },
 feishu: {
  enabled: process.env.FEISHU_ENABLED === 'true',
  webhook: process.env.FEISHU_WEBHOOK,
  secret: process.env.FEISHU_SECRET
 }
};

// ==================== 任务持久化管理 ====================

// 创建任务数据目录
const TASKS_DIR = path.join(__dirname, 'data', 'tasks');
if (!fs.existsSync(TASKS_DIR)) {
  fs.mkdirSync(TASKS_DIR, { recursive: true });
}

// 任务存储 - 从文件系统加载现有任务
const tasks = new Map();

// 加载已存在的任务
function loadTasksFromDisk() {
  const taskFiles = fs.readdirSync(TASKS_DIR);
  for (const file of taskFiles) {
    if (file.endsWith('.json')) {
      try {
        const taskData = JSON.parse(fs.readFileSync(path.join(TASKS_DIR, file), 'utf8'));
        tasks.set(taskData.id, taskData);
      } catch (error) {
        console.error(`加载任务文件失败 ${file}:`, error.message);
      }
    }
  }
  console.log(`✅ 从磁盘加载了 ${tasks.size} 个任务`);
}

// 保存任务到磁盘
function saveTaskToDisk(taskId, taskData) {
  try {
    const taskFilePath = path.join(TASKS_DIR, `${taskId}.json`);
    fs.writeFileSync(taskFilePath, JSON.stringify(taskData, null, 2));
  } catch (error) {
    console.error(`保存任务到磁盘失败 ${taskId}:`, error.message);
  }
}

// 从磁盘删除任务
function removeTaskFromDisk(taskId) {
  try {
    const taskFilePath = path.join(TASKS_DIR, `${taskId}.json`);
    if (fs.existsSync(taskFilePath)) {
      fs.unlinkSync(taskFilePath);
    }
  } catch (error) {
    console.error(`删除任务文件失败 ${taskId}:`, error.message);
  }
}

// 初始化时加载任务
loadTasksFromDisk();

// ==================== 中间件 ====================

// CORS 支持
app.use((req, res, next) => {
 res.header('Access-Control-Allow-Origin', '*');
 res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
 res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
   return res.sendStatus(200);
  }
  next();
});

// ==================== Web GUI 静态文件服务 ====================

const guiPath= path.join(__dirname, 'web-gui', 'dist');
if (fs.existsSync(guiPath)) {
 app.use(express.static(guiPath));
 console.log(`✅ Web GUI 服务已启动：${guiPath}`);
 
 // SPA路由处理：将所有非API路由重定向到index.html
 app.get(/^(?!\/api\/).*$/, (req, res) => {
   res.sendFile(path.join(guiPath, 'index.html'));
 });
} else {
 console.warn('⚠️  Web GUI 未找到，请先构建 web-gui');
}

// ==================== 任务管理 API ====================

// 创建任务
app.post('/api/tasks', async (req, res) => {
 const { command, params, options = {} } = req.body;
  
 const taskId = `task-${Date.now()}`;
 const task = {
    id: taskId,
   command,
   params,
    options,
    status: 'pending', // pending -> analyzing -> designing -> coding -> testing -> reviewing -> completed
    progress: 0,
    logs: [],
   createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
   outputDir: null,
    zipUrl: null,
    retries: 0,
    maxRetries: 3
  };
  
  tasks.set(taskId, task);
  saveTaskToDisk(taskId, task); // 保存到磁盘
  
  // 触发任务开始事件
  taskEmitter.emit('taskStarted', task);
  
  // 异步执行任务
  executeTask(taskId, task);
  
 res.json({ success: true, taskId });
});


// 获取任务列表
app.get('/api/tasks', (req, res) => {
 const taskList = Array.from(tasks.values()).sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
 res.json(taskList);
});

// 获取任务详情
app.get('/api/tasks/:taskId', (req, res) => {
 const task = tasks.get(req.params.taskId);
  if (!task) {
   return res.status(404).json({ error: 'Task not found' });
  }
 res.json(task);
});

// 终止任务
app.post('/api/tasks/:taskId/terminate', (req, res) => {
 const taskId = req.params.taskId;
 const task = tasks.get(taskId);
 
 if (!task) {
   return res.status(404).json({ error: 'Task not found' });
 }
 
 // 标记任务为已取消
 task.status = 'cancelled';
 task.updatedAt = new Date().toISOString();
 task.logs.push({
   timestamp: new Date().toISOString(),
   message: '⚠️ 任务已被用户强制终止'
 });
 
 // 保存更新后的任务状态
 tasks.set(taskId, task);
 saveTaskToDisk(taskId, task);
 taskEmitter.emit('taskUpdate', task);
 
 res.json({ success: true, message: 'Task terminated' });
});

// 删除任务
app.delete('/api/tasks/:taskId', (req, res) => {
 const taskId = req.params.taskId;
 const task = tasks.get(taskId);
 
 if (!task) {
   return res.status(404).json({ error: 'Task not found' });
 }
 
 // 直接删除任务，不管状态如何
 const deleted = tasks.delete(taskId);
 if (deleted) {
   removeTaskFromDisk(taskId); // 从磁盘删除任务文件
   
   // 删除对应的生成代码文件夹
   try {
     const outputDir = path.join(__dirname, 'generated-code', taskId);
     if (fs.existsSync(outputDir)) {
       fs.rmSync(outputDir, { recursive: true, force: true }); // 递归删除文件夹
       console.log(`✅ 已删除任务文件夹: ${outputDir}`);
     }
   } catch (error) {
     console.error(`❌ 删除任务文件夹失败 ${taskId}:`, error.message);
   }
 }
 
 res.json({ success: true, message: 'Task deleted' });
});

// 手动重试任务
app.post('/api/tasks/:taskId/retry', (req, res) => {
 const taskId = req.params.taskId;
 const task = tasks.get(taskId);
 
 if (!task) {
   return res.status(404).json({ error: 'Task not found' });
 }
 
 // 只允许重试失败的任务
 if (task.status !== 'failed') {
   return res.status(400).json({ error: 'Only failed tasks can be retried' });
 }
 
 // 重置任务状态
 task.status = 'pending';
 task.progress = 0;
 task.retries = 0; // 重置重试次数
 task.logs = []; // 清空日志或保留原有日志
 task.updatedAt = new Date().toISOString();
 
 // 保存到内存和磁盘
 tasks.set(taskId, task);
 saveTaskToDisk(taskId, task);
 
 // 触发任务开始事件
 taskEmitter.emit('taskStarted', task);
 
 // 异步执行任务
 executeTask(taskId, task);
 
 res.json({ success: true, message: 'Task retry started' });
});

// ==================== 任务执行引擎 ====================

 /**
 * 真实的 AI 代码生成任务执行引擎
 */
async function executeTask(taskId, task) {
 // 检查任务是否已被取消
 const currentTask = tasks.get(taskId);
 if (!currentTask || currentTask.status === 'cancelled') {
   console.log(`任务 ${taskId} 已被取消或删除，跳过执行`);
   return;
 }
 
 // 从配置文件读取配置
 const config = loadCodingPlanConfig();
 console.log('executeTask - 从配置文件加载的配置:', config);
 const codingPlan = new CodingPlanService({
  ali: {
   enabled: config.ali?.enabled || false,
   apiKey: config.ali?.apiKey || '',
   endpoint: config.ali?.endpoint || 'https://dashscope.aliyuncs.com/api/v1',
   planType: config.ali?.planType || 'qwen-coder-plus'
  },
 tencent: {
  enabled: config.tencent?.enabled || false,
  secretId: config.tencent?.secretId || '',
  secretKey: config.tencent?.secretKey || '',
  endpoint: config.tencent?.endpoint || 'https://hunyuan.tencentcloudapi.com',
  planType: config.tencent?.planType || 'hunyuan-code-pro'
  },
  baidu: {
  enabled: config.baidu?.enabled || false,
  apiKey: config.baidu?.apiKey || '',
  secretKey: config.baidu?.secretKey || '',
  endpoint: config.baidu?.endpoint || 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1',
  planType: config.baidu?.planType || 'ernie-bot-code-pro'
  },
  custom: {
   enabled: config.custom?.enabled || false,
   apiKey: config.custom?.apiKey || '',
   endpoint: config.custom?.endpoint || '',
   planType: config.custom?.planType || ''
  }
 });

 try {
  updateTaskStatus(taskId, 'analyzing', 10);
  addLog(taskId, '📋 开始分析任务...');
  
  // 阶段 1: 需求分析
  updateTaskStatus(taskId, 'analyzing', 20);
  addLog(taskId, '📝 需求分析中...');
  
 const requirementsPrompt = promptTemplates.getTemplate(
  'requirementsAnalysis', 
 task.params || task.command
  );
  
  let aiResponse = await callWithRetry(async () => {
    return await codingPlan.generateCode(requirementsPrompt, task.options?.techStack || []);
  }, task.maxRetries, 2000);
  addLog(taskId, '✅ 需求分析完成');
  
  // 创建输出目录
 const outputDir = path.join(__dirname, 'generated-code', taskId);
  fs.mkdirSync(outputDir, { recursive: true });
  
  // 阶段 2: 设计文档
  updateTaskStatus(taskId, 'designing', 40);
  addLog(taskId, '🎨 设计文档生成中...');
  
 const designPrompt = promptTemplates.getTemplate('designDocument', aiResponse);
  const designDoc = await callWithRetry(async () => {
    return await codingPlan.generateCode(designPrompt, task.options?.techStack || []);
  }, task.maxRetries, 2000);
  
  // 保存设计文档到任务目录
  const designDocPath = path.join(outputDir, 'DESIGN_DOC.md');
  fs.writeFileSync(designDocPath, designDoc);
  
  addLog(taskId, '✅ 设计文档完成');
  
  // 阶段 3: 代码生成（核心）
  updateTaskStatus(taskId, 'coding', 60);
  addLog(taskId, '💻 代码编写中...');
  
  // 使用通用模板，让AI根据用户需求自主判断生成什么类型的代码
  let codeGenerationPrompt = promptTemplates.getTemplate('codeGeneration', 
    `基于以下用户需求生成完整代码：\n\n${task.params || task.command}\n\n${aiResponse}`, 
    task.options?.techStack || []);
  
 const generatedCode = await callWithRetry(async () => {
    return await codingPlan.generateCode(codeGenerationPrompt, task.options?.techStack || []);
  }, task.maxRetries, 2000);
  addLog(taskId, '✅ 代码生成完成');
  
  // 阶段 4: 测试生成
  updateTaskStatus(taskId, 'testing', 80);
  addLog(taskId, '🧪 测试执行中...');
  
 const testPrompt = promptTemplates.getTemplate('testGeneration', generatedCode);
 const testCode = await callWithRetry(async () => {
    return await codingPlan.generateCode(testPrompt);
  }, task.maxRetries, 2000);
  addLog(taskId, '✅ 测试生成完成');
  
  // 阶段 5: 代码审查
  updateTaskStatus(taskId, 'reviewing', 90);
  addLog(taskId, '🔍 代码审查中...');
  
 const reviewPrompt = promptTemplates.getTemplate('codeReview', generatedCode);
 const reviewResult = await callWithRetry(async () => {
    return await codingPlan.generateCode(reviewPrompt);
  }, task.maxRetries, 2000);
  addLog(taskId, '✅ 代码审查完成');
  
  // 解析生成的代码并保存为文件
  saveGeneratedFiles(generatedCode, outputDir);
  
  // 保存测试文件
  fs.writeFileSync(path.join(outputDir, 'tests.test.js'), testCode);
  
  // 保存项目说明
  fs.writeFileSync(
 path.join(outputDir, 'README.md'),
  `# 任务 ${taskId}\n\n**命令**: ${task.command}\n**描述**: ${task.params}\n\n## 生成的代码\n\n这是通过 AI 自动生成的代码。\n\n## 使用说明\n\n请查看具体文件的注释了解使用方法。\n\n## 代码审查结果\n\n${reviewResult}`
  );
  
  updateTaskStatus(taskId, 'completed', 100);
  addLog(taskId, `✅ 任务完成！代码已保存到：${outputDir}`);
  
  // 更新任务信息
  const completedTask = tasks.get(taskId);
  completedTask.outputDir = outputDir;
  completedTask.zipUrl = `/api/tasks/${taskId}/download`;
  completedTask.updatedAt = new Date().toISOString();
  tasks.set(taskId, completedTask); // 更新map中的任务
  saveTaskToDisk(taskId, completedTask); // 保存到磁盘
  
  // 触发完成事件（用于推送通知）
  taskEmitter.emit('taskCompleted', completedTask);
  
  // 发送完成通知
  sendNotification(completedTask, 'completed');
  
 } catch (error) {
  // 检查任务是否已被取消
  const currentTask = tasks.get(taskId);
  if (!currentTask || currentTask.status === 'cancelled') {
    console.log(`任务 ${taskId} 在错误处理期间已被取消`);
    return;
  }
  
  // 检查是否可以重试
  if (task.retries < task.maxRetries) {
    const retryTask = tasks.get(taskId);
    // 添加空值检查，确保任务仍然存在且未被取消
    if (retryTask && retryTask.status !== 'cancelled') {
      retryTask.retries++;
      addLog(taskId, `⚠️  任务失败，正在重试 (${retryTask.retries}/${task.maxRetries})：${error.message}`);
      
      // 更新任务到磁盘
      saveTaskToDisk(taskId, retryTask);
      
      // 延迟后重试 - 在重试前重新加载最新配置
      setTimeout(() => {
        // 重新加载配置，确保使用最新配置进行重试
        const freshConfig = loadCodingPlanConfig();
        console.log('重试任务时重新加载的配置:', freshConfig);
        executeTask(taskId, retryTask);
      }, 3000);
      return;
    } else {
      // 任务不存在或已被取消，直接标记为失败
      console.error(`任务 ${taskId} 不存在或已被取消，无法重试`);
    }
  }
  
  updateTaskStatus(taskId, 'failed', 0);
  addLog(taskId, `❌ 任务失败：${error.message}`);
  const failedTask = tasks.get(taskId);
  taskEmitter.emit('taskFailed', { ...failedTask, error: error.message });
  
  // 发送失败通知
  sendNotification({ ...failedTask, error: error.message }, 'failed');
 }
}

/**
 * 带重试机制的异步函数调用
 */
async function callWithRetry(fn, maxRetries = 3, delay = 1000) {
 let lastError;
 for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/**
 * 解析 AI 生成的代码并保存为文件
 * AI通常返回标准格式：``` 文件名：xxx ```\n```lang\n代码\n```\n```
 */
function saveGeneratedFiles(codeContent, outputDir) {
  const files = [];
  const extractedFilePaths = new Set();
  
  // 按行分割内容以便解析
  const lines = codeContent.split(/\r?\n/);
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // 寻找 "文件名：" 模式 - 正确识别格式：``` -> 文件名：xxx -> ``` -> ```lang -> 代码内容 -> ```
    if (line.startsWith('```') && lines[i + 1]?.includes('文件名：')) {
      // 解析文件名
      const fileNameLine = lines[i + 1]; // 文件名：xxx
      const fileNameMatch = fileNameLine.match(/文件名[:：]\s*([^\n`"']+\.(?:js|html|css|json|md|txt|py|java|cpp|c|ts|jsx|tsx))/);
      
      if (fileNameMatch) {
        const filePath = fileNameMatch[1].trim().replace(/[`"'*]/g, '');
        // 跳过 ```、文件名行、```、```lang 四行
        i += 4;
        
        // 现在收集代码内容，直到遇到结束的 ```
        const fileContentLines = [];
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          fileContentLines.push(lines[i]);
          i++;
        }
        
        // 跳过结束的 ```
        if (i < lines.length && lines[i].trim().startsWith('```')) {
          i++;
        }
        
        // 移除可能的尾随空行
        let fileContent = fileContentLines.join('\n');
        fileContent = fileContent.replace(/\s+$/, ''); // 移除末尾空白字符
        
        // 确保文件路径包含扩展名且不重复
        if (filePath.includes('.') && !extractedFilePaths.has(filePath)) {
          files.push({
            path: filePath,
            content: fileContent
          });
          extractedFilePaths.add(filePath);
        }
      } else {
        i++; // 如果不是文件名格式，继续下一行
      }
    } else {
      i++; // 继续下一行
    }
  }

  // 如果按上述格式没有找到文件，尝试其他格式
  if (files.length === 0) {
    // 尝试匹配：文件名：path/to/file.ext\n```\ncode\n```
    const fileNameFirstPattern = /文件名[:：]\s*([^\n`"']+\.(?:js|html|css|json|md|txt|py|java|cpp|c|ts|jsx|tsx))\s*\n```(?:\w+)?\n([\s\S]*?)```\s*(?=\n|$|文件名[:：]|```[\s\n]*```)/g;
    let match;
    while ((match = fileNameFirstPattern.exec(codeContent)) !== null) {
      const filePath = match[1].trim().replace(/[`"'*]/g, '');
      const fileContent = match[2].trim();
      
      if (!extractedFilePaths.has(filePath)) {
        files.push({
          path: filePath,
          content: fileContent
        });
        extractedFilePaths.add(filePath);
      }
    }

    // 如果仍然没有匹配到，尝试匹配：```文件名：path/to/file.ext```\n```lang\ncode\n```
    if (files.length === 0) {
      const fileNamePattern = /```\s*文件名[:：]\s*([^\n`"']+\.(?:js|html|css|json|md|txt|py|java|cpp|c|ts|jsx|tsx))\s*```\s*\n```(?:\w+)?\n([\s\S]*?)```\s*(?=\n|$|```)/g;
      while ((match = fileNamePattern.exec(codeContent)) !== null) {
        const filePath = match[1].trim().replace(/[`"'*]/g, '');
        const fileContent = match[2].trim();
        
        if (!extractedFilePaths.has(filePath)) {
          files.push({
            path: filePath,
            content: fileContent
          });
          extractedFilePaths.add(filePath);
        }
      }
    }

    // 如果仍然没有匹配到，尝试匹配：```lang\n[filename]\n```code```
    if (files.length === 0) {
      const langThenFilePattern = /```(\w+)\s*([^\n`]*\.(?:js|html|css|json|md|txt|py|java|cpp|c|ts|jsx|tsx))\s*\n([\s\S]*?)```\s*(?=\n|$|```)/g;
      while ((match = langThenFilePattern.exec(codeContent)) !== null) {
        const filePath = match[2].trim().replace(/[`"'*]/g, '');
        const fileContent = match[3] ? match[3].trim() : '';
        
        if (!extractedFilePaths.has(filePath)) {
          files.push({
            path: filePath,
            content: fileContent
          });
          extractedFilePaths.add(filePath);
        }
      }
    }

    // 如果仍然没有匹配到，尝试匹配没有明确文件名的代码块
    if (files.length === 0) {
      // 匹配：```lang\n```code```
      const codeBlockPattern = /```(\w+)?\s*\n([\s\S]*?)```\s*(?=\n|$|```)/g;
      while ((match = codeBlockPattern.exec(codeContent)) !== null) {
        const codeLang = match[1] ? match[1].toLowerCase() : '';
        const fileContent = match[2].trim();
        let extension = 'txt';

        // 根据语言标识符确定文件扩展名
        if (codeLang === 'html') extension = 'html';
        else if (codeLang === 'css') extension = 'css';
        else if (codeLang === 'javascript' || codeLang === 'js' || codeLang.includes('js')) extension = 'js';
        else if (codeLang === 'json') extension = 'json';
        else if (codeLang === 'md' || codeLang === 'markdown') extension = 'md';
        else if (codeLang === 'python' || codeLang === 'py') extension = 'py';
        else if (codeLang === 'java') extension = 'java';
        else if (codeLang === 'cpp' || codeLang === 'c++') extension = 'cpp';
        else if (codeLang === 'c') extension = 'c';
        else if (codeLang === 'typescript' || codeLang === 'ts') extension = 'ts';
        else if (codeLang === 'jsx') extension = 'jsx';
        else if (codeLang === 'tsx') extension = 'tsx';

        // 尝试从代码内容推断文件类型
        if (extension === 'txt') {
          if (fileContent.includes('<!DOCTYPE html>') || fileContent.includes('<html')) extension = 'html';
          else if (fileContent.includes('import ') || fileContent.includes('function ') || fileContent.includes('const ') || fileContent.includes('let ')) extension = 'js';
          else if (fileContent.includes('body {') || fileContent.includes('margin:')) extension = 'css';
          else if (fileContent.includes('def ') || fileContent.includes('import ') || fileContent.includes('print(')) extension = 'py';
        }

        // 生成文件名
        const fileName = `generated_${files.length + 1}.${extension}`;
        if (!extractedFilePaths.has(fileName)) {
          files.push({
            path: fileName,
            content: fileContent
          });
          extractedFilePaths.add(fileName);
        }
      }
    }
  }

  // 如果没有找到任何代码块，尝试智能判断整个内容类型
  if (files.length === 0) {
    // 检查是否是 HTML 文件
    if (codeContent.includes('<!DOCTYPE html>') || codeContent.includes('<html')) {
      const htmlPath = path.join(outputDir, 'index.html');
      fs.writeFileSync(htmlPath, codeContent);
      console.log(`保存HTML文件: ${htmlPath}`);
    } else if (codeContent.includes('import ') || codeContent.includes('export ') || codeContent.includes('function ') || codeContent.includes('const ') || codeContent.includes('let ')) {
      // 检查是否是 JS 文件
      const jsPath = path.join(outputDir, 'main.js');
      fs.writeFileSync(jsPath, codeContent);
      console.log(`保存JS文件: ${jsPath}`);
    } else if (codeContent.includes('body {') || codeContent.includes('margin:') || codeContent.includes('padding:')) {
      // 检查是否是 CSS 文件
      const cssPath = path.join(outputDir, 'style.css');
      fs.writeFileSync(cssPath, codeContent);
      console.log(`保存CSS文件: ${cssPath}`);
    } else {
      // 默认保存为文本文件
      const txtPath = path.join(outputDir, 'output.txt');
      fs.writeFileSync(txtPath, codeContent);
      console.log(`保存输出文件: ${txtPath}`);
    }
    return;
  }

  // 保存每个文件
  files.forEach(file => {
    const fullPath = path.join(outputDir, file.path);
    const dir = path.dirname(fullPath);
    
    // 创建目录
    fs.mkdirSync(dir, { recursive: true });
    
    // 写入文件
    fs.writeFileSync(fullPath, file.content);
    console.log(`保存文件: ${fullPath} (${file.content.length} 字符)`);
  });
}

function updateTaskStatus(taskId, status, progress) {
 const task = tasks.get(taskId);
  if (task) {
   task.status = status;
   task.progress = progress;
   task.updatedAt = new Date().toISOString();
   tasks.set(taskId, task); // 更新map中的任务
   saveTaskToDisk(taskId, task); // 保存到磁盘
   taskEmitter.emit('taskUpdate', task);
  }
}

function addLog(taskId, message) {
 const task = tasks.get(taskId);
  if (task) {
   task.logs.push({
      timestamp: new Date().toISOString(),
    message
    });
   task.updatedAt = new Date().toISOString();
   tasks.set(taskId, task); // 更新map中的任务
   saveTaskToDisk(taskId, task); // 保存到磁盘
   taskEmitter.emit('taskUpdate', task);
  }
}

// ==================== 机器人通知推送 ====================

/**
 * 发送钉钉通知
 */
async function sendDingTalkNotification(task, eventType) {
 if (!robotConfig.dingtalk.enabled || !robotConfig.dingtalk.webhook) {
 return;
 }

const messages = {
  started: {
    title: '任务已启动',
   text: `## 🚀 任务已启动\n\n- **任务 ID**: ${task.id}\n- **命令**: ${task.command}\n- **描述**: ${task.params}`
  },
 completed: {
    title: '任务已完成',
   text: `## ✅ 任务已完成\n\n- **任务 ID**: ${task.id}\n- **命令**: ${task.command}\n- **输出目录**: ${task.outputDir || 'N/A'}\n\n请及时查看生成的代码。`
  },
  failed: {
    title: '任务执行失败',
   text: `## ❌ 任务执行失败\n\n- **任务 ID**: ${task.id}\n- **命令**: ${task.command}\n- **错误**: ${task.error}\n\n请及时排查问题。`
  }
};

const message = messages[eventType];
 if (!message) return;

 try {
  await axios.post(robotConfig.dingtalk.webhook, {
    msgtype: 'markdown',
    markdown: {
      title: message.title,
     text: message.text
    }
  });
 console.log(`✅ 钉钉通知已发送：${task.id} - ${eventType}`);
} catch (error) {
 console.error('❌ 发送钉钉通知失败:', error.message);
 }
}

/**
 * 发送飞书通知
 */
async function sendFeishuNotification(task, eventType) {
 if (!robotConfig.feishu.enabled || !robotConfig.feishu.webhook) {
 return;
 }

const messages = {
  started: {
    title: '🚀 任务已启动',
 content: `**任务 ID**: ${task.id}\n**命令**: ${task.command}\n**描述**: ${task.params}`
  },
 completed: {
    title: '✅ 任务已完成',
 content: `**任务 ID**: ${task.id}\n**命令**: ${task.command}\n**输出目录**: ${task.outputDir || 'N/A'}\n\n请及时查看生成的代码。`
  },
  failed: {
    title: '❌ 任务执行失败',
 content: `**任务 ID**: ${task.id}\n**命令**: ${task.command}\n**错误**: ${task.error}\n\n请及时排查问题。`
  }
};

const message = messages[eventType];
 if (!message) return;

 try {
  await axios.post(robotConfig.feishu.webhook, {
    msg_type: 'interactive',
    card: {
      header: {
        title: { tag: 'plain_text', content: message.title },
       template: eventType === 'failed' ? 'red' : 'blue'
      },
      elements: [
        {
        tag: 'markdown',
       content: message.content
        }
      ]
    }
  });
 console.log(`✅ 飞书通知已发送：${task.id} - ${eventType}`);
} catch (error) {
 console.error('❌ 发送飞书通知失败:', error.message);
 }
}

/**
 * 统一推送通知
 */
function sendNotification(task, eventType) {
 // 并行发送到所有启用的平台
 Promise.all([
  sendDingTalkNotification(task, eventType),
  sendFeishuNotification(task, eventType)
 ]).catch(err => {
 console.error('发送通知时出错:', err);
 });
}

// ==================== 代码下载 API ====================

 // 健康检查 - 大模型配置状态（从配置文件读取）
app.get('/api/health/llm-config', (req, res) => {
  const config = loadCodingPlanConfig();
  
  // 检查各种大模型的配置状态
  const llmConfig = {
    ali: {
      enabled: config.ali?.enabled || false,
      configured: !!(config.ali?.enabled && config.ali?.apiKey && config.ali?.endpoint),
      apiKey: config.ali?.apiKey ? '***' : '',
      endpoint: config.ali?.endpoint || '',
      planType: config.ali?.planType || 'qwen-coder-plus'
    },
    tencent: {
      enabled: config.tencent?.enabled || false,
      configured: !!(config.tencent?.enabled && config.tencent?.secretId && config.tencent?.secretKey),
      secretId: config.tencent?.secretId ? '***' : '',
      endpoint: config.tencent?.endpoint || '',
      planType: config.tencent?.planType || 'hunyuan-code-pro'
    },
    baidu: {
      enabled: config.baidu?.enabled || false,
      configured: !!(config.baidu?.enabled && config.baidu?.apiKey && config.baidu?.secretKey),
      apiKey: config.baidu?.apiKey ? '***' : '',
      endpoint: config.baidu?.endpoint || '',
      planType: config.baidu?.planType || 'ernie-bot-code-pro'
    },
    custom: {
      enabled: config.custom?.enabled || false,
      configured: !!(config.custom?.enabled && config.custom?.apiKey && config.custom?.endpoint),
      apiKey: config.custom?.apiKey ? '***' : '',
      endpoint: config.custom?.endpoint || '',
      planType: config.custom?.planType || ''
    }
  };

  // 检查是否有至少一个大模型已配置
  const hasConfiguredLlm = Object.values(llmConfig).some(provider => provider.configured);

  res.json({
    configured: hasConfiguredLlm,
    providers: llmConfig,
    timestamp: new Date().toISOString()
  });
});

// 获取 Coding Plan 配置
app.get('/api/config/coding-plan', (req, res) => {
  const config = loadCodingPlanConfig();
  
  // 隐藏敏感信息，使用与真实值相同长度的星号
  const maskValue = (value) => {
    if (!value) return '';
    return '*'.repeat(value.length);
  };
  
  // 隐藏敏感信息
  const safeConfig = {
    ali: {
      enabled: config.ali?.enabled || false,
      apiKey: maskValue(config.ali?.apiKey),
      endpoint: config.ali?.endpoint || '',
      planType: config.ali?.planType || 'qwen-coder-plus'
    },
    tencent: {
      enabled: config.tencent?.enabled || false,
      secretId: maskValue(config.tencent?.secretId),
      secretKey: maskValue(config.tencent?.secretKey),
      endpoint: config.tencent?.endpoint || '',
      planType: config.tencent?.planType || 'hunyuan-code-pro'
    },
    baidu: {
      enabled: config.baidu?.enabled || false,
      apiKey: maskValue(config.baidu?.apiKey),
      secretKey: maskValue(config.baidu?.secretKey),
      endpoint: config.baidu?.endpoint || '',
      planType: config.baidu?.planType || 'ernie-bot-code-pro'
    },
    custom: {
      enabled: config.custom?.enabled || false,
      apiKey: maskValue(config.custom?.apiKey),
      endpoint: config.custom?.endpoint || '',
      planType: config.custom?.planType || ''
    }
  };
  
  res.json(safeConfig);
});

// 保存 Coding Plan 配置
app.post('/api/config/coding-plan', (req, res) => {
  const { ali, tencent, baidu, custom } = req.body;
  
  const currentConfig = loadCodingPlanConfig();
  
  // 合并配置，只更新提供的字段
  // 对于敏感字段，如果传入的是掩码值（***）或空值，则保留原始值
  const newConfig = {
    ali: { 
      ...currentConfig.ali, 
      ...ali,
      apiKey: ali?.apiKey && ali.apiKey !== '***' && ali.apiKey.trim() !== '' ? ali.apiKey : currentConfig.ali?.apiKey || ''
    },
    tencent: { 
      ...currentConfig.tencent, 
      ...tencent,
      secretId: tencent?.secretId && tencent.secretId !== '***' && tencent.secretId.trim() !== '' ? tencent.secretId : currentConfig.tencent?.secretId || '',
      secretKey: tencent?.secretKey && tencent.secretKey !== '***' && tencent.secretKey.trim() !== '' ? tencent.secretKey : currentConfig.tencent?.secretKey || ''
    },
    baidu: { 
      ...currentConfig.baidu, 
      ...baidu,
      apiKey: baidu?.apiKey && baidu.apiKey !== '***' && baidu.apiKey.trim() !== '' ? baidu.apiKey : currentConfig.baidu?.apiKey || '',
      secretKey: baidu?.secretKey && baidu.secretKey !== '***' && baidu.secretKey.trim() !== '' ? baidu.secretKey : currentConfig.baidu?.secretKey || ''
    },
    custom: { 
      ...currentConfig.custom, 
      ...custom,
      apiKey: custom?.apiKey && custom.apiKey !== '***' && custom.apiKey.trim() !== '' ? custom.apiKey : currentConfig.custom?.apiKey || ''
    }
  };
  
  try {
    fs.writeFileSync(CODING_PLAN_CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    console.log('✅ Coding Plan 配置已保存', newConfig);
    
    // 返回安全的配置（隐藏敏感信息）
    res.json({ 
      success: true, 
      message: '配置已保存',
      config: {
        ali: { ...newConfig.ali, apiKey: newConfig.ali?.apiKey ? '***' : '' },
        tencent: { ...newConfig.tencent, secretId: newConfig.tencent?.secretId ? '***' : '', secretKey: newConfig.tencent?.secretKey ? '***' : '' },
        baidu: { ...newConfig.baidu, apiKey: newConfig.baidu?.apiKey ? '***' : '', secretKey: newConfig.baidu?.secretKey ? '***' : '' },
        custom: { ...newConfig.custom, apiKey: newConfig.custom?.apiKey ? '***' : '' }
      }
    });
  } catch (error) {
    console.error('❌ 保存配置失败:', error.message);
    res.status(500).json({ success: false, error: '保存配置失败: ' + error.message });
  }
 });

const archiver = require('archiver');

app.get('/api/tasks/:taskId/download', (req, res) => {
 const task = tasks.get(req.params.taskId);
  if (!task || !task.outputDir) {
   return res.status(404).json({ error: 'Task or output not found' });
  }
  
 const archive = archiver('zip', { zlib: { level: 9 } });
  
  archive.on('error', (err) => {
    throw err;
  });
  
 res.attachment(`${task.id}-code.zip`);
  archive.pipe(res);
  archive.directory(task.outputDir, false);
  archive.finalize();
});

// ==================== WebSocket 实时日志（简化版用 SSE） ====================

app.get('/api/tasks/:taskId/logs/stream', (req, res) => {
 const taskId = req.params.taskId;
 res.setHeader('Content-Type', 'text/event-stream');
 res.setHeader('Cache-Control', 'no-cache');
 res.setHeader('Connection', 'keep-alive');
  
 const sendUpdate = (task) => {
   if (task.id === taskId) {
     res.write(`data: ${JSON.stringify(task)}\n\n`);
    }
  };
  
  taskEmitter.on('taskUpdate', sendUpdate);
  
 res.on('close', () => {
   taskEmitter.removeListener('taskUpdate', sendUpdate);
  });
  
  // 立即发送当前状态
 const task = tasks.get(taskId);
  if (task) {
   res.write(`data: ${JSON.stringify(task)}\n\n`);
  }
});

// ==================== 启动服务器 ====================

const PORT = process.env.PORT || 3009;

app.listen(PORT, () => {
 console.log('\n========================================');
 console.log('🚀 The Code Agency - 统一服务器');
 console.log('========================================\n');
 console.log(`📡 服务已启动`);
 console.log(`   端口：${PORT}`);
 console.log(`   URL: http://localhost:${PORT}\n`);
 console.log('📋 API 端点:');
 console.log(`  POST /api/tasks          - 创建任务`);
 console.log(`  GET  /api/tasks          - 获取任务列表`);
 console.log(`  GET  /api/tasks/:id      - 获取任务详情`);
 console.log(`  POST /api/tasks/:id/retry - 重试失败任务`);
 console.log(`  DELETE /api/tasks/:id    - 删除任务`);
 console.log(`  GET  /api/tasks/:id/download - 下载代码包`);
 console.log(`  GET  /api/tasks/:id/logs/stream - 实时日志流\n`);
 console.log('💡 提示:');
 console.log(`  访问 Web GUI: http://localhost:${PORT}\n`);
 console.log('========================================\n');
});

module.exports = app;