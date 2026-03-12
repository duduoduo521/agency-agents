/**
 * 通知服务
 * 
 * 功能:
 * - 统一向钉钉和飞书机器人发送通知
 * - 管理通知配置和状态
 * - 提供通用的通知接口
 */

const axios = require('axios');

class NotificationService {
  constructor(config) {
    this.config = {
      dingtalk: config.dingtalk || {},
      feishu: config.feishu || {},
      enabled: config.enabled !== false // 默认启用
    };

    // 验证配置
    if (!this.config.enabled) {
      console.log('⚠️  通知服务已禁用');
      return;
    }

    if (!this.config.dingtalk.webhook && !this.config.feishu.webhook) {
      console.warn('⚠️  未配置任何机器人 webhook 地址');
    }
  }

  /**
   * 向所有启用的平台发送通知
   */
  async sendToAll(message) {
    if (!this.config.enabled) {
      return { success: true, results: {} };
    }

    const results = {};

    // 发送钉钉通知
    if (this.config.dingtalk.webhook) {
      try {
        results.dingtalk = await this.sendToDingTalk(message);
      } catch (error) {
        console.error('发送钉钉通知失败:', error.message);
        results.dingtalk = { success: false, error: error.message };
      }
    }

    // 发送飞书通知
    if (this.config.feishu.webhook) {
      try {
        results.feishu = await this.sendToFeishu(message);
      } catch (error) {
        console.error('发送飞书通知失败:', error.message);
        results.feishu = { success: false, error: error.message };
      }
    }

    return { success: true, results };
  }

  /**
   * 向钉钉发送通知
   */
  async sendToDingTalk(message) {
    if (!this.config.dingtalk.webhook) {
      throw new Error('未配置钉钉 webhook');
    }

    const payload = this.formatDingTalkMessage(message);
    const response = await axios.post(this.config.dingtalk.webhook, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return { success: true, data: response.data };
  }

  /**
   * 格式化钉钉消息
   */
  formatDingTalkMessage(message) {
    if (typeof message === 'string') {
      return {
        msgtype: 'text',
        text: { content: message }
      };
    }

    // 如果消息已经包含了钉钉特定格式，直接返回
    if (message.formatted && message.formatted.dingtalk) {
      return message.formatted.dingtalk;
    }

    // 根据消息类型格式化
    switch (message.type) {
      case 'task-started':
        return {
          msgtype: 'markdown',
          markdown: {
            title: '🚀 任务已启动',
            text: `## 🚀 任务已启动\n\n- **任务 ID**: ${message.taskId}\n- **命令**: ${message.command}\n- **描述**: ${message.description}`
          }
        };
        
      case 'task-progress':
        return {
          msgtype: 'markdown',
          markdown: {
            title: '📊 任务进度更新',
            text: `## 📊 任务进度更新\n\n- **任务 ID**: ${message.taskId}\n- **状态**: ${message.status}\n- **进度**: ${message.progress}%\n- **详情**: ${message.details || '处理中...'}`  
          }
        };
        
      case 'task-completed':
        return {
          msgtype: 'markdown',
          markdown: {
            title: '✅ 任务已完成',
            text: `## ✅ 任务已完成\n\n- **任务 ID**: ${message.taskId}\n- **命令**: ${message.command}\n- **输出目录**: ${message.outputDir || 'N/A'}\n\n请及时查看生成的代码。`
          }
        };
        
      case 'task-failed':
        return {
          msgtype: 'markdown',
          markdown: {
            title: '❌ 任务执行失败',
            text: `## ❌ 任务执行失败\n\n- **任务 ID**: ${message.taskId}\n- **命令**: ${message.command}\n- **错误**: ${message.error}\n\n请及时排查问题。`
          }
        };
        
      case 'test':
        return {
          msgtype: 'markdown',
          markdown: {
            title: '🧪 测试通知',
            text: '## 🧪 测试通知\n\n如果您收到此消息，说明通知系统工作正常。'
          }
        };
        
      default:
        return {
          msgtype: 'text',
          text: { content: message.content || JSON.stringify(message) }
        };
    }
  }

  /**
   * 向飞书发送通知
   */
  async sendToFeishu(message) {
    if (!this.config.feishu.webhook) {
      throw new Error('未配置飞书 webhook');
    }

    const payload = this.formatFeishuMessage(message);
    const response = await axios.post(this.config.feishu.webhook, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return { success: true, data: response.data };
  }

  /**
   * 格式化飞书消息
   */
  formatFeishuMessage(message) {
    if (typeof message === 'string') {
      return {
        msg_type: 'text',
        content: { text: message }
      };
    }

    // 如果消息已经包含了飞书特定格式，直接返回
    if (message.formatted && message.formatted.feishu) {
      return message.formatted.feishu;
    }

    // 根据消息类型格式化
    switch (message.type) {
      case 'task-started':
        return {
          msg_type: 'interactive',
          card: {
            config: { wide_screen_mode: true },
            header: { 
              template: "blue", 
              title: { tag: "plain_text", content: "🚀 任务已启动" } 
            },
            elements: [
              {
                tag: "div",
                text: {
                  tag: "lark_md",
                  content: `**任务 ID**: ${message.taskId}\n**命令**: ${message.command}\n**描述**: ${message.description}`
                }
              }
            ]
          }
        };
        
      case 'task-progress':
        return {
          msg_type: 'interactive',
          card: {
            config: { wide_screen_mode: true },
            header: { 
              template: "blue", 
              title: { tag: "plain_text", content: "📊 任务进度更新" } 
            },
            elements: [
              {
                tag: "div",
                text: {
                  tag: "lark_md",
                  content: `**任务 ID**: ${message.taskId}\n**状态**: ${message.status}\n**进度**: ${message.progress}%\n**详情**: ${message.details || '处理中...'}`
                }
              }
            ]
          }
        };
        
      case 'task-completed':
        return {
          msg_type: 'interactive',
          card: {
            config: { wide_screen_mode: true },
            header: { 
              template: "green", 
              title: { tag: "plain_text", content: "✅ 任务已完成" } 
            },
            elements: [
              {
                tag: "div",
                text: {
                  tag: "lark_md",
                  content: `**任务 ID**: ${message.taskId}\n**命令**: ${message.command}\n**输出目录**: ${message.outputDir || 'N/A'}\n\n请及时查看生成的代码。`
                }
              }
            ]
          }
        };
        
      case 'task-failed':
        return {
          msg_type: 'interactive',
          card: {
            config: { wide_screen_mode: true },
            header: { 
              template: "red", 
              title: { tag: "plain_text", content: "❌ 任务执行失败" } 
            },
            elements: [
              {
                tag: "div",
                text: {
                  tag: "lark_md",
                  content: `**任务 ID**: ${message.taskId}\n**命令**: ${message.command}\n**错误**: ${message.error}\n\n请及时排查问题。`
                }
              }
            ]
          }
        };
        
      case 'test':
        return {
          msg_type: 'interactive',
          card: {
            config: { wide_screen_mode: true },
            header: { 
              template: "blue", 
              title: { tag: "plain_text", content: "🧪 测试通知" } 
            },
            elements: [
              {
                tag: "div",
                text: {
                  tag: "lark_md",
                  content: "如果您收到此消息，说明通知系统工作正常。"
                }
              }
            ]
          }
        };
        
      default:
        return {
          msg_type: 'text',
          content: { text: message.content || JSON.stringify(message) }
        };
    }
  }

  /**
   * 发送任务开始通知
   */
  async sendTaskStarted(task) {
    const message = {
      type: 'task-started',
      taskId: task.id,
      command: task.command,
      description: task.params
    };
    
    return await this.sendToAll(message);
  }

  /**
   * 发送任务进度通知
   */
  async sendTaskProgress(task) {
    const message = {
      type: 'task-progress',
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      details: task.logs?.slice(-1)[0]?.message || '处理中...'
    };
    
    return await this.sendToAll(message);
  }

  /**
   * 发送任务完成通知
   */
  async sendTaskCompleted(task) {
    const message = {
      type: 'task-completed',
      taskId: task.id,
      command: task.command,
      outputDir: task.outputDir
    };
    
    return await this.sendToAll(message);
  }

  /**
   * 发送任务失败通知
   */
  async sendTaskFailed(task) {
    const message = {
      type: 'task-failed',
      taskId: task.id,
      command: task.command,
      error: task.error || '未知错误'
    };
    
    return await this.sendToAll(message);
  }

  /**
   * 发送测试通知
   */
  async sendTestNotification() {
    const message = { type: 'test' };
    return await this.sendToAll(message);
  }
}

module.exports = NotificationService;