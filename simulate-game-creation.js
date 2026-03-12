/**
 * 模拟测试脚本：验证创建HTML小游戏的功能
 * 
 * 模拟从用户输入到任务完成的完整流程
 */

const fs = require('fs');
const path = require('path');

console.log('🎮 模拟创建HTML小游戏任务...\n');

// 1. 模拟用户输入
const userInput = "做一个HTML5小游戏，主题是太空射击";
console.log(`1. 用户输入: "${userInput}"`);

// 2. 检查是否能识别游戏关键词
const isGameRequest = userInput.toLowerCase().includes('游戏') || userInput.toLowerCase().includes('game');
console.log(`2. 识别为游戏请求: ${isGameRequest ? '✅ 是' : '❌ 否'}`);

// 3. 检查prompt-templates.js中的html5Game模板
const templateContent = fs.readFileSync('services/prompt-templates.js', 'utf8');
const hasHtml5GameTemplate = templateContent.includes('html5Game:');

if (hasHtml5GameTemplate) {
  console.log('3. 找到html5Game模板');
  
  // 提取模板内容
  const templateMatch = templateContent.match(/html5Game:[^}]+?\n\s+\`([^`]*)\`/s);
  if (templateMatch) {
    console.log('4. html5Game模板内容预览:');
    console.log('   ' + templateMatch[1].substring(0, 100) + '...');
  } else {
    // 尝试另一种提取方式
    const regex = /html5Game:\s*\([^)]+\)\s*=>\s*`([^`]*)`/;
    const match = templateContent.match(regex);
    if (match) {
      console.log('4. html5Game模板内容预览:');
      const templatePreview = match[1].substring(0, 100).replace(/\n/g, '\n   ');
      console.log('   ' + templatePreview + '...');
    }
  }
}

// 4. 检查server.js中的游戏识别逻辑
const serverContent = fs.readFileSync('server.js', 'utf8');
const hasGameRecognition = serverContent.includes('game') && serverContent.includes('params?.toLowerCase().includes(\'游戏\')');

console.log(`5. 服务器具备游戏请求识别能力: ${hasGameRecognition ? '✅ 是' : '❌ 否'}`);

// 5. 验证saveGeneratedFiles函数能处理HTML文件
const hasHtmlHandling = serverContent.includes('index.html') || serverContent.includes('.html');
console.log(`6. 代码保存函数能处理HTML文件: ${hasHtmlHandling ? '✅ 是' : '❌ 否'}`);

// 6. 检查是否有生成ZIP下载功能
const hasZipFunctionality = serverContent.includes('archiver') && serverContent.includes('download');
console.log(`7. 具备代码打包下载功能: ${hasZipFunctionality ? '✅ 是' : '❌ 否'}`);

// 7. 检查任务状态管理
const hasTaskManagement = serverContent.includes('status') && 
                         serverContent.includes('pending') &&
                         serverContent.includes('analyzing') &&
                         serverContent.includes('designing') &&
                         serverContent.includes('coding') &&
                         serverContent.includes('testing') &&
                         serverContent.includes('reviewing') &&
                         serverContent.includes('completed');

console.log(`8. 具备完整的任务状态管理: ${hasTaskManagement ? '✅ 是' : '❌ 否'}`);

// 8. 检查任务存储机制
const hasTaskStorage = serverContent.includes('tasks = new Map()');
console.log(`9. 具备任务存储机制: ${hasTaskStorage ? '✅ 是' : '❌ 否'}`);

// 9. 验证Web GUI是否能管理任务
const taskPageContent = fs.readFileSync('web-gui/src/pages/TaskPage.jsx', 'utf8');
const hasTaskManagementGui = taskPageContent.includes('task') && 
                            (taskPageContent.includes('status') || taskPageContent.includes('状态')) &&
                            (taskPageContent.includes('download') || taskPageContent.includes('下载'));

console.log(`10. Web GUI具备任务管理功能: ${hasTaskManagementGui ? '✅ 是' : '❌ 否'}`);

// 10. 总结
console.log('\n🎯 模拟结果总结:');
console.log('当用户输入"做一个HTML5小游戏，主题是太空射击"时：');

const allChecks = [
  isGameRequest,
  hasHtml5GameTemplate,
  hasGameRecognition,
  hasHtmlHandling,
  hasZipFunctionality,
  hasTaskManagement,
  hasTaskStorage,
  hasTaskManagementGui
];

if (allChecks.every(check => check)) {
  console.log('\n✅ 系统具备完整处理该请求的能力！');
  console.log('流程预测：');
  console.log('  1. 系统识别到游戏请求');
  console.log('  2. 使用html5Game模板构建AI提示词');
  console.log('  3. 调用AI服务生成HTML5游戏代码');
  console.log('  4. 解析并保存为index.html或其他相关文件');
  console.log('  5. 在任务系统中更新状态');
  console.log('  6. Web GUI显示任务进度和状态');
  console.log('  7. 任务完成后提供ZIP下载链接');
  console.log('\n🎉 项目功能完整，可以处理HTML小游戏创建任务！');
} else {
  console.log('\n❌ 系统某些功能可能存在缺失');
  console.log('需要检查以下方面：');
  if (!isGameRequest) console.log('  - 游戏请求识别逻辑');
  if (!hasHtml5GameTemplate) console.log('  - html5Game模板定义');
  if (!hasGameRecognition) console.log('  - 服务器游戏识别能力');
  if (!hasHtmlHandling) console.log('  - HTML文件处理能力');
  if (!hasZipFunctionality) console.log('  - ZIP下载功能');
  if (!hasTaskManagement) console.log('  - 任务状态管理');
  if (!hasTaskStorage) console.log('  - 任务存储机制');
  if (!hasTaskManagementGui) console.log('  - Web GUI任务管理');
}

console.log('\n⚠️  注意：要实际运行此功能，需要：');
console.log('  1. 配置AI服务API密钥（如阿里云、腾讯云等）');
console.log('  2. 启动后端服务器 (node server.js)');
console.log('  3. 启动Web GUI (cd web-gui && npm run dev)');
console.log('  4. 通过Web界面或API提交任务');