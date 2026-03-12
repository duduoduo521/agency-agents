# 🎯 The Code Agency: 编码自动化工作流平台

> **专注编码领域的端到端自动化工作流** - 从需求分析到代码生成，从测试验证到部署发布。一个专注于编码领域的小而精的自动化工作流引擎。

[![GitHub stars](https://img.shields.io/github/stars/msitarzewski/agency-agents?style=social)](https://github.com/msitarzewski/agency-agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-pink?logo=github)](https://github.com/sponsors/msitarzewski)

---

## 🚀 这是什么？

源自一个 Reddit 讨论帖并经过数月迭代，**The Code Agency** 是一个精心打造的AI代理人格的集合。每个代理都是：

- **🎯 专业化**：在其领域具有深厚的专业知识（不是通用提示模板）
- **🧠 个性化**：独特的语言风格、沟通方式和方法
- **📋 交付导向**：真正的代码、流程和可衡量的结果
- **✅ 生产就绪**：经过实战检验的工作流程和成功指标

**你可以这样理解**：组建你的梦想团队，只是他们是永不睡觉、从不抱怨、总是按时交付的AI专家。

---

## ⚡ 快速开始

### 方案 1: 与 Claude Code 配合使用（推荐）

```
# 将代理复制到 Claude Code 目录
cp -r agency-agents/* ~/.claude/agents/

# 现在在 Claude Code 会话中激活任何代理：
# "Hey Claude, activate Frontend Developer mode and help me build a React component"
```

### 方案 2: 作为参考使用

每个代理文件包含：
- 身份和个性特征
- 核心使命和工作流程
- 带有代码示例的技术交付物
- 成功指标和沟通风格

浏览下面的代理并复制/调整你需要的！

### 方案 3: 与其他工具配合使用（Cursor, Aider, Windsurf, Gemini CLI, OpenCode）

```
# 第 1 步 -- 为所有支持的工具生成集成文件
./scripts/convert.sh

# 第 2 步 -- 交互式安装（自动检测你已安装的工具）
./scripts/install.sh

# 或直接针对特定工具
./scripts/install.sh --tool cursor
./scripts/install.sh --tool aider
./scripts/install.sh --tool windsurf
```

详情请参见下面的 [多工具集成](#-多工具集成) 部分。

---

## 🎨 代理团队

### 💻 工程部门

一次提交，构建未来。

| 代理 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🎨 [前端开发者](engineering/engineering-frontend-developer.md) | React/Vue/Angular, UI 实现, 性能 | 现代 Web 应用, 像素级完美 UI, 核心网页指标优化 |
| 🏗️ [后端架构师](engineering/engineering-backend-architect.md) | API 设计, 数据库架构, 可扩展性 | 服务端系统, 微服务, 云基础设施 |
| 📱 [移动应用构建者](engineering/engineering-mobile-app-builder.md) | iOS/Android, React Native, Flutter | 原生和跨平台移动应用 |
| 🤖 [AI 工程师](engineering/engineering-ai-engineer.md) | 机器学习模型, 部署, AI 集成 | 机器学习特性, 数据管道, AI 驱动的应用 |
| 🚀 [DevOps 自动化师](engineering/engineering-devops-automator.md) | CI/CD, 基础设施自动化, 云运维 | 流水线开发, 部署自动化, 监控 |
| ⚡ [快速原型师](engineering/engineering-rapid-prototyper.md) | 快速概念验证开发, MVP | 快速概念验证, 黑客马拉松项目, 快速迭代 |
| 💎 [高级开发者](engineering/engineering-senior-developer.md) | Laravel/Livewire, 高级模式 | 复杂实现, 架构决策 |
| 🔒 [安全工程师](engineering/engineering-security-engineer.md) | 威胁建模, 安全代码审查, 安全架构 | 应用安全, 漏洞评估, 安全 CI/CD |

### 🎨 设计部门

让一切变得美丽、易用、愉悦。

| 代理 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🎯 [UI 设计师](design/design-ui-designer.md) | 视觉设计, 组件库, 设计系统 | 界面创建, 品牌一致性, 组件设计 |
| 🔍 [UX 研究员](design/design-ux-researcher.md) | 用户测试, 行为分析, 研究 | 了解用户, 可用性测试, 设计洞察 |
| 🏛️ [UX 架构师](design/design-ux-architect.md) | 技术架构, CSS 系统, 实现 | 开发者友好的基础, 实现指导 |
| 🎭 [品牌守护者](design/design-brand-guardian.md) | 品牌标识, 一致性, 定位 | 品牌战略, 标识开发, 指南 |
| 📖 [视觉叙事者](design/design-visual-storyteller.md) | 视觉叙事, 多媒体内容 | 引人入胜的视觉故事, 品牌叙事 |
| ✨ [趣味注入器](design/design-whimsy-injector.md) | 个性, 愉悦, 有趣的交互 | 增加乐趣, 微交互, 彩蛋, 品牌个性 |
| 📷 [图像提示工程师](design/design-image-prompt-engineer.md) | AI 图像生成提示, 摄影 | Midjourney, DALL-E, Stable Diffusion 的摄影提示 |

### 📢 市场部门

一次真实互动，增长你的受众。

| 代理 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🚀 [增长黑客](marketing/marketing-growth-hacker.md) | 快速用户获取, 病毒循环, 实验 | 爆发式增长, 用户获取, 转化优化 |
| 📝 [内容创作者](marketing/marketing-content-creator.md) | 多平台内容, 编辑日历 | 内容策略, 抄袭写作, 品牌叙事 |
| 🐦 [Twitter 互动者](marketing/marketing-twitter-engager.md) | 实时互动, 思想领袖 | Twitter 策略, LinkedIn 活动, 专业社交 |
| 📱 [TikTok 策略师](marketing/marketing-tiktok-strategist.md) | 病毒内容, 算法优化 | TikTok 增长, 病毒内容, Z 世代/千禧一代受众 |
| 📸 [Instagram 策展者](marketing/marketing-instagram-curator.md) | 视觉叙事, 社区建设 | Instagram 策略, 美学发展, 视觉内容 |
| 🤝 [Reddit 社区建设者](marketing/marketing-reddit-community-builder.md) | 真实互动, 价值驱动内容 | Reddit 策略, 社区信任, 真实营销 |
| 📱 [应用商店优化师](marketing/marketing-app-store-optimizer.md) | ASO, 转化优化, 可发现性 | 应用营销, 商店优化, 应用增长 |
| 🌐 [社交媒体策略师](marketing/marketing-social-media-strategist.md) | 跨平台策略, 活动 | 整体社交策略, 多平台活动 |
| 📕 [小红书专家](marketing/marketing-xiaohongshu-specialist.md) | 生活方式内容, 趋势驱动策略 | 小红书增长, 美学叙事, Z 世代受众 |
| 💬 [微信公众号经理](marketing/marketing-wechat-official-account.md) | 订阅者互动, 内容营销 | 微信 OA 策略, 社区建设, 转化优化 |
| 🧠 [知乎策略师](marketing/marketing-zhihu-strategist.md) | 思想领袖, 知识驱动互动 | 知乎权威建设, 问答策略, 线索生成 |

### 📊 产品部门

在正确的时间构建正确的事情。

| 代理 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🎯 [冲刺优先级排序员](product/product-sprint-prioritizer.md) | 敏捷规划, 功能优先级排序 | 冲刺规划, 资源分配, 待办事项管理 |
| 🔍 [趋势研究员](product/product-trend-researcher.md) | 市场情报, 竞争分析 | 市场调研, 机会评估, 趋势识别 |
| 💬 [反馈综合员](product/product-feedback-synthesizer.md) | 用户反馈分析, 洞察提取 | 反馈分析, 用户洞察, 产品优先级 |

### 🎬 项目管理部门

让火车准时运行（并在预算内）。

| 代理 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🎬 [工作室制片人](project-management/project-management-studio-producer.md) | 高层次协调, 组合管理 | 多项目监督, 战略对齐, 资源分配 |
| 🐑 [项目牧羊人](project-management/project-management-project-shepherd.md) | 跨职能协调, 时间表管理 | 端到端项目协调, 利益相关者管理 |
| ⚙️ [工作室运营](project-management/project-management-studio-operations.md) | 日常效率, 流程优化 | 运营卓越, 团队支持, 生产力 |
| 🧪 [实验跟踪器](project-management/project-management-experiment-tracker.md) | A/B 测试, 假设验证 | 实验管理, 数据驱动决策, 测试 |
| 👔 [高级项目经理](project-management/project-manager-senior.md) | 现实范围界定, 任务转换 | 将规范转换为任务, 范围管理 |

### 🧪 测试部门

用户不必破坏的东西。

| 代理 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 📸 [证据收集器](testing/testing-evidence-collector.md) | 基于截图的 QA, 视觉证明 | UI 测试, 视觉验证, 错误文档 |
| 🔍 [现实检查器](testing/testing-reality-checker.md) | 基于证据的认证, 质量网关 | 生产准备情况, 质量批准, 发布认证 |
| 📊 [测试结果分析器](testing/testing-test-results-analyzer.md) | 测试评估, 指标分析 | 测试输出分析, 质量洞察, 覆盖报告 |
| ⚡ [性能基准测试器](testing/testing-performance-benchmarker.md) | 性能测试, 优化 | 速度测试, 负载测试, 性能调整 |
| 🔌 [API 测试器](testing/testing-api-tester.md) | API 验证, 集成测试 | API 测试, 端点验证, 集成 QA |
| 🛠️ [工具评估器](testing/testing-tool-evaluator.md) | 技术评估, 工具选择 | 评估工具, 软件推荐, 技术决策 |
| 🔄 [工作流优化器](testing/testing-workflow-optimizer.md) | 流程分析, 工作流改进 | 流程优化, 效率提升, 自动化机会 |
| ♿ [无障碍审计员](testing/testing-accessibility-auditor.md) | WCAG 审计, 辅助技术测试 | 无障碍合规, 屏幕阅读器测试, 包容性设计验证 |

### 🛟 支持部门

运营的骨干。

| 代理 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 💬 [支持响应者](support/support-support-responder.md) | 客户服务, 问题解决 | 客户支持, 用户体验, 支持操作 |
| 📊 [分析报告员](support/support-analytics-reporter.md) | 数据分析, 仪表板, 洞察 | 商业智能, KPI 跟踪, 数据可视化 |
| 💰 [财务跟踪器](support/support-finance-tracker.md) | 财务规划, 预算管理 | 财务分析, 现金流, 业务绩效 |
| 🏗️ [基础设施维护员](support/support-infrastructure-maintainer.md) | 系统可靠性, 性能优化 | 基础设施管理, 系统操作, 监控 |
| ⚖️ [法律合规检查器](support/support-legal-compliance-checker.md) | 合规性, 法规, 法律审查 | 法律合规, 监管要求, 风险管理 |
| 📑 [执行摘要生成器](support/support-executive-summary-generator.md) | 面向高管的沟通, 战略摘要 | 执行报告, 战略沟通, 决策支持 |

### 🥽 空间计算部门

构建沉浸式未来。

| 代理 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🏗️ [XR 界面架构师](spatial-computing/xr-interface-architect.md) | 空间交互设计, 沉浸式 UX | AR/VR/XR 界面设计, 空间计算 UX |
| 💻 [macOS 空间/Metal 工程师](spatial-computing/macos-spatial-metal-engineer.md) | Swift, Metal, 高性能 3D | macOS 空间计算, Vision Pro 原生应用 |
| 🌐 [XR 沉浸式开发者](spatial-computing/xr-immersive-developer.md) | WebXR, 基于浏览器的 AR/VR | 基于浏览器的沉浸式体验, WebXR 应用 |
| 🎮 [XR 驾驶舱交互专家](spatial-computing/xr-cockpit-interaction-specialist.md) | 驾驶舱式控制, 沉浸式系统 | 驾驶舱控制系统, 沉浸式控制界面 |
| 🍎 [visionOS 空间工程师](spatial-computing/visionos-spatial-engineer.md) | Apple Vision Pro 开发 | Vision Pro 应用, 空间计算体验 |
| 🔌 [终端集成专家](spatial-computing/terminal-integration-specialist.md) | 终端集成, 命令行工具 | CLI 工具, 终端工作流, 开发者工具 |

### 🎯 专业部门

不适合放入任何盒子的独特专家。

| 代理 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🎭 [代理协调器](specialized/agents-orchestrator.md) | 多代理协调, 工作流管理 | 需要多代理协调的复杂项目 |
| 📊 [数据分析报告员](specialized/data-analytics-reporter.md) | 商业智能, 数据洞察 | 深度数据分析, 业务指标, 战略洞察 |
| 🔍 [LSP/索引工程师](specialized/lsp-index-engineer.md) | 语言服务器协议, 代码智能 | 代码智能系统, LSP 实现, 语义索引 |
| 📥 [销售数据提取代理](specialized/sales-data-extraction-agent.md) | Excel 监控, 销售指标提取 | 销售数据提取, MTD/YTD/年终指标 |
| 📈 [数据整合代理](specialized/data-consolidation-agent.md) | 销售数据聚合, 仪表板报告 | 区域摘要, 代表绩效, 管道快照 |
| 📬 [报告分发代理](specialized/report-distribution-agent.md) | 自动报告交付 | 基于区域的报告分发, 定期发送 |
| 🔐 [代理身份与信任架构师](specialized/agentic-identity-trust.md) | 代理身份, 身份验证, 信任验证 | 多代理身份系统, 代理授权, 审计轨迹 |

---

## 🎯 现实世界使用案例

### 场景 1: 构建初创公司 MVP

**你的团队**:
1. 🎨 **前端开发者** - 构建 React 应用
2. 🏗️ **后端架构师** - 设计 API 和数据库
3. 🚀 **增长黑客** - 计划用户获取
4. ⚡ **快速原型师** - 快速迭代周期
5. 🔍 **现实检查器** - 确保发布前的质量

**结果**: 在每个阶段都有专业技能，更快地交付。

---

### 场景 2: 营销活动启动

**你的团队**:
1. 📝 **内容创作者** - 开发活动内容
2. 🐦 **Twitter 互动者** - Twitter 策略和执行
3. 📸 **Instagram 策展者** - 视觉内容和故事
4. 🤝 **Reddit 社区建设者** - 真实的社区互动
5. 📊 **分析报告员** - 跟踪和优化性能

**结果**: 具有平台特定专业知识的多渠道协调活动。

---

### 场景 3: 企业功能开发

**你的团队**:
1. 👔 **高级项目经理** - 范围和任务规划
2. 💎 **高级开发者** - 复杂实现
3. 🎨 **UI 设计师** - 设计系统和组件
4. 🧪 **实验跟踪器** - A/B 测试规划
5. 📸 **证据收集器** - 质量验证
6. 🔍 **现实检查器** - 生产准备情况

**结果**: 具有质量网关和文档的企业级交付。

---

### 场景 4: 全代理产品探索

**你的团队**: 8 个部门并行工作于单一任务。

查看 **[Nexus 空间探索练习](examples/nexus-spatial-discovery.md)** -- 一个完整的示例，其中 8 个代理（产品趋势研究员、后端架构师、品牌守护者、增长黑客、支持响应者、UX 研究员、项目牧羊人和 XR 界面架构师）同时部署以评估软件机会并产生统一的产品计划，涵盖市场验证、技术架构、品牌策略、上市策略、支持系统、UX 研究、项目执行和空间 UI 设计。

**结果**: 在一次会话中产生的全面、跨功能的产品蓝图。[更多示例](examples/)。

---

## 🤝 贡献

我们欢迎贡献！以下是你如何提供帮助的方法：

### 添加新代理

1. Fork 仓库
2. 在适当类别中创建新代理文件
3. 遵循代理模板结构：
   - 前置信息，包含名称、描述、颜色
   - 身份和记忆部分
   - 核心使命
   - 关键规则（领域特定）
   - 带示例的技术交付物
   - 工作流程过程
   - 成功指标
4. 提交包含你的代理的 PR

### 改进现有代理

- 添加现实世界的示例
- 增强代码示例
- 更新成功指标
- 改进工作流程

### 分享你的成功故事

你成功使用这些代理了吗？在 [讨论区](https://github.com/msitarzewski/agency-agents/discussions) 中分享你的故事！

---

## 📖 代理设计哲学

每个代理都按照以下原则设计：

1. **🎭 强烈个性**: 不是通用模板 - 真实的角色和声音
2. **📋 明确交付**: 具体输出，而不是模糊指导
3. **✅ 成功指标**: 可衡量的结果和质量标准
4. **🔄 经验证的工作流程**: 经过验证的逐步过程
5. **💡 学习记忆**: 模式识别和持续改进

---

## 🎁 什么使这特殊？

### 与通用 AI 提示不同：
- ❌ 通用的"充当开发者"提示
- ✅ 具有个性和流程的深度专业化

### 与提示库不同：
- ❌ 一次性提示集合
- ✅ 具有工作流程和交付物的综合代理系统

### 与 AI 工具不同：
- ❌ 无法自定义的黑盒工具
- ✅ 透明、可复刻、可适应的代理人格

---

## 🎨 代理个性亮点

> "我不只是测试你的代码 - 我默认查找 3-5 个问题并要求所有内容都有视觉证明。"
>
> -- **证据收集器** (测试部门)

> "你不是在 Reddit 上做营销 - 你正在成为一个有价值的社区成员，顺便代表一个品牌。"
>
> -- **Reddit 社区建设者** (市场部门)

> "每个有趣元素都必须服务于功能或情感目的。设计增强而非分散注意力的乐趣。"
>
> -- **趣味注入器** (设计部门)

> "让我添加一个庆祝动画，将任务完成焦虑减少 40%"
>
> -- **趣味注入器** (在 UX 审查期间)

---

## 📊 统计

- 🎭 **61 个专业代理** 跨越 9 个部门
- 📝 **10,000+ 行** 人格、流程和代码示例
- ⏱️ **数月迭代** 来自现实世界使用
- 🌟 **实战检验** 在生产环境中
- 💬 **50+ 请求** 在 Reddit 上的前 12 小时内

---

## 🔌 多工具集成

该机构原生支持 Claude Code，并提供转换和安装脚本，让你可以在每个主要代理编码工具中使用相同的代理。

### 支持的工具

- **[Claude Code](https://claude.ai/code)** — 原生 `.md` 代理，无需转换 → `~/.claude/agents/`
- **[Antigravity](https://github.com/google-gemini/antigravity)** — 每个代理一个 `SKILL.md` → `~/.gemini/antigravity/skills/`
- **[Gemini CLI](https://github.com/google-gemini/gemini-cli)** — 扩展 + `SKILL.md` 文件 → `~/.gemini/extensions/agency-agents/`
- **[OpenCode](https://opencode.ai)** — `.md` 代理文件 → `.opencode/agent/`
- **[Cursor](https://cursor.sh)** — `.mdc` 规则文件 → `.cursor/rules/`
- **[Aider](https://aider.chat)** — 单个 `CONVENTIONS.md` → `./CONVENTIONS.md`
- **[Windsurf](https://codeium.com/windsurf)** — 单个 `.windsurfrules` → `./.windsurfrules`

---

### ⚡ 快速安装

**第 1 步 -- 生成集成文件：**
```
./scripts/convert.sh
```

**第 2 步 -- 安装（交互式，自动检测你的工具）：**
```
./scripts/install.sh
```

安装程序扫描你系统上安装的工具，显示一个复选框 UI，让你精确选择要安装的内容：

```
  +------------------------------------------------+
  |   该机构 -- 工具安装程序                        |
  +------------------------------------------------+

  系统扫描: [*] = 在此机器上检测到

  [x]  1)  [*]  Claude Code     (claude.ai/code)
  [x]  2)  [*]  Antigravity     (~/.gemini/antigravity)
  [ ]  3)  [ ]  Gemini CLI      (gemini extension)
  [ ]  4)  [ ]  OpenCode        (opencode.ai)
  [x]  5)  [*]  Cursor          (.cursor/rules)
  [ ]  6)  [ ]  Aider           (CONVENTIONS.md)
  [ ]  7)  [ ]  Windsurf        (.windsurfrules)

  [1-7] 切换   [a] 全选   [n] 全不选   [d] 已检测
  [Enter] 安装   [q] 退出
```

**或直接安装特定工具：**
```
./scripts/install.sh --tool cursor
./scripts/install.sh --tool opencode
./scripts/install.sh --tool antigravity
```

**非交互式（CI/脚本）：**
```
./scripts/install.sh --no-interactive --tool all
```

---

### 工具特定说明

<details>
<summary><strong>Claude Code</strong></summary>

代理直接从仓库复制到 `~/.claude/agents/` -- 无需转换。

```bash
./scripts/install.sh --tool claude-code
```

然后在 Claude Code 中激活：
```
Use the Frontend Developer agent to review this component.
```

详情请参见 [integrations/claude-code/README.md](integrations/claude-code/README.md)。
</details>

<details>
<summary><strong>Antigravity (Gemini)</strong></summary>

每个代理成为 `~/.gemini/antigravity/skills/agency-<slug>/` 中的一个技能。

```bash
./scripts/install.sh --tool antigravity
```

在带有 Antigravity 的 Gemini 中激活：
```
@agency-frontend-developer review this React component
```

详情请参见 [integrations/antigravity/README.md](integrations/antigravity/README.md)。
</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

作为带有 61 个技能 + 清单的 Gemini CLI 扩展安装。

```bash
./scripts/install.sh --tool gemini-cli
```

详情请参见 [integrations/gemini-cli/README.md](integrations/gemini-cli/README.md)。
</details>

<details>
<summary><strong>OpenCode</strong></summary>

代理放置在项目根目录的 `.opencode/agent/` 中（项目范围）。

```bash
cd /your/project
/path/to/agency-agents/scripts/install.sh --tool opencode
```

或全局安装：
```
mkdir -p ~/.config/opencode/agent
cp integrations/opencode/agent/*.md ~/.config/opencode/agent/
```

在 OpenCode 中激活：
```
Use the Backend Architect agent to design this API.
```

详情请参见 [integrations/opencode/README.md](integrations/opencode/README.md)。
</details>

<details>
<summary><strong>Cursor</strong></summary>

每个代理成为项目中 `.cursor/rules/` 的 `.mdc` 规则文件。

```bash
cd /your/project
/path/to/agency-agents/scripts/install.sh --tool cursor
```

当 Cursor 检测到项目中的规则时，会自动应用规则。明确引用它们：
```
Use the @security-engineer rules to review this code.
```

详情请参见 [integrations/cursor/README.md](integrations/cursor/README.md)。
</details>

<details>
<summary><strong>Aider</strong></summary>

所有代理编译成单个 Aider 自动读取的 `CONVENTIONS.md` 文件。

```bash
cd /your/project
/path/to/agency-agents/scripts/install.sh --tool aider
```

然后在你的 Aider 会话中引用代理：
```
Use the Frontend Developer agent to refactor this component.
```

详情请参见 [integrations/aider/README.md](integrations/aider/README.md)。
</details>

<details>
<summary><strong>Windsurf</strong></summary>

所有代理编译成项目根目录中的 `.windsurfrules`。

```bash
cd /your/project
/path/to/agency-agents/scripts/install.sh --tool windsurf
```

在 Windsurf 的 Cascade 中引用代理：
```
Use the Reality Checker agent to verify this is production ready.
```

详情请参见 [integrations/windsurf/README.md](integrations/windsurf/README.md)。
</details>

---

### 更改后重新生成

当你添加新代理或编辑现有代理时，重新生成所有集成文件：

```
./scripts/convert.sh        # 重新生成所有
./scripts/convert.sh --tool cursor   # 仅重新生成一个工具
```

---

## 🗺️ 路线图

- [ ] 交互式代理选择 Web 工具
- [x] 多代理工作流示例 -- 参见 [examples/](examples/)
- [x] 多工具集成脚本 (Claude Code, Antigravity, Gemini CLI, OpenCode, Cursor, Aider, Windsurf)
- [ ] 代理设计视频教程
- [ ] 社区代理市场
- [ ] 用于项目匹配的代理"性格测试"
- [ ] "每周代理"展示系列

---

## 🌐 社区翻译和本地化

社区维护的翻译和地区适应。这些是独立维护的 -- 请参见每个仓库以了解覆盖范围和版本兼容性。

| 语言 | 维护者 | 链接 | 注释 |
|----------|-----------|------|-------|
| 🇨🇳 简体中文 (zh-CN) | [@jnMetaCode](https://github.com/jnMetaCode) | [agency-agents-zh](https://github.com/jnMetaCode/agency-agents-zh) | 26 个翻译代理 + 4 个中国市场代理 |

想要添加翻译？开一个 issue，我们会在这里链接它。

---

## 📜 许可证

MIT 许可证 - 可自由用于商业或个人用途。感谢但非必需。

---

## 🙏 致谢

源于关于 AI 代理专业化的 Reddit 讨论。感谢社区的反馈、请求和灵感。

特别感谢在前 12 小时内在 Reddit 上提出请求的 50 多位 Redditor - 你们证明了对真正专业 AI 代理系统的需求。

---

## 💬 社区

- **GitHub 讨论**: [分享你的成功故事](https://github.com/msitarzewski/agency-agents/discussions)
- **问题**: [报告错误或请求功能](https://github.com/msitarzewski/agency-agents/issues)
- **Reddit**: 加入 r/ClaudeAI 的讨论
- **Twitter/X**: 使用 #TheAgency 分享

---

## 🚀 开始使用

1. **浏览** 上面的代理并找到满足你需求的专家
2. **复制** 代理到 `~/.claude/agents/` 以集成 Claude Code
3. **激活** 代理，通过在 Claude 对话中引用它们
4. **自定义** 代理人格和工作流程以满足你的特定需求
5. **分享** 你的结果并向社区回馈

---

<div align="center">

**🎭 该机构：你的 AI 梦幻团队在等待 🎭**

[⭐ Star this repo](https://github.com/msitarzewski/agency-agents) • [🍴 Fork it](https://github.com/msitarzewski/agency-agents/fork) • [🐛 Report an issue](https://github.com/msitarzewski/agency-agents/issues) • [❤️ Sponsor](https://github.com/sponsors/msitarzewski)

由社区制作，为社区服务 ❤️

</div>
```

```
# The Code Agency - AI驱动的自动化编码工作流系统

> 🚀 让AI代理协作完成从需求分析到代码生成的完整开发流程

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-brightgreen.svg)](VERSION)
[![Status](https://img.shields.io/badge/status-stable-green.svg)](STATUS)

## 📖 项目简介

The Code Agency 是一个AI驱动的自动化编码工作流系统，通过多个AI代理协作，实现从需求分析、架构设计、编码实现到测试部署的完整开发流程。系统支持国内外主流AI服务，提供可视化Web界面，极大提升了开发效率。

## ✨ 核心功能

### 1. AI驱动的自动化编码
- 📋 **需求分析**：AI自动分析用户需求并生成需求文档
- 🏗️ **设计文档**：根据需求生成详细的设计文档
- 💻 **代码生成**：AI生成高质量代码
- 🧪 **测试生成**：自动生成单元测试和集成测试
- 🔍 **代码审查**：AI审查代码质量并提出改进建议

### 2. 多AI代理协调系统（NEXUS）
- 👨‍💼 **需求分析师**：分析用户需求，形成需求文档
- 🏗️ **架构师**：设计系统架构和技术选型
- 👨‍💻 **前端开发者**：实现前端界面和交互
- 🛠️ **后端开发者**：实现后端逻辑和API
- 👮‍♂️ **代码审查员**：审查代码质量和规范
- 🔧 **Bug修复专家**：识别并修复代码缺陷
- 📝 **文档工程师**：编写技术文档

### 3. 可视化Web界面
- 📊 **任务管理**：创建、查看和管理开发任务
- 🔄 **工作流控制**：管理工作流模板和执行实例
- 🤖 **代理配置**：管理和配置各种AI代理
- ⚙️ **系统设置**：配置API密钥和其他系统参数
- 🔧 **健康检查**：系统功能测试和诊断
- 🤖 **机器人配置**：配置钉钉和飞书机器人

### 4. 企业级消息集成
- 📱 **钉钉机器人**：支持通过钉钉聊天命令控制工作流
- 📱 **飞书机器人**：支持通过飞书聊天命令控制工作流
- 🔔 **任务通知**：在任务开始、完成、失败等关键节点自动推送通知
- 📊 **状态查询**：通过机器人查询任务状态和进度

### 5. 任务状态持久化
- 💾 **数据持久化**：即使关闭浏览器或重启服务，任务状态仍然保持
- ⏳ **后台运行**：任务可以在后台持续运行，不受前端影响
- 🔄 **断点续传**：用户可以从上次离开的地方继续

## 🏗️ 系统架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   钉钉/飞书     │◄──►│  集成服务       │◄──►│  主服务        │
│   机器人        │    │  (独立进程)     │    │  (现有服务)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                            ▲
                            │
                    ┌──────────────────┐
                    │  Web GUI        │
                    │  (控制面板)      │
                    └──────────────────┘
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm 或 yarn

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/your-repo/the-code-agency.git
cd the-code-agency
```

2. 安装依赖
```bash
npm install
```

3. 启动后端服务
```bash
npm run dev
```

4. 启动Web界面
```bash
cd web-gui
npm install
npm run dev
```

### 配置AI服务

在Web界面的"设置"页面中配置您使用的AI服务：

- **阿里云百炼平台**
  - API Key
  - Endpoint
  - 模型类型选择

- **腾讯云智能创作**
  - SecretId
  - SecretKey
  - Endpoint

- **百度智能云千帆**
  - API Key
  - Secret Key
  - Endpoint

### 配置企业机器人

在Web界面的"机器人配置"页面中配置钉钉和飞书机器人：

1. 在钉钉群中添加自定义机器人，获取Webhook地址和密钥
2. 在飞书群中添加机器人，获取Webhook地址和密钥
3. 在配置页面中输入相关信息并启用

## 🎯 使用场景

- 💡 **原型开发** - 快速实现产品原型
- 🛠️ **功能开发** - 实现具体功能模块
- 🧪 **测试生成** - 自动生成测试用例
- 🔍 **代码审查** - AI辅助代码审查
- 📝 **文档生成** - 自动生成技术文档

## 📞 支持命令

### 钉钉/飞书机器人支持的命令：

- `/analyze [需求描述]` - 分析需求并生成设计方案
- `/code [需求描述]` - 直接生成代码
- `/test [项目路径]` - 生成测试用例
- `/status [任务ID]` - 查询任务状态
- 直接输入需求 - AI将为您自动生成代码

## 📄 目录结构

```
the-code-agency/
├── server.js                 # 主服务文件
├── services/                 # AI服务接口实现
│   ├── coding-plan.js        # AI编码计划服务
│   └── prompt-templates.js   # 提示词模板系统
├── integrations/             # 企业机器人集成
│   ├── dingtalk/            # 钉钉机器人
│   ├── feishu/              # 飞书机器人
│   └── shared/              # 共享服务
├── web-gui/                 # Web界面
│   ├── src/                 # 源代码
│   │   ├── pages/           # 页面组件
│   │   ├── layouts/         # 布局组件
│   │   ├── services/        # 服务模块
│   │   └── contexts/        # 上下文管理
│   └── README.md            # Web GUI说明
├── data/                    # 任务数据存储
│   └── tasks/               # 任务状态文件
├── generated-code/          # 生成的代码文件
└── README.md                # 项目说明
```

## 🤝 贡献

我们欢迎各种形式的贡献！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

感谢所有为The Code Agency项目做出贡献的开发者和测试者，是你们的努力让这个项目变得更好。

---

<div align="center">

**Made with ❤️ by The Code Agency Team**

🚀 *让AI为您的代码赋能*

</div>