# 钉钉/飞书机器人集成

## 📖 概述

本模块提供了钉钉和飞书机器人的完整集成方案，支持通过聊天命令控制工作流，实现企业级消息通知和状态推送。

### 核心功能

- ✅ **双向通信**: 接收用户命令，返回执行结果
- ✅ **多平台支持**: 同时支持钉钉和飞书
- ✅ **统一架构**: 共享认证、通知、推送服务
- ✅ **安全机制**: Token 验证、签名校验、IP 白名单、速率限制
- ✅ **自动推送**: 工作流状态变更主动通知
- ✅ **富文本消息**: Markdown、交互式卡片

---

## 🏗️ 架构设计

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  钉钉/飞书   │ ───> │  Webhook 服务  │ ───> │  GUI 后端    │
│  机器人     │ <─── │              │ <─── │             │
└─────────────┘      └──────────────┘      └─────────────┘
                              │                     │
                              │                     ↓
                              │            ┌─────────────┐
                              └───────────>│ 工作流引擎  │
                                           └─────────────┘
```

### 目录结构

```
integrations/
├── server.js                   # 主服务入口
├── ARCHITECTURE.md              # 架构设计文档
├── dingtalk/                    # 钉钉集成
│   ├── webhook.js             # Webhook 处理器
│   ├── config.js              # 配置管理
│   ├── message-format.js      # 消息格式化
│   ├── server.js              # 独立服务入口
│   └── README.md               # 使用文档
├── feishu/                      # 飞书集成
│   ├── webhook.js             # Webhook 处理器
│   ├── config.js              # 配置管理
│   ├── message-format.js      # 消息格式化
│   ├── server.js              # 独立服务入口
│   └── README.md               # 使用文档
└── shared/                      # 共享模块
    ├── notification.js        # 通知服务
    ├── auth.js                # 认证模块
    ├── utils.js               # 工具函数
    └── workflow-push.js       # 工作流推送服务
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd integrations
npm install express body-parser crypto rate-limiter-flexible
```

### 2. 配置环境变量

```bash
# 钉钉配置
export DINGTALK_TOKEN="your-dingtalk-token"
export DINGTALK_SECRET="your-dingtalk-secret"

# 飞书配置
export FEISHU_TOKEN="your-feishu-token"
export FEISHU_SECRET="your-feishu-secret"

# 通用配置
export AGENCY_CLI_PATH="./scripts/agency-cli.js"
export WEBHOOK_PORT=3001
export GUI_URL="http://localhost:3000"
```

### 3. 启动服务

```bash
node server.js
```

输出:
```
========================================
🤖 The Code Agency - 机器人集成服务
========================================

📡 服务已启动
   端口：3001
   URL: http://localhost:3001

📋 Webhook 端点:
   钉钉：POST /api/webhooks/dingtalk
  飞书：POST /api/webhooks/feishu

🔧 管理端点:
  GET  /health             - 健康检查
  GET  /api/status          - 查看状态
   POST /api/push-rules      - 更新推送规则
   POST /api/test-notification- 测试通知

💡 提示：
   请确保已配置环境变量...
========================================
```

### 4. 配置机器人

#### 钉钉
1. 进入钉钉管理后台
2. 创建自定义机器人
3. 添加 Webhook
4. 配置加签设置（记录 secret）
5. 将 Webhook URL 指向：`http://your-server:3001/api/webhooks/dingtalk`

#### 飞书
1. 登录 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 添加机器人能力
4. 配置事件订阅
5. 配置请求 URL 为：`http://your-server:3001/api/webhooks/feishu`

---

## 💬 支持的命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `/analyze` | 需求分析 | `/analyze 需要一个用户登录系统` |
| `/design` | 生成设计文档 | `/design login-system` |
| `/code` | 生成代码 | `/code login-design` |
| `/test` | 运行测试 | `/test ./my-project` |
| `/status` | 查询状态 | `/status workflow-123` |
| `/deploy` | 部署应用 | `/deploy production` |

---

## 🔧 API 参考

### Webhook 端点

#### POST /api/webhooks/dingtalk
接收钉钉消息。

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

#### POST /api/webhooks/feishu
接收飞书消息。

**请求体:**
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

### 管理端点

#### GET /health
健康检查。

**响应:**
```json
{
  "status": "ok",
  "services": {
    "dingtalk": "ready",
    "feishu": "ready",
    "notification": "ready",
    "workflowPush": "ready"
  },
  "timestamp": "2026-06-30T12:00:00.000Z"
}
```

#### GET /api/status
查看服务状态。

**响应:**
```json
{
  "dingtalk": {
    "configured": true,
    "port": 3001
  },
  "feishu": {
    "configured": true,
    "port": 3001
  },
  "notification": {
    "enabled": true
  },
  "workflowPush": {
    "rules": {
      "onWorkflowStart": true,
      "onStageComplete": true,
      "onError": true,
      "onWorkflowComplete": true
    }
  },
  "security": {
    "rateLimit": {
      "windowMs": 60000,
      "maxRequests": 10
    },
    "ipWhitelistSize": 5
  }
}
```

#### POST /api/push-rules
更新推送规则。

**请求体:**
```json
{
  "onWorkflowStart": true,
  "onStageComplete": false,
  "onError": true,
  "onWorkflowComplete": true
}
```

#### POST /api/test-notification
测试通知功能。

**响应:**
```json
{
  "success": true,
  "results": [
    { "platform": "dingtalk", "success": true },
    { "platform": "feishu", "success": true }
  ]
}
```

---

## 🔒 安全机制

### 1. Token 验证
每个机器人配置独立的 Token，每次请求必须携带有效 Token。

### 2. 签名校验
- **钉钉**: HMAC-SHA256 + Base64 编码
- **飞书**: HMAC-SHA256 + URL 编码

### 3. IP 白名单
只允许企业网络的 IP 访问，支持动态更新。

### 4. 速率限制
- 每个用户每分钟最多 10 条命令
- 防止滥用和 DDoS 攻击

---

## 📢 通知类型

### 1. 工作流启动通知
```
🚀 工作流已启动
- 工作流 ID: workflow-123
- 当前阶段：需求分析
- 预计时间：5 分钟
```

### 2. 阶段完成通知
```
📋 需求分析 完成
## 功能概述
- 用户登录
- 权限管理
...
```

### 3. 错误告警通知
```
❌ 工作流执行失败
- 工作流 ID: workflow-123
- 错误信息：XXX
[查看日志] [重新执行]
```

### 4. 每日站会报告
```
📊 每日站会报告 -2026-06-30
### 今日概览
- 启动工作流：10 个
- 完成工作流：8 个
- 失败工作流：2 个
```

---

## 🎯 高级功能

### 工作流状态推送

当工作流状态变更时，自动推送通知：

```javascript
const workflowEmitter = new EventEmitter();

// 监听工作流启动
workflowEmitter.on('workflow:start', (data) => {
 console.log('工作流启动:', data);
});

// 监听阶段完成
workflowEmitter.on('workflow:stageComplete', (data) => {
 console.log('阶段完成:', data);
});
```

### 自定义推送规则

```javascript
workflowPushService.updatePushRules({
  onWorkflowStart: true,
  onStageComplete: true,
  onError: false,        // 禁用错误推送
  onWorkflowComplete: true
});
```

---

## 🐛 故障排查

### 查看日志
```bash
tail -f logs/integration.log
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

**Q: 速率限制触发？**
- 降低命令发送频率
- 调整 `RATE_LIMIT_MAX` 环境变量

---

## 📊 监控指标

### 关键指标
- Webhook 请求量
- 命令执行成功率
- 平均响应时间
- 推送消息到达率

### 日志记录
- 所有 Webhook 请求
- 命令执行结果
- 错误和异常
- 安全事件

---

## 🔮 扩展方向

### 支持更多平台
- 企业微信
- Slack
- Microsoft Teams

### 自定义命令
- 支持企业自定义命令
- 插件式命令扩展

### 多租户
- 支持多个企业同时使用
- 数据隔离和权限控制

---

## 📚 相关文档

- [架构设计文档](./ARCHITECTURE.md)
- [钉钉使用指南](./dingtalk/README.md)
- [飞书使用指南](./feishu/README.md)

---

**创建日期**: 2026-06-30  
**版本**: 1.0  
**状态**: 就绪 ✅
