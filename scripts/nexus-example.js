/**
 * NEXUS 协调器使用示例
 * 
 * 演示如何使用 NEXUS 协调器协调多个AI代理完成复杂开发任务
 */

const NexusCoordinator = require('../core-agents/nexus-coordinator');

async function runNexusExample() {
  console.log('🚀 启动 NEXUS 协调器示例...\n');
  
  // 配置 AI 服务
  const aiConfig = {
    ali: {
      enabled: process.env.ALI_ENABLED === 'true',
      apiKey: process.env.ALI_API_KEY,
      endpoint: process.env.ALI_ENDPOINT,
      planType: process.env.ALI_PLAN_TYPE || 'qwen-coder-plus'
    },
    tencent: {
      enabled: process.env.TENCENT_ENABLED === 'true',
      secretId: process.env.TENCENT_SECRET_ID,
      secretKey: process.env.TENCENT_SECRET_KEY,
      endpoint: process.env.TENCENT_ENDPOINT,
      planType: process.env.TENCENT_PLAN_TYPE || 'hunyuan-code-pro'
    },
    baidu: {
      enabled: process.env.BAIDU_ENABLED === 'true',
      apiKey: process.env.BAIDU_API_KEY,
      secretKey: process.env.BAIDU_SECRET_KEY,
      endpoint: process.env.BAIDU_ENDPOINT,
      planType: process.env.BAIDU_PLAN_TYPE || 'ernie-bot-code-pro'
    },
    custom: {
      enabled: process.env.CUSTOM_ENABLED === 'true',
      apiKey: process.env.CUSTOM_API_KEY,
      endpoint: process.env.CUSTOM_ENDPOINT,
      planType: process.env.CUSTOM_PLAN_TYPE
    }
  };

  // 创建 NEXUS 协调器实例
  const nexus = new NexusCoordinator(aiConfig);

  // 定义项目规格
  const projectSpec = `
  开发一个任务管理系统，具有以下功能：
  1. 用户可以创建、编辑和删除任务
  2. 任务可以设置优先级和截止日期
  3. 任务可以标记为完成或未完成
  4. 用户可以查看任务列表并按状态筛选
  5. 用户可以搜索任务
  6. 响应式设计，支持移动端浏览
  `;

  try {
    console.log('📋 项目规格：');
    console.log(projectSpec);
    console.log('');

    // 执行 NEXUS 协调任务
    const task = await nexus.executeNexusTask(projectSpec, {
      techStack: {
        frontend: 'React, Redux, TailwindCSS',
        backend: 'Node.js, Express, MongoDB'
      }
    });

    console.log('\n✅ NEXUS 任务执行完成！');
    console.log('📊 任务摘要：');
    console.log(`   ID: ${task.id}`);
    console.log(`   状态: ${task.status}`);
    console.log(`   创建时间: ${task.createdAt}`);
    console.log(`   总耗时: ${new Date() - new Date(task.createdAt)}ms`);
    console.log(`   阶段数: ${Object.keys(task.phaseResults).length}`);

    console.log('\n📋 通信历史记录数:', nexus.getCommunicationHistory().length);

    // 显示部分结果
    console.log('\n📄 部分输出预览:');
    console.log('   需求分析字数:', task.phaseResults['requirements-analysis']?.length || 0);
    console.log('   架构设计字数:', task.phaseResults['architecture-design']?.length || 0);
    console.log('   代码审查字数:', task.phaseResults['code-review']?.length || 0);

  } catch (error) {
    console.error('❌ NEXUS 任务执行失败:', error.message);
    console.error(error.stack);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runNexusExample().catch(console.error);
}

module.exports = { runNexusExample };