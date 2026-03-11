/**
 * 工作流状态推送服务
 * 
 * 功能:
 * - 监听工作流状态变更事件
 * - 自动推送通知到钉钉/飞书
 * - 支持自定义推送规则
 */

const EventEmitter= require('events');

class WorkflowPushService extends EventEmitter {
 constructor(options = {}) {
    super();
    
    this.notificationService = options.notificationService;
    this.pushRules = options.pushRules || {
      onWorkflowStart: true,
      onStageComplete: true,
      onError: true,
      onWorkflowComplete: true
    };
    
   // 订阅工作流事件
    this.subscribeToWorkflowEvents(options.workflowEmitter);
  }

  /**
   * 订阅工作流事件
   */
  subscribeToWorkflowEvents(workflowEmitter) {
  if (!workflowEmitter) return;

  // 监听工作流启动
  workflowEmitter.on('workflow:start', (data) => {
    if (this.pushRules.onWorkflowStart) {
       this.pushWorkflowStart(data);
     }
    });

  // 监听阶段完成
  workflowEmitter.on('workflow:stageComplete', (data) => {
    if (this.pushRules.onStageComplete) {
       this.pushStageComplete(data);
     }
    });

  // 监听错误
  workflowEmitter.on('workflow:error', (data) => {
    if (this.pushRules.onError) {
       this.pushError(data);
     }
    });

  // 监听工作流完成
  workflowEmitter.on('workflow:complete', (data) => {
    if (this.pushRules.onWorkflowComplete) {
       this.pushWorkflowComplete(data);
     }
    });
  }

  /**
   * 推送工作流启动通知
   */
  async pushWorkflowStart({ workflowId, stage, estimatedTime }) {
 const message = this.notificationService.formatWorkflowStart(workflowId, stage, estimatedTime);
    
   try {
    await this.notificationService.sendToAll(message);
     console.log(`✅ 已推送工作流启动通知：${workflowId}`);
   } catch (error) {
    console.error(`❌ 推送工作流启动通知失败：${workflowId}`, error);
   }
  }

  /**
   * 推送阶段完成通知
   */
  async pushStageComplete({ workflowId, stage, result }) {
 const message = this.notificationService.formatStageComplete(stage, result);
    
   try {
    await this.notificationService.sendToAll(message);
     console.log(`✅ 已推送阶段完成通知：${workflowId} - ${stage}`);
   } catch (error) {
    console.error(`❌ 推送阶段完成通知失败：${workflowId}`, error);
   }
  }

  /**
   * 推送错误通知
   */
  async pushError({ workflowId, errorMessage }) {
 const message = this.notificationService.formatError(workflowId, errorMessage);
    
   try {
    await this.notificationService.sendToAll(message);
     console.log(`✅ 已推送错误通知：${workflowId}`);
   } catch (error) {
    console.error(`❌ 推送错误通知失败：${workflowId}`, error);
   }
  }

  /**
   * 推送工作流完成通知
   */
  async pushWorkflowComplete({ workflowId, summary }) {
 const message = {
    type: 'workflowComplete',
    content: `工作流 ${workflowId} 已完成`,
     formatted: {
        dingtalk: {
          msgtype: 'markdown',
         markdown: {
           title: '✅ 工作流完成',
           text: `## ✅ 工作流完成\n\n` +
                  `- **工作流 ID**: ${workflowId}\n\n` +
                  `### 执行摘要\n${summary}`
          }
        },
       feishu: {
          msg_type: 'interactive',
         card: {
           header: {
            title: { tag: 'plain_text', content: '✅ 工作流完成' },
             template: 'green'
           },
           elements: [
             {
              tag: 'markdown',
              content: `**工作流 ID**: ${workflowId}\n\n${summary}`
             }
           ]
         }
       }
     }
    };
    
   try {
    await this.notificationService.sendToAll(message);
     console.log(`✅ 已推送工作流完成通知：${workflowId}`);
   } catch (error) {
    console.error(`❌ 推送工作流完成通知失败：${workflowId}`, error);
   }
  }

  /**
   * 更新推送规则
   */
  updatePushRules(newRules) {
  this.pushRules = { ...this.pushRules, ...newRules };
   console.log('📋 推送规则已更新:', this.pushRules);
  }

  /**
   * 获取当前推送规则
   */
  getPushRules() {
 return this.pushRules;
  }

  /**
   * 手动推送消息
   */
  async manualPush(message) {
   try {
    await this.notificationService.sendToAll(message);
     console.log(`✅ 手动推送成功`);
   } catch (error) {
    console.error(`❌ 手动推送失败`, error);
   }
  }
}

module.exports = WorkflowPushService;
