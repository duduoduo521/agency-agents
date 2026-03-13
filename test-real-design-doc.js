const fs = require('fs');
const path = require('path');

/**
 * 解析 AI 生成的代码并保存为文件
 * 这是从server.js复制的修复后的函数
 */
function saveGeneratedFiles(codeContent, outputDir) {
  // 尝试匹配：文件名：path/to/file.ext\n```\ncode\n```
  const fileNameFirstPattern = /文件名[:：]\s*([^\n`"']+\.(?:js|html|css|json|md|txt|py|java|cpp|c|ts|jsx|tsx))\s*\n```(?:\w+)?\n([\s\S]*?)```\s*(?=\n|$|文件名[:：]|```[\s\n]*```)/g;
  let match;
  const files = [];
  const extractedFilePaths = new Set(); // 用于避免重复处理相同的文件路径
  
  // 匹配文件名优先格式
  while ((match = fileNameFirstPattern.exec(codeContent)) !== null) {
    const filePath = match[1].trim().replace(/[`"'*]/g, '');
    const fileContent = match[2].trim();
    
    // 确保文件路径包含扩展名且不重复
    if (filePath.includes('.') && !extractedFilePaths.has(filePath)) {
      files.push({
        path: filePath,
        content: fileContent
      });
      extractedFilePaths.add(filePath);
    }
  }

  // 如果没有匹配到文件名格式，尝试其他格式
  if (files.length === 0) {
    // 尝试匹配：```文件名：path/to/file.ext```\n```lang\ncode\n```
    const fileNamePattern = /```\s*文件名[:：]\s*([^\n`"']+\.(?:js|html|css|json|md|txt|py|java|cpp|c|ts|jsx|tsx))\s*```\s*\n```(?:\w+)?\n([\s\S]*?)```\s*(?=\n|$|```)/g;
    while ((match = fileNamePattern.exec(codeContent)) !== null) {
      const filePath = match[1].trim().replace(/[`"'*]/g, '');
      const fileContent = match[2].trim();
      
      if (!extractedFilePaths.has(filePath)) {
        files.push({
          path: filePath,
          content: fileContent
        });
        extractedFilePaths.add(filePath);
      }
    }

    // 如果仍然没有匹配到，尝试匹配：```lang\n[filename]\n```code```
    if (files.length === 0) {
      const langThenFilePattern = /```(\w+)\s*([^\n`]*\.(?:js|html|css|json|md|txt|py|java|cpp|c|ts|jsx|tsx))\s*\n([\s\S]*?)```\s*(?=\n|$|```)/g;
      while ((match = langThenFilePattern.exec(codeContent)) !== null) {
        const filePath = match[2].trim().replace(/[`"'*]/g, '');
        const fileContent = match[3] ? match[3].trim() : '';
        
        if (!extractedFilePaths.has(filePath)) {
          files.push({
            path: filePath,
            content: fileContent
          });
          extractedFilePaths.add(filePath);
        }
      }
    }

    // 如果仍然没有匹配到，尝试匹配没有明确文件名的代码块
    if (files.length === 0) {
      // 匹配：```lang\n```code```
      const codeBlockPattern = /```(\w+)?\s*\n([\s\S]*?)```\s*(?=\n|$|```)/g;
      while ((match = codeBlockPattern.exec(codeContent)) !== null) {
        const codeLang = match[1] ? match[1].toLowerCase() : '';
        const fileContent = match[2].trim();
        let extension = 'txt';

        // 根据语言标识符确定文件扩展名
        if (codeLang === 'html') extension = 'html';
        else if (codeLang === 'css') extension = 'css';
        else if (codeLang === 'javascript' || codeLang === 'js' || codeLang.includes('js')) extension = 'js';
        else if (codeLang === 'json') extension = 'json';
        else if (codeLang === 'md' || codeLang === 'markdown') extension = 'md';
        else if (codeLang === 'python' || codeLang === 'py') extension = 'py';
        else if (codeLang === 'java') extension = 'java';
        else if (codeLang === 'cpp' || codeLang === 'c++') extension = 'cpp';
        else if (codeLang === 'c') extension = 'c';
        else if (codeLang === 'typescript' || codeLang === 'ts') extension = 'ts';
        else if (codeLang === 'jsx') extension = 'jsx';
        else if (codeLang === 'tsx') extension = 'tsx';

        // 尝试从代码内容推断文件类型
        if (extension === 'txt') {
          if (fileContent.includes('<!DOCTYPE html>') || fileContent.includes('<html')) extension = 'html';
          else if (fileContent.includes('import ') || fileContent.includes('function ') || fileContent.includes('const ') || fileContent.includes('let ')) extension = 'js';
          else if (fileContent.includes('body {') || fileContent.includes('margin:')) extension = 'css';
          else if (fileContent.includes('def ') || fileContent.includes('import ') || fileContent.includes('print(')) extension = 'py';
        }

        // 生成文件名
        const fileName = `generated_${files.length + 1}.${extension}`;
        if (!extractedFilePaths.has(fileName)) {
          files.push({
            path: fileName,
            content: fileContent
          });
          extractedFilePaths.add(fileName);
        }
      }
    }
  }

  // 如果没有找到任何代码块，尝试智能判断整个内容类型
  if (files.length === 0) {
    // 检查是否是 HTML 文件
    if (codeContent.includes('<!DOCTYPE html>') || codeContent.includes('<html')) {
      const htmlPath = path.join(outputDir, 'index.html');
      fs.writeFileSync(htmlPath, codeContent);
      console.log(`保存HTML文件: ${htmlPath}`);
    } else if (codeContent.includes('import ') || codeContent.includes('export ') || codeContent.includes('function ') || codeContent.includes('const ') || codeContent.includes('let ')) {
      // 检查是否是 JS 文件
      const jsPath = path.join(outputDir, 'main.js');
      fs.writeFileSync(jsPath, codeContent);
      console.log(`保存JS文件: ${jsPath}`);
    } else if (codeContent.includes('body {') || codeContent.includes('margin:') || codeContent.includes('padding:')) {
      // 检查是否是 CSS 文件
      const cssPath = path.join(outputDir, 'style.css');
      fs.writeFileSync(cssPath, codeContent);
      console.log(`保存CSS文件: ${cssPath}`);
    } else {
      // 默认保存为文本文件
      const txtPath = path.join(outputDir, 'output.txt');
      fs.writeFileSync(txtPath, codeContent);
      console.log(`保存输出文件: ${txtPath}`);
    }
    return;
  }

  // 保存每个文件
  files.forEach(file => {
    const fullPath = path.join(outputDir, file.path);
    const dir = path.dirname(fullPath);
    
    // 创建目录
    fs.mkdirSync(dir, { recursive: true });
    
    // 写入文件
    fs.writeFileSync(fullPath, file.content);
    console.log(`保存文件: ${fullPath} (${file.content.length} 字符)`);
  });
}

// 读取真实的DESIGN_DOC.md内容
const realDesignDoc = fs.readFileSync('generated-code/task-1773385540086/DESIGN_DOC.md', 'utf8');

// 创建测试输出目录
const testOutputDir = './real-test-output';
if (!fs.existsSync(testOutputDir)) {
    fs.mkdirSync(testOutputDir, { recursive: true });
}

console.log('开始测试真实的 DESIGN_DOC.md 内容...');
saveGeneratedFiles(realDesignDoc, testOutputDir);
console.log('真实内容测试完成！检查 real-test-output 目录中的文件。');

// 验证生成的文件
const files = fs.readdirSync(testOutputDir);
console.log('\\n生成的文件列表：');
files.forEach(file => {
    const stats = fs.statSync(path.join(testOutputDir, file));
    console.log(`- ${file} (${stats.size} 字节)`);
});
