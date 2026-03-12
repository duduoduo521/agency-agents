/**
 * 工作流推送服务
 * 
 * 功能:
 * - 监听工作流事件
 * - 根据配置规则推送通知
 * - 管理推送规则和状态
 */

class WorkflowPushService {
  constructor(options) {
    this.notificationService = options.notificationService;
    this.workflowEmitter = options.workflowEmitter;
    this.rules = {
      onWorkflowStart: true,
      onStageComplete: false,  // 默认关闭阶段完成通知，避免过多消息
      onProgressUpdate: false, // 默认关闭进度更新通知
      onError: true,
      onWorkflowComplete: true
    };

    // 如果提供了初始规则，则合并
    if (options.pushRules) {
      this.rules = { ...this.rules, ...options.pushRules };
    }

    // 绑定事件监听器
    this.bindEventListeners();
  }

  /**
   * 绑定工作流事件监听器
   */
  bindEventListeners() {
    if (!this.workflowEmitter) {
      console.warn('⚠️  未提供工作流事件发射器，推送服务将不可用');
      return;
    }

    // 监听任务开始事件
    if (this.rules.onWorkflowStart) {
      this.workflowEmitter.on('taskStarted', async (task) => {
        try {
          await this.notificationService.sendTaskStarted(task);
          console.log(`✅ 已发送任务开始通知: ${task.id}`);
        } catch (error) {
          console.error(`❌ 发送任务开始通知失败: ${error.message}`);
        }
      });
    }

    // 监听进度更新事件
    if (this.rules.onProgressUpdate) {
      this.workflowEmitter.on('taskUpdate', async (task) => {
        try {
          await this.notificationService.sendTaskProgress(task);
          console.log(`✅ 已发送任务进度通知: ${task.id}, ${task.progress}%`);
        } catch (error) {
          console.error(`❌ 发送任务进度通知失败: ${error.message}`);
        }
      });
    }

    // 监听任务完成事件
    if (this.rules.onWorkflowComplete) {
      this.workflowEmitter.on('taskCompleted', async (task) => {
        try {
          await this.notificationService.sendTaskCompleted(task);
          console.log(`✅ 已发送任务完成通知: ${task.id}`);
        } catch (error) {
          console.error(`❌ 发送任务完成通知失败: ${error.message}`);
        }
      });
    }

    // 监听任务失败事件
    if (this.rules.onError) {
      this.workflowEmitter.on('taskFailed', async (task) => {
        try {
          await this.notificationService.sendTaskFailed(task);
          console.log(`✅ 已发送任务失败通知: ${task.id}`);
        } catch (error) {
          console.error(`❌ 发送任务失败通知失败: ${error.message}`);
        }
      });
    }
  }

  /**
   * 更新推送规则
   */
  updatePushRules(newRules) {
    this.rules = { ...this.rules, ...newRules };
    
    // 重新绑定事件监听器以适应新规则
    this.unbindEventListeners();
    this.bindEventListeners();
    
    console.log('🔄 推送规则已更新:', this.rules);
  }

  /**
   * 解绑所有事件监听器
   */
  unbindEventListeners() {
    if (!this.workflowEmitter) return;

    // 移除所有监听器
    this.workflowEmitter.removeAllListeners('taskStarted');
    this.workflowEmitter.removeAllListeners('taskUpdate');
    this.workflowEmitter.removeAllListeners('taskCompleted');
    this.workflowEmitter.removeAllListeners('taskFailed');
  }

  /**
   * 获取当前推送规则
   */
  getPushRules() {
    return this.rules;
  }

  /**
   * 测试推送服务
   */
  async testPushService() {
    try {
      const result = await this.notificationService.sendTestNotification();
      console.log('✅ 推送服务测试成功:', result);
      return result;
    } catch (error) {
      console.error('❌ 推送服务测试失败:', error.message);
      throw error;
    }
  }
}

module.exports = WorkflowPushService;
