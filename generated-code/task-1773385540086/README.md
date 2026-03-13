# 任务 task-1773385540086

**命令**: create-feature
**描述**: 制作一个html5的设计小游戏， 有趣一些， 画面好看点， 适配移动端和pc， 其他的你自行设计吧

## 生成的代码

这是通过 AI 自动生成的代码。

## 使用说明

请查看具体文件的注释了解使用方法。

## 代码审查结果

我来为您审查并完善这个「色彩迷宫」游戏项目。原代码存在几个关键问题，我将进行修复和优化。

## 代码审查发现的问题：

1. **游戏.js不完整** - 代码在SoundManager类中被截断
2. **变量命名冲突** - `gradientFlow`动画名称在两个地方重复定义
3. **缺少关键功能** - 游戏逻辑未完成，缺少粒子移动、碰撞检测等核心功能
4. **性能问题** - 没有使用requestAnimationFrame优化动画
5. **PWA支持不完整** - manifest.json和sw.js缺失
6. **无障碍问题** - 缺少ARIA标签和键盘导航支持

## 完整修复代码：

```
文件名：index.html
```
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>🎨 色彩迷宫 - 色彩挑战</title>
    <meta name="description" content="一个基于HTML5的色彩迷宫游戏，通过滑动控制彩色粒子穿越动态迷宫">
    <meta name="theme-color" content="#1a1a2e">
    <link rel="stylesheet" href="style.css">
    <link rel="manifest" href="manifest.json">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="色彩迷宫">
    <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎨</text></svg>">
    <title>🎨 色彩迷宫</title>
</head>
<body>
    <div id="game-container">
        <canvas id="gameCanvas"></canvas>
        
        <!-- HUD -->
        <div class="hud" id="hud">
            <div class="score-board">
                <div class="score-label" aria-label="当前分数">分数</div>
                <div id="scoreDisplay" class="score-value" role="status" aria-live="polite">0</div>
            </div>
            <div class="lives-container" id="livesContainer" role="img" aria-label="生命值">
                <div class="life" aria-label="生命 1"></div>
                <div class="life" aria-label="生命 2"></div>
                <div class="life" aria-label="生命 3"></div>
            </div>
            <button class="pause-btn" id="pauseBtn" aria-label="暂停游戏">
                <div class="pause-icon" aria-hidden="true"></div>
            </button>
        </div>

        <!-- Start Screen -->
        <div class="ui-overlay" id="startScreen" role="dialog" aria-labelledby="startTitle">
            <h1 class="game-title" id="startTitle">🎨 色彩迷宫</h1>
            <div class="game-intro">
                <p>在动态迷宫中引导彩色粒子，通过匹配颜色收集能量！</p>
                <p style="margin-top: 15px;">📱 <strong>移动端：</strong>滑动屏幕控制粒子</p>
                <p>💻 <strong>PC端：</strong>鼠标拖拽控制粒子</p>
                <p style="margin-top: 15px;">⌨️ <strong>键盘：</strong>使用方向键控制粒子</p>
            </div>
            <button class="btn" id="startBtn" aria-label="开始游戏">开始游戏</button>
            <div style="margin-top: 20px; color: #b2bec3; font-size: 0.9rem;" aria-label="历史最高分">
                最高分: <span id="highScoreDisplay">0</span>
            </div>
        </div>

        <!-- Game Over Screen -->
        <div class="ui-overlay hidden" id="gameOverScreen" role="dialog" aria-labelledby="gameOverTitle">
            <h1 class="game-title" id="gameOverTitle">游戏结束</h1>
            <div class="game-intro">
                <p>最终得分: <span id="finalScore" style="color: #feca57; font-weight: bold;" aria-label="最终得分">0</span></p>
                <p style="margin-top: 10px;">最高分: <span id="newHighScore" style="color: #74b9ff; font-weight: bold;" aria-label="最高分">0</span></p>
            </div>
            <div class="btn-group">
                <button class="btn" id="restartBtn" aria-label="重新开始游戏">再玩一次</button>
                <button class="btn btn-secondary" id="homeBtn" aria-label="返回主页">返回主页</button>
            </div>
        </div>

        <!-- Pause Screen -->
        <div class="ui-overlay hidden" id="pauseScreen" role="dialog" aria-labelledby="pauseTitle">
            <h1 class="game-title" id="pauseTitle">游戏暂停</h1>
            <div class="game-intro">
                <p>休息一下，准备继续挑战！</p>
            </div>
            <div class="btn-group">
                <button class="btn" id="resumeBtn" aria-label="继续游戏">继续游戏</button>
                <button class="btn btn-secondary" id="quitBtn" aria-label="退出游戏">退出游戏</button>
            </div>
        </div>
    </div>

    <script src="game.js"></script>
    <script>
        // 服务工作者注册
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js')
                    .then(registration => console.log('SW registered:', registration))
                    .catch(error => console.log('SW registration failed:', error));
            });
        }
    </script>
</body>
</html>
```

```
文件名：style.css
```
```css
/* 全局样式重置 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* 响应式基础样式 */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
    background-size: 400% 400%;
    animation: gradientFlow 15s ease infinite;
    color: white;
    overflow: hidden;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-font-smoothing: antialiased;
}

@keyframes gradientFlow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

/* 游戏容器 */
#game-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 画布样式 */
canvas {
    display: block;
    background: rgba(0, 0, 0, 0.2);
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    touch-action: none;
    max-width: 100%;
    max-height: 100%;
}

/* UI 覆盖层通用样式 */
.ui-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    z-index: 100;
    transition: opacity 0.3s ease;
    padding: 20px;
    outline: none;
}

/* 隐藏类 */
.hidden {
    opacity: 0;
    pointer-events: none;
}

/* 游戏标题样式 */
.game-title {
    font-size: 3.5rem;
    margin-bottom: 20px;
    background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #a29bfe);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: rainbowFlow 3s ease infinite;
    text-align: center;
    line-height: 1.2;
}

@keyframes rainbowFlow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

/* 游戏介绍 */
.game-intro {
    text-align: center;
    margin-bottom: 30px;
    font-size: 1.2rem;
    line-height: 1.8;
    color: #dfe6e9;
    max-width: 600px;
    padding: 0 20px;
}

/* 按钮样式 */
.btn {
    padding: 15px 40px;
    font-size: 1.5rem;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    background: linear-gradient(45deg, #6c5ce7, #a29bfe);
    color: white;
    transition: all 0.3s ease;
    margin: 10px;
    box-shadow: 0 4px 15px rgba(108, 92, 231, 0.4);
    font-weight: 600;
    letter-spacing: 0.5px;
}

.btn:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 7px 20px rgba(108, 92, 231, 0.6);
}

.btn:active {
    transform: translateY(1px) scale(0.98);
}

.btn:focus {
    outline: 2px solid #a29bfe;
    outline-offset: 4px;
}

.btn-secondary {
    background: linear-gradient(45deg, #0984e3, #74b9ff);
    box-shadow: 0 4px 15px rgba(9, 132, 227, 0.4);
}

.btn-secondary:hover {
    box-shadow: 0 7px 20px rgba(9, 132, 227, 0.6);
}

/* 按钮组 */
.btn-group {
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
}

/* HUD 样式 */
.hud {
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;
    z-index: 50;
}

.score-board {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    padding: 10px 20px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.score-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #a29bfe;
}

.score-value {
    font-size: 1.5rem;
    color: #feca57;
    font-weight: bold;
    text-shadow: 0 0 5px rgba(254, 202, 87, 0.5);
}

.lives-container {
    display: flex;
    gap: 8px;
}

.life {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #ff6b6b;
    box-shadow: 0 0 12px rgba(255, 107, 107, 0.7);
    transition: all 0.3s ease;
}

.life.lost {
    background: #636e72;
    box-shadow: none;
    opacity: 0.3;
}

/* 暂停按钮 */
.pause-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 50;
    pointer-events: auto;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.pause-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
}

.pause-btn:focus {
    outline: 2px solid #a29bfe;
    outline-offset: 4px;
}

.pause-icon {
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 3px;
    transition: all 0.3s ease;
}

.pause-icon.paused {
    width: 20px;
    height: 20px;
    position: relative;
}

.pause-icon.paused::before,
.pause-icon.paused::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 20px;
    background: white;
    border-radius: 2px;
    transition: all 0.3s ease;
}

.pause-icon.paused::before {
    left: 0;
}

.pause-icon.paused::after {
    right: 0;
}

/* 移动端响应式适配 */
@media (max-width: 768px) {
    .game-title {
        font-size: 2.5rem;
        margin-bottom: 15px;
    }
    
    .game-intro {
        font-size: 1rem;
        padding: 0 15px;
    }
    
    .btn {
        padding: 12px 30px;
        font-size: 1.2rem;
        width: 100%;
        max-width: 300px;
    }
    
    .pause-btn {
        width: 40px;
        height: 40px;
        top: 15px;
        right: 15px;
    }
    
    .pause-icon {
        width: 16px;
        height: 16px;
    }
    
    .pause-icon.paused::before,
    .pause-icon.paused::after {
        width: 4px;
        height: 16px;
    }
    
    .score-value {
        font-size: 1.3rem;
    }
    
    .life {
        width: 20px;
        height: 20px;
    }
}

/* 适配小屏幕 */
@media (max-width: 480px) {
    .game-title {
        font-size: 2rem;
    }
    
    .btn-group {
        gap: 10px;
    }
    
    .btn {
        padding: 10px 25px;
        font-size: 1.1rem;
    }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
    body {
        background: linear-gradient(135deg, #0a0a14, #080a12, #05060a);
    }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* 打印样式 */
@media print {
    body {
        background: none;
    }
    
    .ui-overlay {
        display: none;
    }
    
    canvas {
        display: none;
    }
}
```

```
文件名：game.js
```
```javascript
/**
 * 色彩迷宫游戏 - 主逻辑文件
 * 
 * 功能特性：
 * - 动态迷宫生成算法
 * - 色彩匹配机制
 * - 多平台适配（PC/移动端）
 * - 响应式UI设计
 * - 本地存储持久化
 * - 音效系统
 * - 键盘和触摸控制
 * - 完整的游戏循环和状态管理
 */

// 颜色定义
const COLORS = {
    red: '#ff6b6b',
    yellow: '#feca57',
    blue: '#48dbfb',
    purple: '#a29bfe',
    green: '#55efc4',
    orange: '#fab1a0',
    white: '#ffffff',
    black: '#2d3436',
    gray: '#636e72',
    darkBlue: '#0984e3',
    indigo: '#6c5ce7'
};

// 游戏配置常量
const CONFIG = {
    PARTIC