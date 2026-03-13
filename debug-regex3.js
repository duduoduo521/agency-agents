const fs = require('fs');

// 读取真实的DESIGN_DOC.md内容
const realDesignDoc = fs.readFileSync('generated-code/task-1773385540086/DESIGN_DOC.md', 'utf8');

// 定义要查找的模式
const pattern = /文件名[:：]\s*([^\n`"']+\.(?:js|html|css|json|md|txt|py|java|cpp|c|ts|jsx|tsx))\s*\n```(?:\w+)?\n([\s\S]*?)```\s*(?=\n|$|文件名[:：]|```[\s\n]*```)/g;

console.log('开始调试正则表达式匹配...');

let match;
let count = 0;
while ((match = pattern.exec(realDesignDoc)) !== null) {
    count++;
    console.log(`匹配 ${count}:`);
    console.log(`  文件路径: "${match[1]}"`);
    console.log(`  内容长度: ${match[2].length} 字符`);
    console.log(`  匹配位置: ${match.index} - ${match.index + match[0].length}`);
    console.log('');
}

console.log(`总共找到 ${count} 个匹配项`);

// 让我们也检查整个文件中包含的所有文件名
console.log('文件中所有的"文件名:"位置:');
const fileNameRegex = /文件名[:：]\s*[^\n`"']+\.(?:js|html|css|json|md|txt|py|java|cpp|c|ts|jsx|tsx)/g;
let fileNameMatch;
let fileNameCount = 0;
while ((fileNameMatch = fileNameRegex.exec(realDesignDoc)) !== null) {
    fileNameCount++;
    console.log(`  ${fileNameCount}: 位置 ${fileNameMatch.index}, 内容: "${fileNameMatch[0]}"`);
}