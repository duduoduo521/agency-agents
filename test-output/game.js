// 这是一个测试JavaScript文件
console.log('Hello World!');
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // 简单绘图
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 10, 50, 50);
});