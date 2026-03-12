/**
 * NEXUS 协调器 - 多代理协调系统
 * 
 * 功能：
 * - 协调多个AI代理完成复杂任务
 * - 实现任务分解和分配
 * - 管理代理间通信和数据交换
 * - 跟踪任务进度和质量控制
 * - 实现错误处理和回退机制
 */

const CodingPlanService = require('../services/coding-plan');
const promptTemplates = require('../services/prompt-templates');
const path = require('path');
const fs = require('fs');

class NexusCoordinator {
  constructor(config = {}) {
    this.codingPlan = new CodingPlanService(config);
    this.agents = new Map(); // 存储注册的代理
    this.tasks = new Map(); // 存储任务状态
    this.communicationHistory = []; // 通信历史
    this.maxRetries = 3; // 最大重试次数
  }

  /**
   * 注册AI代理
   */
  registerAgent(agentName, agentConfig) {
    this.agents.set(agentName, agentConfig);
    console.log(`✅ 代理 ${agentName} 已注册`);
  }

  /**
   * 执行NEXUS协调任务
   */
  async executeNexusTask(projectSpec, options = {}) {
    const taskId = `nexus-${Date.now()}`;
    const task = {
      id: taskId,
      spec: projectSpec,
      status: 'initiated',
      progress: 0,
      logs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      results: {},
      currentPhase: null,
      phaseResults: {},
      errors: [], // 记录错误
      fallbackApplied: false // 是否已应用回退措施
    };

    this.tasks.set(taskId, task);
    console.log(`🚀 启动 NEXUS 任务: ${taskId}`);

    try {
      // 阶段 1: 需求分析 - 需求分析师
      task.currentPhase = 'requirements-analysis';
      task.status = 'executing';
      await this._logTaskProgress(taskId, '📊 开始需求分析阶段...');
      const requirementsResult = await this._executeAgentTaskWithFallback(
        'requirements-analyst', 
        promptTemplates.getTemplate('requirementsAnalysis', projectSpec),
        task
      );
      if (requirementsResult === null) {
        throw new Error('需求分析阶段多次尝试失败');
      }
      task.phaseResults['requirements-analysis'] = requirementsResult;
      await this._logTaskProgress(taskId, '✅ 需求分析完成');

      // 阶段 2: 架构设计 - 架构师
      task.currentPhase = 'architecture-design';
      await this._logTaskProgress(taskId, '🏗️ 开始架构设计阶段...');
      const designResult = await this._executeAgentTaskWithFallback(
        'architect', 
        promptTemplates.getTemplate('designDocument', requirementsResult),
        task
      );
      if (designResult === null) {
        throw new Error('架构设计阶段多次尝试失败');
      }
      task.phaseResults['architecture-design'] = designResult;
      await this._logTaskProgress(taskId, '✅ 架构设计完成');

      // 阶段 3: 前端开发 - 前端开发者
      task.currentPhase = 'frontend-development';
      await this._logTaskProgress(taskId, '💻 开始前端开发阶段...');
      const frontendPrompt = `根据以下系统设计文档，实现前端部分：

系统设计：
${designResult}

请实现：
1. 用户界面组件
2. 前端状态管理
3. 与后端API的接口对接
4. 用户交互逻辑

技术栈：${options.techStack?.frontend || 'React, Redux, TailwindCSS'}

输出格式：
\`\`\`
文件名：src/components/App.js
\`\`\`
[代码内容]

\`\`\`
文件名：src/styles/main.css
\`\`\`
[代码内容]
`;
      const frontendResult = await this._executeAgentTaskWithFallback('frontend-developer', frontendPrompt, task);
      if (frontendResult === null) {
        throw new Error('前端开发阶段多次尝试失败');
      }
      task.phaseResults['frontend-development'] = frontendResult;
      await this._logTaskProgress(taskId, '✅ 前端开发完成');

      // 阶段 4: 后端开发 - 后端开发者
      task.currentPhase = 'backend-development';
      await this._logTaskProgress(taskId, '⚙️ 开始后端开发阶段...');
      const backendPrompt = `根据以下系统设计文档，实现后端部分：

系统设计：
${designResult}

前端已实现的部分：
${frontendResult}

请实现：
1. API 接口
2. 数据库模型
3. 业务逻辑
4. 认证授权机制

技术栈：${options.techStack?.backend || 'Node.js, Express, MongoDB'}

输出格式：
\`\`\`
文件名：server.js
\`\`\`
[代码内容]

\`\`\`
文件名：models/User.js
\`\`\`
[代码内容]
`;
      const backendResult = await this._executeAgentTaskWithFallback('backend-developer', backendPrompt, task);
      if (backendResult === null) {
        throw new Error('后端开发阶段多次尝试失败');
      }
      task.phaseResults['backend-development'] = backendResult;
      await this._logTaskProgress(taskId, '✅ 后端开发完成');

      // 阶段 5: 代码审查 - 代码审查员
      task.currentPhase = 'code-review';
      await this._logTaskProgress(taskId, '🔍 开始代码审查阶段...');
      const reviewPrompt = `请审查以下前后端代码：

前端代码：
${frontendResult}

后端代码：
${backendResult}

请从以下方面进行审查：
1. 代码质量
2. 安全性
3. 性能优化
4. 最佳实践
5. 改进建议
`;
      const reviewResult = await this._executeAgentTaskWithFallback('code-reviewer', reviewPrompt, task);
      if (reviewResult === null) {
        throw new Error('代码审查阶段多次尝试失败');
      }
      task.phaseResults['code-review'] = reviewResult;
      await this._logTaskProgress(taskId, '✅ 代码审查完成');

      // 阶段 6: 修复和优化 - Bug修复专家
      task.currentPhase = 'bug-fixing';
      await this._logTaskProgress(taskId, '🔧 开始修复和优化阶段...');
      const fixPrompt = `根据以下审查意见，修复代码：

前端代码：
${frontendResult}

后端代码：
${backendResult}

审查意见：
${reviewResult}

请提供修复后的完整代码。`;
      const fixResult = await this._executeAgentTaskWithFallback('bug-fix-expert', fixPrompt, task);
      if (fixResult === null) {
        throw new Error('修复和优化阶段多次尝试失败');
      }
      task.phaseResults['bug-fixing'] = fixResult;
      await this._logTaskProgress(taskId, '✅ 修复和优化完成');

      // 阶段 7: 文档编写 - 文档工程师
      task.currentPhase = 'documentation';
      await this._logTaskProgress(taskId, '📝 开始文档编写阶段...');
      const docPrompt = `根据已完成的项目，编写完整的技术文档：

项目规格：
${projectSpec}

系统设计：
${designResult}

实现代码：
${fixResult}

审查结果：
${reviewResult}

请提供：
1. 项目概述和架构图
2. API 文档
3. 部署指南
4. 使用说明
5. 维护指南`;
      const docResult = await this._executeAgentTaskWithFallback('documentation-engineer', docPrompt, task);
      if (docResult === null) {
        throw new Error('文档编写阶段多次尝试失败');
      }
      task.phaseResults['documentation'] = docResult;
      await this._logTaskProgress(taskId, '✅ 文档编写完成');

      // 保存最终结果
      task.results.finalCode = fixResult;
      task.results.documentation = docResult;
      task.results.review = reviewResult;
      task.status = 'completed';
      task.progress = 100;
      await this._logTaskProgress(taskId, `🎉 NEXUS 任务完成！总耗时: ${new Date() - new Date(task.createdAt)}ms`);

      return task;
    } catch (error) {
      task.status = 'failed';
      await this._logTaskProgress(taskId, `❌ NEXUS 任务失败: ${error.message}`);
      task.errors.push({
        phase: task.currentPhase,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * 带回退机制的代理任务执行
   */
  async _executeAgentTaskWithFallback(agentName, prompt, task) {
    let lastError;
    
    // 尝试主代理
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this._executeAgentTask(agentName, prompt);
        return result;
      } catch (error) {
        lastError = error;
        task.errors.push({
          agent: agentName,
          attempt: attempt + 1,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        console.log(`⚠️  代理 ${agentName} 第 ${attempt + 1} 次尝试失败: ${error.message}`);
        
        if (attempt < this.maxRetries) {
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        }
      }
    }
    
    // 如果主代理多次失败，尝试使用通用代理作为回退
    console.log(`🔄 ${agentName} 多次失败，尝试使用通用代理作为回退...`);
    task.fallbackApplied = true;
    
    try {
      // 简化提示词，让通用AI代理尝试完成任务
      const fallbackPrompt = `请根据以下要求生成代码或文档：

要求：
${prompt.substring(0, 2000)}  // 限制长度以适应通用AI的上下文窗口

请提供尽可能完整的解决方案。`;
      
      const fallbackResult = await this.codingPlan.generateCode(fallbackPrompt);
      await this._logTaskProgress(task.id, `✅ 使用通用代理完成 ${agentName} 任务`);
      
      // 记录回退使用情况
      task.errors.push({
        agent: agentName,
        fallbackUsed: true,
        timestamp: new Date().toISOString(),
        message: `使用通用AI代理替代 ${agentName}`
      });
      
      return fallbackResult;
    } catch (fallbackError) {
      console.error(`❌ 通用代理也无法完成任务: ${fallbackError.message}`);
      return null; // 表示任务完全失败
    }
  }

  /**
   * 执行单个代理任务
   */
  async _executeAgentTask(agentName, prompt) {
    try {
      // 从代理文件获取代理描述
      const agentFilePath = path.join(__dirname, `${agentName}.md`);
      let agentDescription = '通用AI开发者';
      
      if (fs.existsSync(agentFilePath)) {
        const agentContent = fs.readFileSync(agentFilePath, 'utf8');
        const nameMatch = agentContent.match(/name: (.+)/);
        const descMatch = agentContent.match(/description: (.+)/);
        
        if (nameMatch && descMatch) {
          agentDescription = `${nameMatch[1]} (${descMatch[1]})`;
        }
      }
      
      console.log(`🔄 执行代理任务: ${agentName} (${agentDescription})`);
      
      // 调用AI服务生成结果
      const result = await this.codingPlan.generateCode(prompt);
      
      // 记录通信历史
      this.communicationHistory.push({
        agent: agentName,
        timestamp: new Date().toISOString(),
        input: prompt.length > 500 ? prompt.substring(0, 500) + '...' : prompt, // 限制日志长度
        output: result.length > 500 ? result.substring(0, 500) + '...' : result // 限制日志长度
      });
      
      return result;
    } catch (error) {
      console.error(`❌ 代理 ${agentName} 执行失败:`, error.message);
      throw error;
    }
  }

  /**
   * 记录任务进度
   */
  async _logTaskProgress(taskId, message) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.logs.push({
        timestamp: new Date().toISOString(),
        message
      });
      task.updatedAt = new Date().toISOString();
      console.log(`[${taskId}] ${message}`);
    }
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(taskId) {
    return this.tasks.get(taskId);
  }

  /**
   * 获取通信历史
   */
  getCommunicationHistory() {
    return this.communicationHistory;
  }
  
  /**
   * 获取任务详细信息
   */
  getTaskDetails(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    
    return {
      ...task,
      phaseCount: Object.keys(task.phaseResults).length,
      errorCount: task.errors.length,
      hasFallback: task.fallbackApplied
    };
  }
}

module.exports = NexusCoordinator;