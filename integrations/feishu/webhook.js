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
const { exec } = require('child_process');
const path = require('path');

class FeishuWebhook {
 constructor(config) {
    this.token = config.token;
    this.secret = config.secret;
    this.cliPath = config.cliPath || path.join(__dirname, '../../scripts/agency-cli.js');
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
    };

  for (const [cmd, handler] of Object.entries(commands)) {
     if (content.startsWith(cmd)) {
      const args = content.slice(cmd.length).trim();
        return handler(args);
      }
    }

    return null;
  }

  /**
   * 执行 CLI 命令
   */
  executeCommand(commandObj) {
    return new Promise((resolve, reject) => {
      let cliCommand = `node ${this.cliPath} ${commandObj.type}`;
      
     if (commandObj.params) {
        cliCommand += ` "${commandObj.params}"`;
      }

      exec(cliCommand, { encoding: 'utf8' }, (error, stdout, stderr) => {
       if (error) {
          reject(new Error(`执行失败：${stderr || error.message}`));
          return;
        }
        resolve(stdout);
      });
    });
  }

  /**
   * 格式化响应消息为飞书的 Interactive Card 格式
   */
  formatResponse(result, commandType) {
 const emojis = {
      analyze: '📋',
      design: '🎨',
    code: '💻',
      test: '🧪',
    status: '📊',
      deploy: '🚀'
    };

   const emoji = emojis[commandType] || '✅';
    
    // 飞书卡片模板
    return {
      msg_type: 'interactive',
      card: {
        header: {
          title: {
           tag: 'plain_text',
          content: `${emoji} The Code Agency`
          },
         template: commandType === 'error' ? 'red' : 'blue'
        },
        elements: [
          {
           tag: 'markdown',
           content: result.replace(/\n/g, '\n\n')
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
              url: `${process.env.GUI_URL}/workflow/latest`,
              type: 'primary'
             }
           ]
          }
        ]
      }
    };
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
    const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    const textContent = parsedContent.text || parsedContent.content || '';

      // 解析命令
    const command = this.parseCommand(textContent);

     if (!command) {
        res.json({
          msg_type: 'text',
         content: {
           text: '❌ 未识别的命令\n\n支持的命令:\n/analyze [需求描述]\n/design [需求 ID]\n/code [设计 ID]\n/test [项目路径]\n/status [工作流 ID]\n/deploy [环境]'
          }
        });
        return;
      }

      // 执行命令
    const result = await this.executeCommand(command);
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
