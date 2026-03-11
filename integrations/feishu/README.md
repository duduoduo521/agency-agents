# 飞书机器人集成指南

## 快速开始

### 1. 安装依赖

```bash
cd integrations
npm install express body-parser crypto rate-limiter-flexible
```

### 2. 配置环境变量

```bash
export FEISHU_TOKEN="your-webhook-token"
export FEISHU_SECRET="your-secret"  # 可选，用于签名验证
export AGENCY_CLI_PATH="./scripts/agency-cli.js"
export WEBHOOK_PORT=3001
export GUI_URL="http://localhost:3000"
```

### 3. 启动服务

```bash
node feishu/server.js
```

### 4. 在飞书开放平台配置机器人

1. 登录 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 添加机器人能力
4. 配置事件订阅（接收消息）
5. 配置请求 URL 为：`http://your-server:3001/api/webhooks/feishu`
6. 复制 Verification Token 和 Encrypt Key 到环境变量

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
飞书支持多种消息类型，包括文本、富文本和交互式卡片。

```json
{
  "event": {
    "message": {
      "content": "{\"text\":\"/analyze 需要一个用户登录系统\"}",
      "msg_type": "text"
    }
  },
  "challenge": "verification-string"  // 首次配置时需要
}
```

### 交互式卡片（响应）
```json
{
  "msg_type": "interactive",
  "card": {
    "header": {
      "title": {
        "tag": "plain_text",
        "content": "🚀 The Code Agency"
      },
      "template": "blue"
    },
    "elements": [
      {
        "tag": "markdown",
        "content": "✅ 需求分析完成\n\n## 功能概述..."
      }
    ]
  }
}
```

## 飞书特色功能

### 交互式卡片
飞书支持丰富的交互式卡片，包括：
- 按钮操作
- 下拉菜单
- 表单输入
- 数据展示

### 挑战验证
首次配置 Webhook 时，飞书会发送挑战请求：
```json
{
  "challenge": "verification-string"
}
```
服务需要原样返回该字符串以完成验证。

### 签名验证
飞书使用 HMAC-SHA256 签名，确保消息来源可信。

## 安全配置

### Token 验证
每次请求必须携带有效的 Token。

### 签名校验（推荐）
使用 HMAC-SHA256 对请求进行签名，防止伪造。

### IP 白名单
只允许飞书服务器的 IP 访问。

### 速率限制
每个用户每分钟最多 10 条命令。

## 高级功能

### 工作流状态推送
当工作流状态变更时，主动推送消息到飞书群。

### 每日站会报告
每天早上 9 点自动发送前一天的工作流统计报告。

### 错误告警
工作流执行失败时，立即通知相关负责人。

### @机器人触发
支持通过@机器人触发命令：
```
@TheCodeBot /analyze 需要一个用户登录系统
```

## 故障排查

### 查看日志
```bash
tail -f logs/feishu.log
```

### 测试连接
```bash
curl -X GET http://localhost:3001/health
```

### 常见问题

**Q: 挑战验证失败？**
- 确保正确返回 challenge 字符串
- 检查 Content-Type 是否为 application/json

**Q: 收不到消息？**
- 检查事件订阅是否开启
- 确认权限配置正确
- 验证 Token 和 Secret 配置

**Q: 命令执行失败？**
- 检查 CLI 工具路径是否正确
- 确认有执行权限
- 查看详细错误日志

## API 参考

### POST /api/webhooks/feishu
接收飞书消息的 Webhook 端点。

**请求头:**
- `Content-Type: application/json`
- `X-Feishu-Timestamp`: 时间戳
- `X-Feishu-Signature`: 签名

**请求体（挑战验证）:**
```json
{
  "challenge": "verification-string",
  "type": "url_verification"
}
```

**请求体（接收消息）:**
```json
{
  "header": {
    "msg_id": "message-id",
    "create_time": "timestamp"
  },
  "event": {
    "message": {
      "content": "{\"text\":\"/analyze 需求描述\"}",
      "msg_type": "text"
    }
  }
}
```

**响应（挑战验证）:**
```json
{
  "challenge": "verification-string"
}
```

**响应（消息处理）:**
```json
{
  "msg_type": "interactive",
  "card": {...}
}
```

## 与钉钉的区别

| 特性 | 钉钉 | 飞书 |
|------|------|------|
| 消息类型 | Markdown | 交互式卡片 |
| 验证方式 | URL 参数 | HTTP 头 |
| 挑战验证 | 无 | 需要 |
| 按钮样式 | actionCard | interactive card |
| 富文本 | 支持 | 强项 |

## 下一步

- [ ] 实现更多交互式卡片模板
- [ ] 支持语音命令输入
- [ ] 添加审批流程集成
- [ ] 实现多语言支持

---

**创建日期**: 2026-06-30  
**版本**: 1.0  
**状态**: 就绪
