# 钉钉机器人集成指南

## 快速开始

### 1. 安装依赖

```bash
cd integrations
npm install express body-parser crypto rate-limiter-flexible
```

### 2. 配置环境变量

```bash
export DINGTALK_TOKEN="your-webhook-token"
export DINGTALK_SECRET="your-secret"  # 可选，用于签名验证
export AGENCY_CLI_PATH="./scripts/agency-cli.js"
export WEBHOOK_PORT=3001
export GUI_URL="http://localhost:3000"
```

### 3. 启动服务

```bash
node dingtalk/server.js
```

### 4. 在钉钉后台配置机器人

1. 进入钉钉管理后台
2. 创建自定义机器人
3. 添加 webhook
4. 配置加签设置（记录 secret）
5. 将 Webhook URL 指向：`http://your-server:3001/api/webhooks/dingtalk`

## 支持的命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `/analyze` | 需求分析 | `/analyze 需要一个用户登录系统` |
| `/design` | 生成设计文档 | `/design login-system` |
| `/code` | 生成代码 | `/code login-design` |
| `/test` | 运行测试 | `/test ./my-project` |
| `/status` | 查询状态 | `/status workflow-123` |
| `/deploy` | 部署应用 | `/deploy production` |

## 消息格式

### 文本消息（接收）
```json
{
  "text": {
    "content": "/analyze 需要一个用户登录系统"
  },
  "senderId": "user123",
  "conversationId": "conv456"
}
```

### Markdown 消息（响应）
```json
{
  "msgtype": "markdown",
  "markdown": {
    "title": "The Code Agency",
    "text": "✅ 需求分析完成\n\n## 功能概述..."
  }
}
```

## 安全配置

### Token 验证
每次请求必须携带有效的 Token。

### 签名校验（推荐）
使用 HMAC-SHA256 对请求进行签名，防止伪造。

### IP 白名单
只允许钉钉服务器的 IP 访问。

### 速率限制
每个用户每分钟最多 10 条命令。

## 高级功能

### 工作流状态推送
当工作流状态变更时，主动推送消息到钉钉群。

### 每日站会报告
每天早上 9 点自动发送前一天的工作流统计报告。

### 错误告警
工作流执行失败时，立即通知相关负责人。

## 故障排查

### 查看日志
```bash
tail -f logs/dingtalk.log
```

### 测试连接
```bash
curl -X GET http://localhost:3001/health
```

### 常见问题

**Q: 收不到消息？**
- 检查 Webhook URL 是否正确
- 确认防火墙允许访问
- 验证 Token 和 Secret 配置

**Q: 命令执行失败？**
- 检查 CLI 工具路径是否正确
- 确认有执行权限
- 查看详细错误日志

## API 参考

### POST /api/webhooks/dingtalk
接收钉钉消息的 Webhook 端点。

**请求头:**
- `Content-Type: application/json`

**请求体:**
```json
{
  "timestamp": "1234567890",
  "sign": "encrypted-signature",
  "text": {
    "content": "/analyze 需求描述"
  }
}
```

**响应:**
```json
{
  "msgtype": "markdown",
  "markdown": {
    "title": "The Code Agency",
    "text": "执行结果..."
  }
}
```

## 下一步

- [ ] 实现飞书机器人集成
- [ ] 添加更多自定义命令
- [ ] 支持多租户配置
- [ ] 实现命令历史记录

---

**创建日期**: 2026-06-30  
**版本**: 1.0  
**状态**: 就绪
