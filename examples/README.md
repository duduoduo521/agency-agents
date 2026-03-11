# The Code Agency 使用指南

## 快速开始

### 1. 安装 CLI 工具

```bash
# 克隆项目
git clone https://github.com/your-org/the-code-agency.git
cd the-code-agents

# 安装依赖
npm install

# 链接 CLI 命令
npm link
```

### 2. 验证安装

```bash
agency --version
agency --help
```

## 核心工作流

### 完整工作流：从需求到代码

```bash
# 一步到位：运行完整工作流
agency workflow full \
  --input "需要一个用户登录系统，支持邮箱密码登录和记住我功能" \
  --output my-login-system \
  --stages all
```

这将自动执行以下步骤:
1. ✅ 需求分析 → `requirements-spec.md`
2. ✅ 设计生成 → `feature-design.md`
3. ✅ 架构设计 → `architecture-design.md`
4. ✅ 代码实现 → `my-login-system/`
5. ✅ 质量检查 → `quality-report.md`

### 分步工作流

#### 步骤 1: 需求分析

```bash
agency analyze-requirements\
  "需要一个电商网站的用户登录系统" \
  --output requirements-spec.md \
  --reviewers "产品经理，技术负责人"
```

**输出**: 需求规格说明书，包含:
- 功能需求（FR）
- 非功能需求（NFR）
- 验收标准
- 优先级排序

#### 步骤 2: 设计生成

```bash
agency generate-design \
 requirements-spec.md \
  --output feature-design.md \
  --tech-stack "react+nestjs"
```

**输出**: 功能设计文档，包含:
- 用户流程图
- 功能分解
- 界面设计要点
- 详细验收标准

#### 步骤 3: 代码生成

```bash
agency generate-code \
  feature-design.md \
  --output my-login-system \
  --tech-stack "react+nestjs+postgresql" \
  --tests\
  --docs
```

**输出**: 完整的项目代码，包括:
- 前端 React 组件
- 后端 NestJS API
- PostgreSQL 数据库 Schema
- 单元测试
- 文档

#### 步骤 4: 质量检查

```bash
# 运行全面质量检查
agency quality-check \
  my-login-system/ \
  --levels all \
  --output quality-report.md

# 或者单独运行各项检查
agency lint-code my-login-system/ --fix
agency security-scan my-login-system/ --severity high
agency performance-test http://localhost:3000 --scenarios login
```

**输出**: 质量报告，包含:
- 代码规范评分
- 测试覆盖率
- 安全漏洞扫描
- 性能指标

## 常用命令参考

### 需求相关

```bash
# 分析需求
agency analyze-requirements "需求描述" -o requirements.md

# 查看需求文档
agency view requirements.md
```

### 设计相关

```bash
# 生成设计
agency generate-design requirements.md -o design.md

# 评审设计
agency review-design design.md --reviewers"团队"

# 优化设计
agency optimize-design design.md --feedback feedback.md -o design-v2.md
```

### 代码相关

```bash
# 生成代码
agency generate-code design.md --output project/ --tests

# 审查代码
agency review-code project/ --checkers security,performance

# 运行测试
agency run-tests project/ --coverage --threshold 90

# 构建项目
agency build project/ --optimize -o dist/
```

### 质量相关

```bash
# 全面质量检查
agency quality-check project/ --levels all

# 安全扫描
agency security-scan project/ --severity medium

# 性能测试
agency performance-test http://localhost:3000 \
  --concurrency 100 \
  --duration 5m
```

### 部署相关

```bash
# 开发环境部署
agency deploy project/ --env dev

# 生产环境部署（蓝绿部署）
agency deploy project/ \
  --env production \
  --strategy blue-green
```

## 实战示例

### 示例 1: 创建简单的博客系统

```bash
# 完整工作流
agency workflow blog-system \
  "需要一个博客系统，支持文章发布、评论和标签分类" \
  --output my-blog \
  --stages all

# 查看生成的结构
tree my-blog/

# 运行项目
cd my-blog
docker-compose up -d

# 访问 http://localhost:3000
```

### 示例 2: 添加新功能到现有项目

```bash
# 分析新需求
agency analyze-requirements\
  "在博客系统中添加文章搜索功能" \
  -o search-requirements.md

# 生成设计
agency generate-design \
  search-requirements.md \
  -o search-design.md

# 生成代码
agency generate-code \
  search-design.md \
  --output existing-blog/ \
  --merge  # 合并到现有项目

# 运行测试
agency run-tests existing-blog/ --watch
```

### 示例 3: Bug 修复流程

```bash
# 分析问题
agency analyze-issue \
  "用户登录时偶发 500 错误" \
  -o bug-analysis.md

# 生成修复方案
agency generate-fix \
  bug-analysis.md \
  --output bugfix-branch/

# 验证修复
agency run-tests bugfix-branch/ --coverage
agency quality-check bugfix-branch/ --levels security,performance
```

## 最佳实践

### 1. 需求编写技巧

✅ **好的需求**:
```
"需要一个用户注册功能，支持邮箱验证，密码强度检查，
以及第三方登录（Google、GitHub）。注册转化率提升 30%。"
```

❌ **模糊的需求**:
```
"做一个注册功能"
```

### 2. 设计评审要点

- [ ] 用户流程是否完整？
- [ ] 异常场景是否考虑？
- [ ] 技术方案是否可行？
- [ ] 安全风险是否评估？
- [ ] 性能要求是否明确？

### 3. 代码质量标准

```yaml
目标:
  测试覆盖率：> 90%
  代码复杂度：< 10
  安全漏洞：0 严重，0 高危
  性能指标:
    - LCP < 2.5s
    - API P95 < 200ms
```

### 4. 持续集成配置

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality-check:
   runs-on: ubuntu-latest
  steps:
     - uses: actions/checkout@v3
     
     -name: Install dependencies
       run: npm ci
       
     -name: Run linter
       run: npm run lint
       
     -name: Run tests
       run: npm test -- --coverage
       
     -name: Security scan
       run: npm audit
       
     -name: Build
       run: npm run build
```

## 故障排查

### 常见问题

#### Q1: 生成的代码无法运行

**检查清单**:
- [ ] Node.js 版本是否符合（建议 18+）
- [ ] 依赖是否完整安装（`npm install`）
- [ ] 环境变量是否配置
- [ ] 数据库连接是否正确

**解决方案**:
```bash
# 查看详细错误日志
agency view logs/latest.log

# 重新生成项目
agency clean project/
agency generate-code design.md --output project-new/
```

#### Q2: 测试覆盖率不达标

**可能原因**:
- 边界条件未覆盖
- 异常处理未测试
- Mock 数据不完整

**解决方案**:
```bash
# 查看覆盖率报告
agency view coverage/lcov-report/index.html

# 针对性补充测试
# 手动编辑测试文件，添加缺失的测试用例

# 重新运行测试
agency run-tests project/ --watch
```

#### Q3: 性能指标不达标

**优化方向**:
1. 数据库查询加索引
2. API 响应加缓存
3. 前端资源压缩
4. 图片懒加载

**解决方案**:
```bash
# 运行性能分析
agency performance-test http://localhost:3000 \
  --scenarios login,browse \
  --concurrency 50

# 查看性能瓶颈
agency view performance-report.md

# 根据报告优化代码
```

## 高级用法

### 自定义代理配置

```yaml
# config/agents.yaml
requirements-analyst:
  model: qwen-max
  temperature: 0.7
  
product-designer:
  model: gpt-4
  temperature: 0.8
  
frontend-developer:
  model: claude-3
  temperature: 0.6
```

### 工作流编排

```javascript
// workflows/custom-workflow.js
const { WorkflowEngine } = require('@agency/core');

const workflow = new WorkflowEngine({
  name: 'custom-ecommerce',
  stages: [
    { agent: 'requirements-analyst', timeout: 300 },
    { agent: 'product-designer', timeout: 600 },
    { agent: 'architect', timeout: 600 },
    { agent: 'frontend-developer', timeout: 1200, parallel: ['backend-developer'] },
    { agent: 'test-engineer', timeout: 600 },
  ],
});

await workflow.execute(input);
```

### 插件开发

```javascript
// plugins/my-plugin.js
class MyPlugin {
  async beforeGenerate(design) {
    // 在代码生成前预处理
  console.log('Preprocessing design...');
  }

  async afterGenerate(code) {
    // 在代码生成后处理
  console.log('Post-processing code...');
  }
}

module.exports = MyPlugin;
```

## 社区资源

- 📚 [官方文档](https://the-code-agency.dev/docs)
- 💬 [Discord 社区](https://discord.gg/the-code-agency)
- 🐛 [问题反馈](https://github.com/the-code-agency/issues)
- 🎯 [示例项目](https://github.com/the-code-agency/examples)

---

**文档工程师**: Documentation Engineer  
**更新日期**: 2026-05-05  
**版本**: 1.0  
**状态**: 就绪
