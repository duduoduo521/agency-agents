/**
 * 钉钉机器人 Webhook 处理器
 * 
 * 功能:
 * - 接收钉钉机器人的消息
 * - 验证签名和 Token
 * - 解析用户命令
 * - 调用工作流引擎
 */

const crypto = require('crypto');
const axios = require('axios');

class DingTalkWebhook {
  constructor(config) {
    this.token = config.token;
    this.secret = config.secret;
    this.apiUrl = config.apiUrl || 'http://localhost:3000/api';
  }

  /**
   * 验证钉钉签名
   */
  verifySignature(timestamp, sign) {
    if (!this.secret) return true;

    const stringToSign = `${timestamp}\n${this.secret}`;
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(stringToSign, 'utf8')
      .digest()
      .toString('base64');

    return encodeURIComponent(signature) === sign;
  }

  /**
   * 解析用户命令
   */
  parseCommand(content) {
    // 支持的命令格式
    const commands = {
      '/analyze': (args) => ({ type: 'analyze', params: args }),
      '/design': (args) => ({ type: 'design', params: args }),
      '/code': (args) => ({ type: 'code', params: args }),
      '/test': (args) => ({ type: 'test', params: args }),
      '/status': (args) => ({ type: 'status', params: args }),
      '/deploy': (args) => ({ type: 'deploy', params: args }),
      '/help': () => ({ type: 'help', params: '' })
    };

    for (const [cmd, handler] of Object.entries(commands)) {
      if (content.startsWith(cmd)) {
        const args = content.slice(cmd.length).trim();
        return handler(args);
      }
    }

    // 如果没有匹配到命令，将整个内容视为需求描述
    if (content.trim()) {
      return { type: 'create-task', params: content.trim() };
    }

    return null;
  }

  /**
   * 调用主服务API执行任务
   */
  async executeTask(commandObj) {
    try {
      // 根据命令类型创建任务
      let taskPayload = {};
      switch (commandObj.type) {
        case 'analyze':
        case 'create-task':
          taskPayload = {
            command: 'create-feature',
            params: commandObj.params,
            options: {}
          };
          break;
        case 'design':
          taskPayload = {
            command: 'create-design',
            params: commandObj.params,
            options: {}
          };
          break;
        case 'code':
          taskPayload = {
            command: 'generate-code',
            params: commandObj.params,
            options: {}
          };
          break;
        case 'test':
          taskPayload = {
            command: 'generate-test',
            params: commandObj.params,
            options: {}
          };
          break;
        case 'status':
          // 查询任务状态
          const response = await axios.get(`${this.apiUrl}/tasks/${commandObj.params}`);
          return response.data;
        case 'help':
          return `
🤖 The Code Agency 机器人帮助

支持的命令：
• /analyze [需求描述] - 分析需求并生成设计方案
• /code [需求描述] - 直接生成代码
• /test [项目路径] - 生成测试用例
• /status [任务ID] - 查询任务状态
• 直接输入需求 - AI将为您自动生成代码

示例：
• /analyze 制作一个登录页面
• /code 创建一个Todo应用
• 直接输入"计算器应用"也可以开始
          `.trim();
        default:
          taskPayload = {
            command: commandObj.type,
            params: commandObj.params,
            options: {}
          };
      }

      if (commandObj.type === 'status') {
        return taskPayload; // 这种情况下，taskPayload实际上是查询结果
      }

      // 创建任务
      const response = await axios.post(`${this.apiUrl}/tasks`, taskPayload);
      return response.data;
    } catch (error) {
      console.error('执行任务时出错:', error.message);
      throw new Error(`执行失败：${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * 格式化响应消息
   */
  formatResponse(result, commandType) {
    if (commandType === 'help') {
      return {
        msgtype: 'text',
        text: { content: result }
      };
    }

    if (commandType === 'status') {
      const task = result;
      return {
        msgtype: 'markdown',
        markdown: {
          title: '任务状态查询结果',
          text: `## 📊 任务状态\n\n- **任务ID**: ${task.id}\n- **命令**: ${task.command}\n- **状态**: ${this.getStatusEmoji(task.status)} ${task.status}\n- **进度**: ${task.progress}%\n- **创建时间**: ${new Date(task.createdAt).toLocaleString('zh-CN')}`
        }
      };
    }

    // 对于新建任务的响应
    const taskId = result.taskId || (result.id ? result.id : 'unknown');
    const messages = {
      analyze: `✅ 需求分析任务已创建\n\n taskId: ${taskId}\n状态: 正在分析中...`,
      design: `✅ 设计任务已创建\n\n taskId: ${taskId}\n状态: 正在设计中...`,
      code: `✅ 代码生成任务已创建\n\n taskId: ${taskId}\n状态: 正在生成代码...`,
      test: `✅ 测试任务已创建\n\n taskId: ${taskId}\n状态: 正在生成测试...`,
      'create-task': `✅ 任务已创建\n\n taskId: ${taskId}\n状态: 开始处理...`
    };

    const content = messages[commandType] || `✅ 任务已创建\n\n taskId: ${taskId}\n状态: 处理中...`;

    return {
      msgtype: 'markdown',
      markdown: {
        title: 'The Code Agency',
        text: `## ${this.getStatusEmoji('pending')} 任务已提交\n\n${content.replace(/\n/g, '\n\n')}\n\n您可以使用命令 \`/status ${taskId}\` 来查询进度。`
      }
    };
  }

  /**
   * 获取状态对应的emoji
   */
  getStatusEmoji(status) {
    const emojis = {
      pending: '⏳',
      analyzing: '📊',
      designing: '🎨',
      coding: '💻',
      testing: '🧪',
      reviewing: '🔍',
      completed: '✅',
      failed: '❌'
    };
    return emojis[status] || '❓';
  }

  /**
   * 处理 Webhook 请求
   */
  async handleWebhook(req, res) {
    try {
      const { timestamp, sign, text } = req.body;

      // 验证签名
      if (!this.verifySignature(timestamp, sign)) {
        res.status(401).json({ 
          msgtype: 'text', 
          text: { content: '签名验证失败' } 
        });
        return;
      }

      // 解析命令
      const content = text?.content || '';
      const command = this.parseCommand(content);

      if (!command) {
        res.status(200).json({
          msgtype: 'text',
          text: {
            content: '❌ 未识别的内容\n\n请使用以下命令之一：\n/analyze [需求]\n/code [需求]\n/status [任务ID]\n/help (获取帮助)'
          }
        });
        return;
      }

      // 执行命令
      const result = await this.executeTask(command);
      const response = this.formatResponse(result, command.type);

      // 返回响应
      res.status(200).json(response);

    } catch (error) {
      console.error('钉钉 Webhook 错误:', error);
      res.status(500).json({
        msgtype: 'text',
        text: { content: `❌ 执行失败：${error.message}` }
      });
    }
  }
}

module.exports = DingTalkWebhook;