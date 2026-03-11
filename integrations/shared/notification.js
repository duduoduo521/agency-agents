/**
 * 通用消息通知服务
 * 
 * 功能:
 * - 统一钉钉和飞书的通知接口
 * - 支持多种通知类型（启动、完成、错误、日报）
 * - 异步消息队列处理
 * - 通知模板管理
 */

const EventEmitter = require('events');

class NotificationService extends EventEmitter {
 constructor(config = {}) {
    super();
    
    this.dingtalk = config.dingtalk;
    this.feishu = config.feishu;
    this.enabled = config.enabled !== false;
    
   // 通知模板
    this.templates = {
      workflowStart: this.formatWorkflowStart.bind(this),
      stageComplete: this.formatStageComplete.bind(this),
      error: this.formatError.bind(this),
     dailyReport: this.formatDailyReport.bind(this)
    };
    
    // 消息队列（简单的内存队列）
    this.messageQueue = [];
    this.processing = false;
  }

  /**
   * 发送通知到所有已配置的平台
   */
  async sendToAll(message, options = {}) {
  if (!this.enabled) return;

 const platforms = [];
    
  if (this.dingtalk) {
     platforms.push({ name: 'dingtalk', handler: this.sendToDingTalk.bind(this) });
    }
    
  if (this.feishu) {
     platforms.push({ name: 'feishu', handler: this.sendToFeishu.bind(this) });
    }

   // 并行发送到所有平台
 const results = await Promise.allSettled(
     platforms.map(async ({ name, handler }) => {
       try {
         await handler(message, options);
        return { platform: name, success: true };
       } catch (error) {
        console.error(`发送到${name}失败:`, error);
        return { platform: name, success: false, error };
       }
     })
    );

   // 触发事件
  this.emit('notificationSent', { message, results });
    
 return results;
  }

  /**
   * 发送到钉钉
   */
  async sendToDingTalk(message, options = {}) {
  if (!this.dingtalk) throw new Error('钉钉未配置');

  // 这里应该调用钉钉的 API 发送消息
  // 简化实现：直接输出日志
 console.log('[钉钉通知]', message.type, message.content);
    
   // 实际使用时需要调用钉钉 API
  // await axios.post(dingtalkWebhookUrl, message.formatted);
    
 return { success: true, platform: 'dingtalk' };
  }

  /**
   * 发送到飞书
   */
  async sendToFeishu(message, options = {}) {
  if (!this.feishu) throw new Error('飞书未配置');

  // 这里应该调用飞书的 API 发送消息
  // 简化实现：直接输出日志
 console.log('[飞书通知]', message.type, message.content);
    
   // 实际使用时需要调用飞书 API
  // await axios.post(feishuWebhookUrl, message.formatted);
    
 return { success: true, platform: 'feishu' };
  }

  /**
   * 格式化工作流启动通知
   */
  formatWorkflowStart(workflowId, stage, estimatedTime) {
    return {
     type: 'workflowStart',
    content: `工作流 ${workflowId} 已启动，当前阶段：${stage}，预计时间：${estimatedTime}`,
     formatted: {
        dingtalk: {
          msgtype: 'markdown',
         markdown: {
           title: '工作流已启动',
           text: `## 🚀 工作流已启动\n\n` +
                  `- **工作流 ID**: ${workflowId}\n` +
                  `- **当前阶段**: ${stage}\n` +
                  `- **预计时间**: ${estimatedTime}\n\n` +
                  `请稍候，完成后将通知您。`
          }
        },
       feishu: {
          msg_type: 'interactive',
         card: {
           header: {
            title: { tag: 'plain_text', content: '🚀 工作流已启动' },
             template: 'blue'
           },
           elements: [
             {
              tag: 'div',
               text: {
                tag: 'lark_md',
                 content: `**工作流 ID**: ${workflowId}\n**当前阶段**: ${stage}\n**预计时间**: ${estimatedTime}`
               }
             }
           ]
         }
       }
     }
    };
  }

  /**
   * 格式化阶段完成通知
   */
  formatStageComplete(stage, result) {
 const emojis = {
      analyze: '📋',
      design: '🎨',
    code: '💻',
      test: '🧪',
      deploy: '🚀'
    };

 const emoji = emojis[stage] || '✅';
    
    return {
     type: 'stageComplete',
    content: `${stage} 阶段已完成`,
     formatted: {
        dingtalk: {
          msgtype: 'markdown',
         markdown: {
           title: `${stage} 完成`,
           text: `## ${emoji} ${stage} 完成\n\n${result.substring(0, 500)}...`
          }
        },
       feishu: {
          msg_type: 'interactive',
         card: {
           header: {
            title: { tag: 'plain_text', content: `${emoji} ${stage} 完成` },
             template: 'green'
           },
           elements: [
             {
              tag: 'markdown',
              content: result.substring(0, 800) + '...'
             }
           ]
         }
       }
     }
    };
  }

  /**
   * 格式化错误通知
   */
  formatError(workflowId, errorMessage) {
    return {
     type: 'error',
    content: `工作流 ${workflowId} 执行失败：${errorMessage}`,
     formatted: {
        dingtalk: {
          msgtype: 'actionCard',
         actionCard: {
           title: '❌ 工作流执行失败',
           text: `## ❌ 工作流执行失败\n\n` +
                  `- **工作流 ID**: ${workflowId}\n` +
                  `- **错误信息**: ${errorMessage}`
          }
        },
       feishu: {
          msg_type: 'interactive',
         card: {
           header: {
            title: { tag: 'plain_text', content: '❌ 工作流执行失败' },
             template: 'red'
           },
           elements: [
             {
              tag: 'div',
               text: {
                tag: 'lark_md',
                 content: `**工作流 ID**: ${workflowId}\n\n**错误信息**:\n${errorMessage}`
               }
             }
           ]
         }
       }
     }
    };
  }

  /**
   * 格式化每日站会报告
   */
  formatDailyReport(date, stats) {
  let content = `## 📊 每日站会报告 - ${date}\n\n`;
    
 content += `### 今日概览\n`;
 content += `- 启动工作流：**${stats.started}** 个\n`;
 content += `- 完成工作流：**${stats.completed}** 个\n`;
 content += `- 失败工作流：**${stats.failed}** 个\n\n`;

  if (stats.topCommands && stats.topCommands.length> 0) {
    content += `### 常用命令\n`;
   stats.topCommands.forEach((cmd, index) => {
      content += `${index +1}. \`${cmd.name}\` - ${cmd.count} 次\n`;
     });
   }

    return {
     type: 'dailyReport',
    content: `每日站会报告 (${date})`,
     formatted: {
        dingtalk: {
          msgtype: 'markdown',
         markdown: {
           title: '每日站会报告',
           text: content
          }
        },
       feishu: {
          msg_type: 'interactive',
         card: {
           header: {
            title: { tag: 'plain_text', content: '📊 每日站会报告' },
             template: 'blue'
           },
           elements: [
             {
              tag: 'markdown',
              content
             }
           ]
         }
       }
     }
    };
  }

  /**
   * 将消息加入队列
   */
  queueMessage(message, options = {}) {
  this.messageQueue.push({ message, options, timestamp: Date.now() });
    
  if (!this.processing) {
    this.processQueue();
   }
  }

  /**
   * 处理消息队列
   */
  async processQueue() {
  if (this.processing || this.messageQueue.length === 0) return;
    
  this.processing = true;
    
  while (this.messageQueue.length > 0) {
    const { message, options } = this.messageQueue.shift();
    await this.sendToAll(message, options);
   }
    
  this.processing = false;
  }

  /**
   * 清空队列
   */
  clearQueue() {
  this.messageQueue = [];
  }

  /**
   * 获取队列状态
   */
  getQueueStatus() {
 return {
     pending: this.messageQueue.length,
    processing: this.processing
   };
  }
}

module.exports = NotificationService;
