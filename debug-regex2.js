const fs = require('fs');

// 读取真实的DESIGN_DOC.md内容
const realDesignDoc = fs.readFileSync('generated-code/task-1773385540086/DESIGN_DOC.md', 'utf8');

// 尝试不同的正则表达式模式 - 移除前瞻断言，使用更简单的模式
const fileNamePattern1 = /```\s*文件名[:：]\s*([^\n`"']+\.(?:js|html|css|json|md|txt|py|java|cpp|c|ts|jsx|tsx))\s*```\s*\n```(?:\w+)?\n([\s\S]*?)```/g;

console.log('开始调试第一种正则表达式模式...');

let match;
let count = 0;
while ((match = fileNamePattern1.exec(realDesignDoc)) !== null) {
    count++;
    console.log(`匹配 ${count}:`);
    console.log(`  文件路径: "${match[1]}"`);
    console.log(`  内容长度: ${match[2].length} 字符`);
    console.log(`  内容开头: ${match[2].substring(0, 50)}...`);
    console.log(`  匹配位置: ${match.index} - ${match.index + match[0].length}`);
    console.log('');
}

console.log(`第一种模式总共找到 ${count} 个匹配项`);
console.log('');

// 第二种模式 - 更宽松的模式
const fileNamePattern2 = /文件名[:：]\s*([^\n`"']+\.(?:js|html|css|json|md|txt|py|java|cpp|c|ts|jsx|tsx))\s*\n```(?:\w+)?\n([\s\S]*?)```/g;

console.log('开始调试第二种正则表达式模式...');
count = 0;

// 重置索引
fileNamePattern2.lastIndex = 0;

while ((match = fileNamePattern2.exec(realDesignDoc)) !== null) {
    count++;
    console.log(`匹配 ${count}:`);
    console.log(`  文件路径: "${match[1]}"`);
    console.log(`  内容长度: ${match[2].length} 字符`);
    console.log(`  内容开头: ${match[2].substring(0, 50)}...`);
    console.log(`  匹配位置: ${match.index} - ${match.index + match[0].length}`);
    console.log('');
}

console.log(`第二种模式总共找到 ${count} 个匹配项`);