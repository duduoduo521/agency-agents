/**
 * 飞书机器人配置管理
 */

module.exports = {
 // 从环境变量读取配置
 token: process.env.FEISHU_TOKEN || 'your-feishu-token',
 secret: process.env.FEISHU_SECRET || '',
 
 // CLI 工具路径
 cliPath: process.env.AGENCY_CLI_PATH || './scripts/agency-cli.js',
 
 // Webhook 端口（与钉钉共用端口）
 webhookPort: parseInt(process.env.WEBHOOK_PORT) || 3001,
 
 // 速率限制配置
 rateLimit: {
   windowMs:60 * 1000, // 1 分钟
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 10,
 },
 
 // IP 白名单（可选）
 ipWhitelist: process.env.IP_WHITELIST?.split(',') || [],
};
