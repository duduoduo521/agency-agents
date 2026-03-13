const fs = require('fs');

// 读取真实的DESIGN_DOC.md内容
const realDesignDoc = fs.readFileSync('generated-code/task-1773385540086/DESIGN_DOC.md', 'utf8');

// 按行分割内容以便解析
const lines = realDesignDoc.split(/\r?\n/);

console.log('总共有', lines.length, '行');

// 找到包含 "文件名：" 的行
for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    console.log(`第${i}行: ${JSON.stringify(line)}`);
    
    if (line.startsWith('```') && lines[i + 1]?.includes('文件名：')) {
        console.log(`  -> 发现文件名模式在第${i}行:`);
        console.log(`  当前行: ${JSON.stringify(lines[i])}`);           // ```
        console.log(`  下一行: ${JSON.stringify(lines[i + 1])}`);       // 文件名：xxx
        console.log(`  再下一行: ${JSON.stringify(lines[i + 2])}`);     // ```lang
        console.log(`  再下两行: ${JSON.stringify(lines[i + 3])}`);     // 代码开始
        
        // 显示接下来的几行代码
        for (let j = i + 3; j < Math.min(i + 8, lines.length); j++) {
            console.log(`  代码行${j}: ${JSON.stringify(lines[j])}`);
        }
        
        // 查找结束的 ```
        for (let j = i + 3; j < lines.length; j++) {
            if (lines[j].startsWith('```')) {
                console.log(`  -> 代码结束于第${j}行: ${JSON.stringify(lines[j])}`);
                break;
            }
        }
        console.log('---');
    }
}