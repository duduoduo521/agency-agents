/**
 * 飞书消息格式化工具
 * 
 * 参考：https://open.feishu.cn/document/ukTMukTMukTM/uEjNwUjLxYDM14SM2ATN
 */

class FeishuMessageFormatter {
  /**
   * 格式化工作流启动消息为飞书卡片
   */
  static formatWorkflowStart(workflowId, stage, estimatedTime) {
    return {
      msg_type: 'interactive',
     card: {
        header: {
          title: {
           tag: 'plain_text',
         content: '🚀 工作流已启动'
          },
         template: 'blue'
        },
        elements: [
          {
           tag: 'div',
           text: {
             tag: 'lark_md',
            content: `**工作流 ID**: ${workflowId}\n**当前阶段**: ${stage}\n**预计时间**: ${estimatedTime}`
            }
          },
          {
           tag: 'note',
            elements: [
             {
               tag: 'plain_text',
             content: '请稍候，完成后将通知您。'
             }
           ]
          },
          {
           tag: 'action',
            actions: [
             {
               tag: 'button',
              text: {
                 tag: 'plain_text',
              content: '查看详情'
               },
              url: `${process.env.GUI_URL}/workflow/${workflowId}`,
             type: 'primary'
             }
           ]
          }
        ]
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

   const emoji = emojis[stage] || '✅';
 const stageName = this.getStageName(stage);

    return {
      msg_type: 'interactive',
     card: {
        header: {
          title: {
           tag: 'plain_text',
         content: `${emoji} ${stageName} 完成`
          },
         template: 'green'
        },
        elements: [
          {
           tag: 'div',
           text: {
             tag: 'lark_md',
            content: result.length > 800 ? result.substring(0, 800) + '...' : result
            }
          },
          {
           tag: 'hr'
          },
          {
           tag: 'note',
            elements: [
             {
               tag: 'plain_text',
             content: '详细结果请查看 Web 控制台'
             }
           ]
          }
        ]
      }
    };
  }

  /**
   * 格式化错误告警消息
   */
  static formatError(workflowId, errorMessage) {
    return {
      msg_type: 'interactive',
     card: {
        header: {
          title: {
           tag: 'plain_text',
         content: '❌ 工作流执行失败'
          },
         template: 'red'
        },
        elements: [
          {
           tag: 'div',
           text: {
             tag: 'lark_md',
            content: `**工作流 ID**: ${workflowId}\n\n**错误信息**:\n${errorMessage}`
            }
          },
          {
           tag: 'action',
            actions: [
             {
               tag: 'button',
              text: {
                 tag: 'plain_text',
              content: '查看日志'
               },
              url: `${process.env.GUI_URL}/logs/${workflowId}`,
             type: 'default'
             },
             {
               tag: 'button',
              text: {
                 tag: 'plain_text',
              content: '重新执行'
               },
              url: `${process.env.GUI_URL}/workflow/${workflowId}/retry`,
             type: 'primary'
             }
           ]
          }
        ]
      }
    };
  }

  /**
   * 格式化每日站会报告
   */
  static formatDailyReport(date, stats) {
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
    content += '\n';
   }

  content += `### 系统状态\n`;
  content += `- 平均响应时间：${stats.avgResponseTime}ms\n`;
  content += `- 成功率：${stats.successRate}%\n`;

    return {
      msg_type: 'interactive',
     card: {
        header: {
          title: {
           tag: 'plain_text',
         content: '📊 每日站会报告'
          },
         template: 'blue'
        },
        elements: [
          {
           tag: 'markdown',
          content
          }
        ]
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

module.exports = FeishuMessageFormatter;
