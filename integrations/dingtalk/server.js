#!/usr/bin/env node
/**
 * 钉钉机器人 Webhook 服务入口
 * 
 * 使用方法:
 * 1. 配置环境变量: DINGTALK_TOKEN, DINGTALK_SECRET
 * 2. 运行：node server.js
 * 3. 在钉钉后台配置 Webhook URL
 */

const express = require('express');
const DingTalkWebhook = require('./webhook');
const config = require('./config');

const app = express();
app.use(express.json());

// 初始化钉钉 Webhook 处理器
const dingtalk = new DingTalkWebhook(config);

// Webhook 端点
app.post('/api/webhooks/dingtalk', async (req, res) => {
 await dingtalk.handleWebhook(req, res);
});

// 健康检查端点
app.get('/health', (req, res) => {
 res.json({ status: 'ok', service: 'dingtalk-webhook' });
});

// 启动服务
const PORT = config.webhookPort;
app.listen(PORT, () => {
 console.log(`🤖 钉钉机器人 Webhook 服务已启动`);
 console.log(`   端口：${PORT}`);
 console.log(`   URL: http://localhost:${PORT}/api/webhooks/dingtalk`);
 console.log(`\n请在钉钉后台配置上述 URL 为 Webhook 地址`);
});

module.exports = app;
