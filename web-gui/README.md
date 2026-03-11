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
