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
const { exec } = require('child_process');
const path = require('path');

class DingTalkWebhook {
 constructor(config) {
    this.token = config.token;
    this.secret = config.secret;
    this.cliPath = config.cliPath || path.join(__dirname, '../../scripts/agency-cli.js');
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
   * 格式化响应消息
   */
  formatResponse(result, commandType) {
   const messages = {
      analyze: '✅ 需求分析完成\n\n' + result,
      design: '✅ 设计文档已生成\n\n' + result,
     code: '✅ 代码已生成\n\n' + result,
      test: '🧪 测试执行完成\n\n' + result,
     status: '📊 当前状态\n\n' + result,
      deploy: '🚀 部署已完成\n\n' + result,
    };

    return messages[commandType] || result;
  }

  /**
   * 处理 Webhook 请求
   */
  async handleWebhook(req, res) {
    try {
     const { timestamp, sign, text } = req.body;

      // 验证签名
      if (!this.verifySignature(timestamp, sign)) {
        res.status(401).json({ msgtype: 'text', text: { content: '签名验证失败' } });
        return;
      }

      // 解析命令
     const content = text?.content || '';
     const command = this.parseCommand(content);

      if (!command) {
        res.status(200).json({
          msgtype: 'text',
          text: {
           content: '❌ 未识别的命令\n\n支持的命令:\n/analyze [需求描述]\n/design [需求 ID]\n/code [设计 ID]\n/test [项目路径]\n/status [工作流 ID]\n/deploy [环境]'
          }
        });
        return;
      }

      // 执行命令
     const result = await this.executeCommand(command);
     const response = this.formatResponse(result, command.type);

      // 返回 Markdown 格式响应
      res.status(200).json({
        msgtype: 'markdown',
       markdown: {
          title: 'The Code Agency',
          text: response.replace(/\n/g, '\n\n')
        }
      });

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
