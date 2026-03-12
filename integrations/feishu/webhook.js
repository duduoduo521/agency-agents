/**
 * 飞书机器人 Webhook 处理器
 * 
 * 功能:
 * - 接收飞书机器人的消息
 * - 验证签名和 Token
 * - 解析用户命令
 * - 调用工作流引擎
 */

const crypto = require('crypto');
const axios = require('axios');

class FeishuWebhook {
  constructor(config) {
    this.token = config.token;
    this.secret = config.secret;
    this.apiUrl = config.apiUrl || 'http://localhost:3000/api';
  }

  /**
   * 验证飞书签名
   * 飞书使用 Base64 编码的 HMAC-SHA256 签名
   */
  verifySignature(timestamp, sign) {
    if (!this.secret) return true;

    const stringToSign = `${timestamp}\n${this.secret}`;
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(stringToSign, 'utf8')
      .digest()
      .toString('base64');

    return signature === sign;
  }

  /**
   * 解析用户命令
   * 飞书支持富文本消息和交互式卡片
   */
  parseCommand(content) {
    // 支持的命令格式（与钉钉保持一致）
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
   * 格式化响应消息为飞书的 Interactive Card 格式
   */
  formatResponse(result, commandType) {
    if (commandType === 'help') {
      return {
        msg_type: 'interactive',
        card: {
          config: {
            wide_screen_mode: true
          },
          header: {
            template: "blue",
            title: {
              tag: "plain_text",
              content: "🤖 The Code Agency 机器人帮助"
            }
          },
          elements: [{
            tag: "div",
            text: {
              tag: "lark_md",
              content: result
            }
          }]
        }
      };
    }

    if (commandType === 'status') {
      const task = result;
      const statusMap = {
        pending: { text: "待处理", color: "wathet" },
        analyzing: { text: "需求分析中", color: "blue" },
        designing: { text: "设计中", color: "blue" },
        coding: { text: "编码中", color: "blue" },
        testing: { text: "测试中", color: "blue" },
        reviewing: { text: "审查中", color: "blue" },
        completed: { text: "已完成", color: "green" },
        failed: { text: "失败", color: "red" }
      };
      
      const statusInfo = statusMap[task.status] || { text: task.status, color: "wathet" };
      
      return {
        msg_type: 'interactive',
        card: {
          config: {
            wide_screen_mode: true
          },
          header: {
            template: task.status === 'completed' ? 'green' : 
                     task.status === 'failed' ? 'red' : 'blue',
            title: {
              tag: "plain_text",
              content: `📊 任务状态查询结果`
            }
          },
          elements: [
            {
              tag: "div",
              fields: [{
                tag: "lark_md",
                content: `**任务ID:** ${task.id}`
              }]
            },
            {
              tag: "div",
              fields: [{
                tag: "lark_md",
                content: `**命令:** ${task.command}`
              }]
            },
            {
              tag: "div",
              fields: [{
                tag: "lark_md",
                content: `**状态:** ${this.getStatusEmoji(task.status)} ${statusInfo.text}`
              }]
            },
            {
              tag: "div",
              fields: [{
                tag: "lark_md",
                content: `**进度:** ${task.progress}%`
              }]
            },
            {
              tag: "div",
              fields: [{
                tag: "lark_md",
                content: `**创建时间:** ${new Date(task.createdAt).toLocaleString('zh-CN')}`
              }]
            }
          ]
        }
      };
    }

    // 对于新建任务的响应
    const taskId = result.taskId || (result.id ? result.id : 'unknown');
    
    // 飞书卡片模板
    return {
      msg_type: 'interactive',
      card: {
        config: {
          wide_screen_mode: true
        },
        header: {
          template: "blue",
          title: {
            tag: "plain_text",
            content: "🚀 The Code Agency"
          }
        },
        elements: [
          {
            tag: "div",
            text: {
              tag: "lark_md",
              content: `**任务已提交**\n\n✅ 任务已创建\n\n**任务ID:** ${taskId}\n**状态:** 处理中...`
            }
          },
          {
            tag: "hr"
          },
          {
            tag: "note",
            elements: [
              {
                tag: "lark_md",
                content: `💡 提示：使用命令 \`/status ${taskId}\` 查询进度`
              }
            ]
          }
        ]
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
   * 处理飞书 Webhook 请求
   */
  async handleWebhook(req, res) {
    try {
      const { challenge, timestamp, sign, event } = req.body;

      // 挑战验证（飞书首次配置时需要）
      if (challenge) {
        res.json({ challenge });
        return;
      }

      // 验证签名
      if (!this.verifySignature(timestamp, sign)) {
        res.status(401).json({
          msg_type: 'text',
          content: { text: '签名验证失败' }
        });
        return;
      }

      // 提取消息内容
      const message = event?.message;
      const content = message?.content || '';
       
      // 飞书消息可能是 JSON 字符串
      let textContent = '';
      try {
        const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
        textContent = parsedContent.text || parsedContent.content || content;
      } catch (e) {
        textContent = content;
      }

      // 解析命令
      const command = this.parseCommand(textContent);

      if (!command) {
        res.json({
          msg_type: 'interactive',
          card: {
            config: {
              wide_screen_mode: true
            },
            header: {
              template: "red",
              title: {
                tag: "plain_text",
                content: "❌ 未识别的命令"
              }
            },
            elements: [
              {
                tag: "div",
                text: {
                  tag: "lark_md",
                  content: "请使用以下命令之一：\n\n• `/analyze [需求]`\n• `/code [需求]`\n• `/status [任务ID]`\n• `/help` (获取帮助)"
                }
              }
            ]
          }
        });
        return;
      }

      // 执行命令
      const result = await this.executeTask(command);
      const response = this.formatResponse(result, command.type);

      res.json(response);

    } catch (error) {
      console.error('飞书 Webhook 错误:', error);
      res.status(500).json({
        msg_type: 'text',
        content: { text: `❌ 执行失败：${error.message}` }
      });
    }
  }
}

module.exports = FeishuWebhook;