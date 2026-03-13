const fs = require('fs');

// 读取真实的DESIGN_DOC.md内容
const realDesignDoc = fs.readFileSync('generated-code/task-1773385540086/DESIGN_DOC.md', 'utf8');

// 正则表达式模式
const fileNamePattern = /```\s*文件名[:：]\s*([^\n`"']+\.(?:js|html|css|json|md|txt|py|java|cpp|c|ts|jsx|tsx))\s*```\s*\n```(?:\w+)?\n([\s\S]*?)```\s*(?=\n|$|```)/g;

console.log('开始调试正则表达式匹配...');

let match;
let count = 0;
while ((match = fileNamePattern.exec(realDesignDoc)) !== null) {
    count++;
    console.log(`匹配 ${count}:`);
    console.log(`  文件路径: "${match[1]}"`);
    console.log(`  内容长度: ${match[2].length} 字符`);
    console.log(`  内容开头: ${match[2].substring(0, 100)}...`);
    console.log('');
    
    // 检查下一个匹配的位置
    console.log(`  匹配位置: ${match.index} - ${match.index + match[0].length}`);
    console.log('');
}

console.log(`总共找到 ${count} 个匹配项`);