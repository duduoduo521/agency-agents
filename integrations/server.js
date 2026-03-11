#!/usr/bin/env node
/**
 * 钉钉/飞书机器人集成服务 - 主入口
 * 
 * 功能:
 * - 统一管理钉钉和飞书 Webhook
 * - 提供消息通知服务
 * - 实现工作流状态推送
 * - 安全认证和速率限制
 */

const express = require('express');
const DingTalkWebhook = require('./dingtalk/webhook');
const FeishuWebhook = require('./feishu/webhook');
const NotificationService = require('./shared/notification');
const WorkflowPushService = require('./shared/workflow-push');
const AuthManager = require('./shared/auth');
const dingtalkConfig = require('./dingtalk/config');
const feishuConfig = require('./feishu/config');

// 初始化 Express 应用
const app = express();
app.use(express.json());

// 初始化认证管理器
const authManager = new AuthManager({
 tokens: [dingtalkConfig.token, feishuConfig.token].filter(Boolean),
 secrets: {
   dingtalk: dingtalkConfig.secret,
   feishu: feishuConfig.secret
 },
 ipWhitelist: [...new Set([...dingtalkConfig.ipWhitelist, ...feishuConfig.ipWhitelist])],
 rateLimits: dingtalkConfig.rateLimit
});

// 初始化通知服务
const notificationService = new NotificationService({
 dingtalk: dingtalkConfig,
 feishu: feishuConfig,
 enabled: true
});

// 创建工作流事件发射器（模拟）
const workflowEmitter = new (require('events').EventEmitter)();

// 初始化工作流推送服务
const workflowPushService = new WorkflowPushService({
 notificationService,
 workflowEmitter,
 pushRules: {
   onWorkflowStart: true,
   onStageComplete: true,
   onError: true,
   onWorkflowComplete: true
 }
});

// 初始化 Webhook 处理器
const dingtalk = new DingTalkWebhook(dingtalkConfig);
const feishu = new FeishuWebhook(feishuConfig);

// ==================== Webhook 端点 ====================

// 钉钉 Webhook
app.post('/api/webhooks/dingtalk', async (req, res) => {
 const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
 
 // IP 白名单检查
 if (!authManager.isIpAllowed(clientIp)) {
   console.warn(`⚠️  IP 不在白名单：${clientIp}`);
   res.status(403).json({ msgtype: 'text', text: { content: 'IP 不允许访问' } });
   return;
 }
 
 // 速率限制检查
 const rateLimit = authManager.checkRateLimit(clientIp);
 if (!rateLimit.allowed) {
   console.warn(`⚠️  速率限制：${clientIp}，剩余：${rateLimit.remaining}`);
   res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
   res.setHeader('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());
   res.status(429).json({ msgtype: 'text', text: { content: '请求过于频繁，请稍后再试' } });
   return;
 }
 
 await dingtalk.handleWebhook(req, res);
});

// 飞书 Webhook
app.post('/api/webhooks/feishu', async (req, res) => {
 const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
 
 // IP 白名单检查
 if (!authManager.isIpAllowed(clientIp)) {
   console.warn(`⚠️  IP 不在白名单：${clientIp}`);
   res.status(403).json({ msg_type: 'text', content: { text: 'IP 不允许访问' } });
   return;
 }
 
 // 速率限制检查
 const rateLimit = authManager.checkRateLimit(clientIp);
 if (!rateLimit.allowed) {
   console.warn(`⚠️  速率限制：${clientIp}，剩余：${rateLimit.remaining}`);
   res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
   res.setHeader('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());
   res.status(429).json({ msg_type: 'text', content: { text: '请求过于频繁，请稍后再试' } });
   return;
 }
 
 await feishu.handleWebhook(req, res);
});

// ==================== 管理端点 ====================

// 健康检查
app.get('/health', (req, res) => {
 res.json({
   status: 'ok',
   services: {
     dingtalk: 'ready',
     feishu: 'ready',
     notification: 'ready',
     workflowPush: 'ready'
   },
   timestamp: new Date().toISOString()
 });
});

// 获取配置状态
app.get('/api/status', (req, res) => {
 res.json({
   dingtalk: {
     configured: !!dingtalkConfig.token,
     port: dingtalkConfig.webhookPort
   },
   feishu: {
     configured: !!feishuConfig.token,
     port: feishuConfig.webhookPort
   },
   notification: {
     enabled: notificationService.enabled
   },
   workflowPush: {
     rules: workflowPushService.getPushRules()
   },
   security: {
     rateLimit: authManager.rateLimits,
     ipWhitelistSize: authManager.ipWhitelist.size
   }
 });
});

// 更新推送规则
app.post('/api/push-rules', (req, res) => {
 const newRules = req.body;
 workflowPushService.updatePushRules(newRules);
 res.json({ success: true, rules: workflowPushService.getPushRules() });
});

// 测试通知
app.post('/api/test-notification', async (req, res) => {
 const { type = 'test' } = req.body;
 
 const testMessage = {
  type: 'test',
   content: '🧪 这是一条测试通知',
   formatted: {
     dingtalk: {
       msgtype: 'markdown',
      markdown: {
        title: '测试通知',
        text: '## 🧪 测试通知\n\n如果您收到此消息，说明通知系统工作正常。'
       }
     },
    feishu: {
       msg_type: 'interactive',
      card: {
        header: {
         title: { tag: 'plain_text', content: '🧪 测试通知' },
          template: 'blue'
        },
        elements: [
         {
           tag: 'markdown',
          content: '如果您收到此消息，说明通知系统工作正常。'
         }
        ]
      }
    }
   }
 };
 
 try {
   const results = await notificationService.sendToAll(testMessage);
   res.json({ success: true, results });
 } catch (error) {
   res.status(500).json({ success: false, error: error.message });
 }
});

// ==================== 错误处理 ====================

// 404 处理
app.use((req, res) => {
 res.status(404).json({
   error: 'Not Found',
   message: '请求的接口不存在'
 });
});

// 全局错误处理
app.use((err, req, res, next) => {
 console.error('服务器错误:', err);
 res.status(500).json({
   error: 'Internal Server Error',
   message: err.message
 });
});

// ==================== 启动服务 ====================

const PORT= process.env.WEBHOOK_PORT || 3001;

app.listen(PORT, () => {
 console.log('\n========================================');
console.log('🤖 The Code Agency- 机器人集成服务');
console.log('========================================\n');
console.log(`📡 服务已启动`);
console.log(`   端口：${PORT}`);
console.log(`   URL: http://localhost:${PORT}\n`);
 
 console.log('📋 Webhook 端点:');
console.log(`   钉钉：POST /api/webhooks/dingtalk`);
console.log(`   飞书：POST /api/webhooks/feishu\n`);
 
 console.log('🔧 管理端点:');
console.log(`   GET  /health              - 健康检查`);
console.log(`   GET  /api/status          - 查看状态`);
console.log(`   POST /api/push-rules      - 更新推送规则`);
console.log(`   POST /api/test-notification - 测试通知\n`);
 
 console.log('💡 提示：');
console.log(`   请确保已配置环境变量:`);
console.log(`   - DINGTALK_TOKEN, DINGTALK_SECRET`);
console.log(`   - FEISHU_TOKEN, FEISHU_SECRET`);
console.log(`   - GUI_URL (Web 控制台地址)\n`);
 
 console.log('========================================\n');
});

module.exports = app;
