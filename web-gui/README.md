# The Code Agency - Web GUI

Web GUI 是 The Code Agency 项目的可视化操作平台，提供了友好的中文界面，让用户能够轻松地启动和管理工作流任务。

## 功能特性

- **可视化操作界面**：提供直观的图形界面，无需命令行操作
- **任务管理**：实时监控任务状态和进度
- **工作流控制**：启动、暂停、重启和管理工作流
- **代理配置**：管理和配置各种AI代理
- **系统设置**：配置API密钥和其他系统参数
- **健康检查**：系统功能测试和诊断

## 页面介绍

- **首页**：显示系统概览和统计信息
- **任务管理**：创建、查看和管理开发任务
- **工作流**：管理工作流模板和执行实例
- **代理管理**：查看和配置AI代理状态
- **系统测试**：系统功能测试和诊断
- **设置**：系统配置和API密钥管理

## 技术栈

- **前端框架**: React 18+
- **UI库**: Ant Design
- **构建工具**: Vite
- **路由**: React Router DOM
- **HTTP客户端**: Axios

## 开发指南

### 安装依赖

```bash
cd web-gui
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## API 集成

Web GUI 与后端 API 服务集成，需要确保后端服务正在运行：

- 后端服务地址: `http://localhost:3000`
- API 端点: `/api/*`

## 设计理念

- **中文友好**：所有界面元素均使用中文
- **操作简单**：简化复杂操作为简单的点击
- **实时反馈**：提供任务状态的实时更新
- **错误处理**：优雅处理各种错误情况

## 组件规范

所有组件遵循以下规范：

- 使用 Ant Design 组件库
- 统一的样式和间距
- 响应式设计
- 错误边界保护
- 加载状态处理

## 路由结构

- `/` - 首页
- `/task` - 任务管理
- `/workflow` - 工作流
- `/agent` - 代理管理
- `/test` - 系统测试
- `/settings` - 设置

## 测试页面

系统测试页面提供以下功能：

- API 连接测试
- 组件渲染测试
- 路由功能测试
- 系统健康检查

# The Code Agency Web GUI

可视化工作流操作平台 - 基于 React + TypeScript + Ant Design

## 🚀 快速开始

### 安装依赖

```bash
cd web-gui
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
web-gui/
├── src/
│   ├── components/     # 可复用组件
│   ├── pages/         # 页面组件
│   │   ├── HomePage.tsx       # 首页
│   │   ├── WorkflowPage.tsx   # 工作流管理
│   │   ├── AgentPage.tsx      # 代理管理
│   │   └── SettingsPage.tsx   # 设置页面
│   ├── layouts/       # 布局组件
│   │   └── MainLayout.tsx     # 主框架布局
│   ├── utils/         # 工具函数
│   ├── hooks/         # 自定义 Hooks
│   ├── styles/        # 样式文件
│   ├── App.tsx        # 根组件
│   └── main.tsx       # 入口文件
├── public/            # 静态资源
├── index.html         # HTML 模板
├── vite.config.ts     # Vite 配置
├── tsconfig.json      # TypeScript 配置
└── package.json       # 项目依赖
```

## 🎯 功能特性

### 1. 主框架布局 (MainLayout)
- ✅ 响应式侧边栏导航
- ✅ 顶部标题栏
- ✅ 可折叠菜单
- ✅ 全中文界面

### 2. 首页 (HomePage)
- ✅ 数据统计面板（工作流、代理、项目）
- ✅ 快速操作按钮
- ✅ 可视化数据展示

### 3. 工作流管理 (WorkflowPage)
- ✅ 工作流列表表格
- ✅ 状态标签（待处理/进行中/已完成/失败）
- ✅ 进度条显示
- ✅ 操作按钮（查看/启动）

### 4. 代理管理 (AgentPage)
- ✅ 代理列表展示
- ✅ 状态管理（空闲/忙碌/未激活）
- ✅ 专业领域显示
- ✅ 配置和测试功能

### 5. 设置页面 (SettingsPage)
- ✅ AI 模型配置（Qwen/GPT/Claude）
- ✅ 温度参数调节
- ✅ 工作流设置
- ✅ CLI 集成配置

## 🛠️ 技术栈

- **React 18.3** - UI 框架
- **TypeScript 5.6** - 类型系统
- **Vite 6** - 构建工具
- **Ant Design 5** - UI 组件库
- **React Router 6** - 路由管理
- **Day.js** - 日期处理

## 📝 开发说明

### 添加新页面

1. 在 `src/pages/` 创建新的页面组件
2. 在 `src/App.tsx` 中添加路由
3. 在 `src/layouts/MainLayout.tsx` 中添加菜单项

### 自定义主题

编辑 `src/main.tsx` 中的 `ConfigProvider`:

```tsx
<ConfigProvider
  locale={zhCN}
  theme={{
    token: {
     colorPrimary: '#1677ff',
      borderRadius: 6,
    },
  }}
>
```

### 集成 CLI 命令

使用 Node.js 的 `child_process` 模块调用 CLI:

```typescript
import { exec } from 'child_process';

exec('agency analyze-requirements "需求描述"', (error, stdout) => {
  if (error) {
   console.error(error);
    return;
  }
  console.log(stdout);
});
```

## 🌐 浏览器支持

- Chrome >= 90
- Firefox >= 90
- Safari >= 14
- Edge >= 90

## 📄 License

MIT

---

**创建日期**: 2026-05-05  
**版本**: 1.0.0  
**状态**: 开发中
