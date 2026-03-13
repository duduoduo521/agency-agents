const fs = require('fs');

// 读取真实的DESIGN_DOC.md内容
const realDesignDoc = fs.readFileSync('generated-code/task-1773385540086/DESIGN_DOC.md', 'utf8');

// 查看第一个文件结束后的内容
const firstFileEnd = 7965; // 从上面的输出得知
const contextAfterFirstFile = realDesignDoc.substring(firstFileEnd, firstFileEnd + 200);

console.log('第一个文件结束后的内容:');
console.log(JSON.stringify(contextAfterFirstFile));
console.log('');
console.log('详细字符分析:');
for(let i = 0; i < Math.min(contextAfterFirstFile.length, 50); i++) {
    const char = contextAfterFirstFile[i];
    console.log(`  ${i}: '${char}' (code: ${char.charCodeAt(0)})`);
}