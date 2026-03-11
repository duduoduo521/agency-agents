/**
 * 钉钉消息格式化工具
 */

class MessageFormatter {
  /**
   * 格式化工作流启动消息
   */
  static formatWorkflowStart(workflowId, stage, estimatedTime) {
    return {
      msgtype: 'actionCard',
     actionCard: {
        title: '工作流已启动',
       text: `## 🚀 工作流已启动\n\n` +
              `- **工作流 ID**: ${workflowId}\n` +
              `- **当前阶段**: ${stage}\n` +
              `- **预计时间**: ${estimatedTime}\n\n` +
              `请稍候，完成后将通知您。`,
       btnOrientation: '0',
       singleTitle: '查看详情',
       singleURL: `${process.env.GUI_URL}/workflow/${workflowId}`
      }
    };
  }

  /**
   * 格式化阶段完成消息
   */
  static formatStageComplete(stage, result) {
  const emojis = {
      analyze: '📋',
      design: '🎨',
     code: '💻',
      test: '🧪',
      deploy: '🚀'
    };

    return {
      msgtype: 'markdown',
    markdown: {
        title: `${stage} 完成`,
       text: `## ${emojis[stage] || '✅'} ${this.getStageName(stage)} 完成\n\n` +
              `${result.substring(0, 500)}${result.length> 500 ? '...' : ''}\n\n` +
              `详细结果请查看 Web 控制台。`
      }
    };
  }

  /**
   * 格式化错误告警消息
   */
  static formatError(workflowId, errorMessage) {
    return {
      msgtype: 'actionCard',
     actionCard: {
        title: '❌ 工作流执行失败',
       text: `## ❌ 工作流执行失败\n\n` +
              `- **工作流 ID**: ${workflowId}\n` +
              `- **错误信息**: ${errorMessage}\n\n` +
              `请及时排查问题。`,
       btnOrientation: '1',
       btns: [
         { title: '查看日志', actionLink: `${process.env.GUI_URL}/logs/${workflowId}` },
         { title: '重新执行', actionLink: `${process.env.GUI_URL}/workflow/${workflowId}/retry` }
       ]
      }
    };
  }

  /**
   * 格式化每日站会报告
   */
  static formatDailyReport(date, stats) {
   let text = `## 📊 每日站会报告 - ${date}\n\n`;
    
   text += `### 今日概览\n`;
   text += `- 启动工作流：**${stats.started}** 个\n`;
   text += `- 完成工作流：**${stats.completed}** 个\n`;
   text += `- 失败工作流：**${stats.failed}** 个\n\n`;

  if (stats.topCommands && stats.topCommands.length > 0) {
     text += `### 常用命令\n`;
    stats.topCommands.forEach((cmd, index) => {
       text += `${index +1}. \`${cmd.name}\` - ${cmd.count} 次\n`;
     });
     text += '\n';
   }

   text += `### 系统状态\n`;
   text += `- 平均响应时间：${stats.avgResponseTime}ms\n`;
   text += `- 成功率：${stats.successRate}%\n`;

    return {
      msgtype: 'markdown',
    markdown: {
        title: '每日站会报告',
        text
      }
    };
  }

  /**
   * 获取阶段中文名称
   */
  static getStageName(stage) {
  const names = {
      analyze: '需求分析',
      design: '设计生成',
     code: '代码实现',
      test: '测试验证',
      deploy: '部署发布'
    };
    return names[stage] || stage;
  }
}

module.exports = MessageFormatter;
