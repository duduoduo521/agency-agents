/**
 * 提示词模板系统
 * 
 * 提供不同场景下的 AI 提示词模板
 */

const templates = {
 // 需求分析模板
 requirementsAnalysis: (userInput) => `请分析以下用户需求，并生成详细的需求规格说明：

**用户输入**:
${userInput}

**请输出**:
1. 功能需求列表
2. 非功能需求（性能、安全等）
3. 用户故事
4. 验收标准`,

 // 设计文档模板
 designDocument: (requirements) => `请根据以下需求生成详细的设计文档：

**需求规格**:
${requirements}

**请输出**:
1. 系统架构设计
2. 技术选型建议
3. 数据库设计（如需要）
4. API 接口设计
5. 前端页面设计`,

 // 代码生成模板
 codeGeneration: (design, techStack) => `请根据以下设计文档生成完整的代码实现：

**设计文档**:
${design}

**技术栈**: ${techStack.join(', ')}

**要求**:
- 完整的项目结构
- 所有必要的文件
- 详细的代码注释
- 遵循最佳实践
- 包含配置文件和依赖说明

请按文件逐个输出完整代码。`,

 // Bug 修复模板
 bugFix: (code, bugDescription) => `请分析以下代码中的 Bug 并提供修复方案：

**问题描述**:
${bugDescription}

**相关代码**:
\`\`\`
${code}
\`\`\`

**请输出**:
1. Bug 原因分析
2. 修复方案
3. 修复后的完整代码`,

 // 代码重构模板
 refactoring: (code, goal) => `请对以下代码进行重构：

**原始代码**:
\`\`\`
${code}
\`\`\`

**重构目标**: ${goal}

**请输出**:
1. 重构后的代码
2. 改进点说明`,

 // 测试生成模板
 testGeneration: (code, testType= 'unit') => `请为以下代码生成${testType === 'unit' ? '单元' : '集成'}测试：

**源代码**:
\`\`\`
${code}
\`\`\`

**要求**:
- 覆盖主要功能路径
- 包含边界条件测试
- 使用合适的测试框架
- 提供完整的测试代码`,

 // 代码审查模板
 codeReview: (code) => `请对以下代码进行审查：

**待审查代码**:
\`\`\`
${code}
\`\`\`

**请从以下方面进行评估**:
1. 代码质量和可读性
2. 潜在的性能问题
3. 安全性考虑
4. 最佳实践遵循情况
5. 改进建议`,

 // HTML5 游戏开发模板
 html5Game: (gameDescription) => `请创建一个完整的 HTML5 小游戏：

**游戏描述**:
${gameDescription}

**要求**:
1. 单个 HTML 文件包含所有代码（HTML + CSS + JavaScript）
2. 使用 Canvas API 或 DOM 操作
3. 完整的游戏逻辑（开始、进行、结束）
4. 计分系统
5. 响应式设计，支持鼠标和触摸操作
6. 精美的视觉效果和动画

请提供可直接运行的完整 HTML 代码。`,

 // React 组件模板
 reactComponent: (componentDescription) => `请创建一个 React 组件：

**组件描述**:
${componentDescription}

**要求**:
1. 使用函数组件和 Hooks
2. 完整的 PropTypes 或 TypeScript 类型定义
3. 响应式设计
4. 适当的错误处理
5. 导出默认组件

请提供完整的组件代码和使用示例。`,

 // Node.js API 模板
 nodejsAPI: (apiDescription) => `请创建一个 Node.js API 接口：

**API 描述**:
${apiDescription}

**要求**:
1. 使用 Express.js 框架
2. RESTful 设计风格
3. 输入验证和错误处理
4. 适当的日志记录
5. 包含路由和业务逻辑分离
6. 提供 package.json 和启动说明`,

 // Python 脚本模板
 pythonScript: (scriptDescription) => `请编写一个 Python 脚本：

**脚本描述**:
${scriptDescription}

**要求**:
1. 完整的可执行代码
2. 详细的文档字符串
3. 异常处理
4. 命令行参数支持（如需要）
5. 遵循 PEP 8 规范`
};

/**
 * 获取指定类型的模板
 */
function getTemplate(type, ...args) {
 const template = templates[type];
  if (!template) {
   throw new Error(`未知的模板类型：${type}`);
 }
 return template(...args);
}

/**
 * 注册自定义模板
 */
function registerTemplate(name, templateFn) {
 templates[name] = templateFn;
}

module.exports = {
 getTemplate,
 registerTemplate,
 templates
};
