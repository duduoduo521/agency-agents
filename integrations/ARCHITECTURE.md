# 钉钉/飞书机器人集成架构设计

## 整体架构

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

## 核心功能模块

### 1. Webhook 服务层
- **钉钉 Webhook**: `/api/webhooks/dingtalk`
- **飞书 Webhook**: `/api/webhooks/feishu`
- **命令解析器**: 识别聊天命令并映射到工作流
- **消息路由器**: 分发请求到对应的处理函数

### 2. 命令映射系统
将聊天命令映射到 GUI 功能:
- `/analyze [需求描述]` → 需求分析
- `/design [需求 ID]` → 生成设计
- `/code [设计 ID]` → 生成代码
- `/test [项目路径]` → 运行测试
- `/deploy [环境]` → 部署应用
- `/status [工作流 ID]` → 查询状态

### 3. 通知处理器
- 工作流启动通知
- 阶段完成通知
- 错误告警通知
- 每日站会报告

### 4. 安全认证
- Token 验证
- IP 白名单
- 签名校验
- 速率限制

## 数据流转

### 用户发起命令
```
用户 → 钉钉/飞书 → Webhook → 命令解析 → GUI API → 工作流执行
```

### 结果返回
```
工作流结果 → GUI API → 消息格式化 → 钉钉/飞书 API → 用户
```

### 主动推送
```
工作流状态变更 → 事件监听 → 消息队列 → 推送服务 → 钉钉/飞书
```

## 技术选型

### Webhook 服务
- **框架**: Express.js (轻量级)
- **验证**: JWT + HMAC 签名
- **日志**: Winston (结构化日志)

### 消息队列
- **工具**: Bull (基于 Redis)
- **用途**: 异步消息推送、任务排队

### 数据库
- **SQLite**: 存储配置和会话状态
- **Redis**: 缓存和消息队列

## 目录结构

```
integrations/
├── dingtalk/
│   ├── webhook.js         # 钉钉 Webhook 处理器
│   ├── command-handler.js  # 命令处理
│   ├── message-format.js  # 消息格式化
│   └── config.js          # 配置管理
├── feishu/
│   ├── webhook.js         # 飞书 Webhook 处理器
│   ├── command-handler.js  # 命令处理
│   ├── message-format.js  # 消息格式化
│   └── config.js          # 配置管理
├── shared/
│   ├── auth.js            # 认证模块
│   ├── notification.js    # 通知服务
│   └── utils.js           # 工具函数
└── README.md               # 使用文档
```

## 接口设计

### Webhook 接收接口

```javascript
POST /api/webhooks/dingtalk
Content-Type: application/json

{
  "text": {
    "content": "/analyze 需要一个用户登录系统"
  },
  "senderId": "user123",
  "conversationId": "conv456"
}
```

### 消息发送接口

```javascript
// 内部调用
notification.sendToDingTalk({
  userId: 'user123',
  type: 'markdown',
 content: '## 工作流已启动\n- 阶段：需求分析\n- 预计时间：5 分钟'
});
```

## 安全机制

### 1. Token 验证
- 每个机器人配置独立的 Token
- Token 存储在环境变量或配置中心
- 每次请求必须携带有效 Token

### 2. 签名校验
- 钉钉：使用 HMAC-SHA256 签名
- 飞书：使用 Base64 编码签名
- 防止伪造请求

### 3. IP 白名单
- 只允许企业网络的 IP 访问
- 支持动态更新白名单

### 4. 速率限制
- 每个用户每分钟最多 10 条命令
- 防止滥用和 DDoS 攻击

## 监控与日志

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

## 扩展性设计

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

**架构师**: System Architect  
**创建日期**: 2026-06-30  
**版本**: 1.0  
**下一步**: 实现钉钉和飞书机器人集成
