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

// 删除任务
app.delete('/api/tasks/:taskId', (req, res) => {
 const taskId = req.params.taskId;
 const task = tasks.get(taskId);
 
 if (!task) {
   return res.status(404).json({ error: 'Task not found' });
 }
 
 // 如果任务正在运行，需要特殊处理
 const isRunning = ['analyzing', 'designing', 'coding', 'testing', 'reviewing'].includes(task.status);
 
 if (isRunning) {
   // 标记任务为已取消，而不是直接删除
   task.status = 'cancelled';
   task.progress = 0;
   task.updatedAt = new Date().toISOString();
   task.logs.push({
     timestamp: new Date().toISOString(),
     message: '⚠️ 任务已被用户取消'
   });
   
   // 保存更新后的任务状态
   tasks.set(taskId, task);
   saveTaskToDisk(taskId, task);
   taskEmitter.emit('taskUpdate', task);
   
   // 注意：由于JavaScript是单线程的，无法真正"停止"正在执行的异步操作
   // 但可以通过状态检查在后续步骤中跳过处理
 } else {
   // 直接删除非运行中的任务
   const deleted = tasks.delete(taskId);
   if (deleted) {
     removeTaskFromDisk(taskId); // 从磁盘删除
   }
 }
 
 res.json({ success: true, message: isRunning ? 'Task cancelled' : 'Task deleted' });
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
 // 检查任务是否已被取消或删除
 const currentTask = tasks.get(taskId);
 if (!currentTask || currentTask.status === 'cancelled') {
   console.log(`任务 ${taskId} 已被取消或删除，跳过执行`);
   return;
 }
 
 const codingPlan = new CodingPlanService({
  ali: {
   enabled: process.env.ALI_ENABLED === 'true',
   apiKey: process.env.ALI_API_KEY,
   endpoint: process.env.ALI_ENDPOINT,
   planType: process.env.ALI_PLAN_TYPE || 'qwen-coder-plus'
  },
 tencent: {
  enabled: process.env.TENCENT_ENABLED === 'true',
  secretId: process.env.TENCENT_SECRET_ID,
  secretKey: process.env.TENCENT_SECRET_KEY,
  endpoint: process.env.TENCENT_ENDPOINT,
  planType: process.env.TENCENT_PLAN_TYPE || 'hunyuan-code-pro'
  },
  baidu: {
  enabled: process.env.BAIDU_ENABLED === 'true',
  apiKey: process.env.BAIDU_API_KEY,
  secretKey: process.env.BAIDU_SECRET_KEY,
  endpoint: process.env.BAIDU_ENDPOINT,
  planType: process.env.BAIDU_PLAN_TYPE || 'ernie-bot-code-pro'
  },
  custom: {
  enabled: process.env.CUSTOM_ENABLED === 'true',
  apiKey: process.env.CUSTOM_API_KEY,
  endpoint: process.env.CUSTOM_ENDPOINT,
  planType: process.env.CUSTOM_PLAN_TYPE
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
  
  // 阶段 2: 设计文档
  updateTaskStatus(taskId, 'designing', 40);
  addLog(taskId, '🎨 设计文档生成中...');
  
 const designPrompt = promptTemplates.getTemplate('designDocument', aiResponse);
  aiResponse = await callWithRetry(async () => {
    return await codingPlan.generateCode(designPrompt, task.options?.techStack || []);
  }, task.maxRetries, 2000);
  addLog(taskId, '✅ 设计文档完成');
  
  // 阶段 3: 代码生成（核心）
  updateTaskStatus(taskId, 'coding', 60);
  addLog(taskId, '💻 代码编写中...');
  
  // 根据命令类型选择合适的模板
  let codeGenerationPrompt;
  if (task.command.includes('game') || task.params?.toLowerCase().includes('游戏')) {
 codeGenerationPrompt = promptTemplates.getTemplate('html5Game', task.params || task.command);
  } else if (task.command.includes('react') || task.command.includes('component')) {
 codeGenerationPrompt = promptTemplates.getTemplate('reactComponent', task.params || task.command);
  } else if (task.command.includes('api') || task.command.includes('backend')) {
 codeGenerationPrompt = promptTemplates.getTemplate('nodejsAPI', task.params || task.command);
  } else {
 codeGenerationPrompt = promptTemplates.getTemplate('codeGeneration', aiResponse, task.options?.techStack || []);
  }
  
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
  
  // 创建输出目录并保存生成的文件
 const outputDir = path.join(__dirname, '..', 'generated-code', taskId);
  fs.mkdirSync(outputDir, { recursive: true });
  
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
      
      // 延迟后重试
      setTimeout(() => executeTask(taskId, retryTask), 3000);
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
 */
function saveGeneratedFiles(codeContent, outputDir) {
 // 匹配代码块格式：文件名：path/to/file.js\n```\ncode\n```
 const fileRegex = /文件名：([\w\-./\s]+)\n```([\s\S]*?)```/g;
 let match;
 const files = [];

 while ((match = fileRegex.exec(codeContent)) !== null) {
  files.push({
 path: match[1].trim(),
 content: match[2].trim()
  });
 }

 // 如果没有找到带文件名的代码块，尝试保存整个内容为单个文件
 if (files.length === 0) {
  // 检查是否是 HTML
  if (codeContent.includes('<!DOCTYPE html>') || codeContent.includes('<html')) {
  fs.writeFileSync(path.join(outputDir, 'index.html'), codeContent);
  } else {
  fs.writeFileSync(path.join(outputDir, 'main.js'), codeContent);
  }
 return;
 }

 // 保存每个文件
 files.forEach(file => {
 const fullPath= path.join(outputDir, file.path);
 const dir = path.dirname(fullPath);
  
  // 创建目录
  fs.mkdirSync(dir, { recursive: true });
  
  // 写入文件
  fs.writeFileSync(fullPath, file.content);
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

// 健康检查 - 大模型配置状态
app.get('/api/health/llm-config', (req, res) => {
  // 检查各种大模型的配置状态
  const llmConfig = {
    ali: {
      enabled: process.env.ALI_ENABLED === 'true',
      configured: process.env.ALI_ENABLED === 'true' && 
                 process.env.ALI_API_KEY && 
                 process.env.ALI_ENDPOINT
    },
    tencent: {
      enabled: process.env.TENCENT_ENABLED === 'true',
      configured: process.env.TENCENT_ENABLED === 'true' && 
                  process.env.TENCENT_SECRET_ID && 
                  process.env.TENCENT_SECRET_KEY && 
                  process.env.TENCENT_ENDPOINT
    },
    baidu: {
      enabled: process.env.BAIDU_ENABLED === 'true',
      configured: process.env.BAIDU_ENABLED === 'true' && 
                  process.env.BAIDU_API_KEY && 
                  process.env.BAIDU_SECRET_KEY && 
                  process.env.BAIDU_ENDPOINT
    },
    custom: {
      enabled: process.env.CUSTOM_ENABLED === 'true',
      configured: process.env.CUSTOM_ENABLED === 'true' && 
                  process.env.CUSTOM_API_KEY && 
                  process.env.CUSTOM_ENDPOINT
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

const PORT = process.env.PORT || 3000;

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