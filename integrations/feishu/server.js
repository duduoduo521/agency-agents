#!/usr/bin/env node
/**
 * 飞书机器人 Webhook 服务入口
 * 
 * 使用方法:
 * 1. 配置环境变量：FEISHU_TOKEN, FEISHU_SECRET
 * 2. 运行：node feishu-server.js
 * 3. 在飞书后台配置 Webhook URL
 */

const express = require('express');
const FeishuWebhook = require('./webhook');
const config = require('./config');

const app = express();
app.use(express.json());

// 初始化飞书 Webhook 处理器
const feishu = new FeishuWebhook(config);

// Webhook 端点
app.post('/api/webhooks/feishu', async (req, res) => {
 await feishu.handleWebhook(req, res);
});

// 健康检查端点
app.get('/health', (req, res) => {
 res.json({ status: 'ok', service: 'feishu-webhook' });
});

// 启动服务
const PORT = config.webhookPort;
app.listen(PORT, () => {
 console.log(`🤖 飞书机器人 Webhook 服务已启动`);
console.log(`   端口：${PORT}`);
console.log(`   URL: http://localhost:${PORT}/api/webhooks/feishu`);
console.log(`\n请在飞书后台配置上述 URL 为 Webhook 地址`);
});

module.exports = app;
