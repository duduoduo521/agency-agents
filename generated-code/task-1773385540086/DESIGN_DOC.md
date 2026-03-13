根据您的需求，我将为您构建一个完整的「色彩迷宫」游戏。这是一个纯前端单页应用，无需后端和数据库。让我提供完整的实现方案：

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
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
            color: white;
            overflow: hidden;
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
        }

        #game-container {
            position: relative;
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        canvas {
            display: block;
            background: rgba(0, 0, 0, 0.2);
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            touch-action: none;
        }

        /* UI Overlay */
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
            z-index: 100;
            transition: opacity 0.3s ease;
        }

        .hidden {
            opacity: 0;
            pointer-events: none;
        }

        h1 {
            font-size: 3rem;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
            background-size: 300%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradientFlow 3s ease infinite;
            text-align: center;
        }

        @keyframes gradientFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .game-intro {
            text-align: center;
            margin-bottom: 30px;
            font-size: 1.2rem;
            line-height: 1.6;
            color: #dfe6e9;
            max-width: 600px;
        }

        .btn {
            padding: 15px 40px;
            font-size: 1.5rem;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            background: linear-gradient(45deg, #6c5ce7, #a29bfe);
            color: white;
            transition: transform 0.2s, box-shadow 0.2s;
            margin: 10px;
            box-shadow: 0 4px 15px rgba(108, 92, 231, 0.4);
        }

        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 7px 20px rgba(108, 92, 231, 0.6);
        }

        .btn:active {
            transform: translateY(1px);
        }

        .btn-secondary {
            background: linear-gradient(45deg, #0984e3, #74b9ff);
            box-shadow: 0 4px 15px rgba(9, 132, 227, 0.4);
        }

        .btn-secondary:hover {
            box-shadow: 0 7px 20px rgba(9, 132, 227, 0.6);
        }

        /* HUD */
        .hud {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            display: flex;
            justify-content: space-between;
            pointer-events: none;
            z-index: 50;
        }

        .score-board {
            background: rgba(0, 0, 0, 0.6);
            padding: 10px 20px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            font-size: 1.3rem;
        }

        .score-value {
            color: #feca57;
            font-weight: bold;
            margin-left: 5px;
        }

        .lives-container {
            display: flex;
            gap: 5px;
        }

        .life {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #ff6b6b;
            box-shadow: 0 0 10px rgba(255, 107, 107, 0.6);
        }

        .life.lost {
            opacity: 0.3;
        }

        .pause-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            backdrop-filter: blur(10px);
            z-index: 50;
            pointer-events: auto;
        }

        .pause-icon {
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 3px;
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
        }

        .pause-icon.paused::before {
            left: 0;
        }

        .pause-icon.paused::after {
            right: 0;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
            h1 { font-size: 2rem; }
            .game-intro { font-size: 1rem; padding: 0 20px; }
            .btn { padding: 12px 30px; font-size: 1.2rem; }
            .pause-btn { width: 35px; height: 35px; }
        }
    </style>
</head>
<body>
    <div id="game-container">
        <canvas id="gameCanvas"></canvas>
        
        <!-- HUD -->
        <div class="hud" id="hud">
            <div class="score-board">
                分数: <span id="scoreDisplay" class="score-value">0</span>
            </div>
            <div class="lives-container" id="livesContainer">
                <div class="life"></div>
                <div class="life"></div>
                <div class="life"></div>
            </div>
            <div class="pause-btn" id="pauseBtn">
                <div class="pause-icon"></div>
            </div>
        </div>

        <!-- Start Screen -->
        <div class="ui-overlay" id="startScreen">
            <h1>🎨 色彩迷宫</h1>
            <div class="game-intro">
                <p>在动态迷宫中引导彩色粒子，通过匹配颜色收集能量！</p>
                <p style="margin-top: 15px;">📱 <strong>移动端：</strong>滑动屏幕控制粒子</p>
                <p>💻 <strong>PC端：</strong>鼠标拖拽控制粒子</p>
            </div>
            <button class="btn" id="startBtn">开始游戏</button>
            <div style="margin-top: 20px; color: #b2bec3; font-size: 0.9rem;">
                最高分: <span id="highScoreDisplay">0</span>
            </div>
        </div>

        <!-- Game Over Screen -->
        <div class="ui-overlay hidden" id="gameOverScreen">
            <h1>游戏结束</h1>
            <div class="game-intro">
                <p>最终得分: <span id="finalScore" style="color: #feca57; font-weight: bold;">0</span></p>
                <p style="margin-top: 10px;">最高分: <span id="newHighScore" style="color: #74b9ff; font-weight: bold;">0</span></p>
            </div>
            <button class="btn" id="restartBtn">再玩一次</button>
            <button class="btn btn-secondary" id="homeBtn">返回主页</button>
        </div>

        <!-- Pause Screen -->
        <div class="ui-overlay hidden" id="pauseScreen">
            <h1>游戏暂停</h1>
            <div class="game-intro">
                <p>休息一下，准备继续挑战！</p>
            </div>
            <button class="btn" id="resumeBtn">继续游戏</button>
            <button class="btn btn-secondary" id="quitBtn">退出游戏</button>
        </div>
    </div>

    <script src="game.js"></script>
</body>
</html>
```

```
文件名：game.js
```
```javascript
/**
 * 色彩迷宫游戏 - 主逻辑文件
 * 
 * 项目结构：
 * - Game: 游戏主控制器，管理整体游戏循环
 * - Particle: 粒子类，代表玩家控制的角色
 * - Maze: 迷宫管理器，处理迷宫生成和渲染
 * - Obstacle: 障碍物类
 * - PowerUp: 能量点类
 * - InputHandler: 输入处理，支持触摸和鼠标
 * - SoundManager: 音效管理器
 * 
 * 功能特性：
 * - 动态迷宫生成算法
 * - 色彩匹配机制
 * - 多平台适配（PC/移动端）
 * - 响应式UI设计
 * - 本地存储持久化
 * - 音效系统
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
    black: '#2d3436'
};

// 游戏配置常量
const CONFIG = {
    PARTICLE_RADIUS: 15,
    PARTICLE_SPEED: 4,
    MAZE_ROWS: 8,
    MAZE_COLS: 8,
    MAZE_PADDING: 20,
    OBSTACLE_COUNT: 5,
    POWERUP_COUNT: 8,
    MAX_LIVES: 3,
    SCORE_PER_POWERUP: 100,
    SCORE_PER_OBSTACLE: -20,
    BASE_SPEED: 4,
    SPEED_INCREMENT: 0.2,
    MAX_SPEED: 8,
    COLOR_MATCH_BONUS: 50,
    COLOR_MISMATCH_PENALTY: -30
};

/**
 * 音效管理器 - 简单的Web Audio API实现
 */
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playTone(freq, type = 'sine', duration = 0.3) {
        if (!this.enabled || !this.audioContext) return;
        
        // 恢复AudioContext（移动端需用户交互后恢复）
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playCollect() {
        this.playTone(600, 'sine', 0.2);
        setTimeout(() => this.playTone(800, 'sine', 0.3), 50);
    }

    playMatch() {
        this.playTone(400, 'triangle', 0.1);
        setTimeout(() => this.playTone(600, 'triangle', 0.2), 50);
        setTimeout(() => this.playTone(800, 'triangle', 0.3), 100);
    }

    playMismatch() {
        this.playTone(200, 'sawtooth', 0.3);
        setTimeout(() => this.playTone(150, 'sawtooth', 0.4), 100);
    }

    playGameOver() {
        this.playTone(400, 'sine', 0.3);
        setTimeout(() => this.playTone(300, 'sine', 0.3), 200);
        setTimeout(() => this.playTone(200, 'sine', 0.4), 400);
        setTimeout(() => this.playTone(100, 'sine', 0.5), 600);
    }

    playPause() {
        this.playTone(300, 'sine', 0.1);
    }

    playResume() {
        this.playTone(500, 'sine', 0.1);
    }
}

/**
 * 迷宫生成器 - 使用深度优先搜索算法生成迷宫
 */
class Maze {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = [];
        this.walls = [];
        this.colors = Object.values(COLORS).filter(c => c !== COLORS.white && c !== COLORS.black);
    }

    // 生成迷宫网格
    generate() {
        // 初始化网格
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(1));
        
        // 深度优先搜索生成迷宫
        const stack = [];
        const start = { x: 0, y: 0 };
        this.grid[start.y][start.x] = 0;
        stack.push(start);
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(current);
            
            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.removeWall(current, next);
                this.grid[next.y][next.x] = 0;
                stack.push(next);
            } else {
                stack.pop();
            }
        }
        
        // 为路径分配颜色
        this.assignColors();
        
        // 生成墙壁
        this.walls = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] === 1) {
                    this.walls.push({
                        x: x,
                        y: y,
                        color: this.getRandomColor()
                    });
                }
            }
        }
        
        return this.walls;
    }

    getUnvisitedNeighbors(cell) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // 上
            { x: 0, y: 1 },  // 下
            { x: -1, y: 0 }, // 左
            { x: 1, y: 0 }   // 右
        ];
        
        for (const dir of directions) {
            const nx = cell.x + dir.x;
            const ny = cell.y + dir.y;
            
            if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows && this.grid[ny][nx] === 1) {
                neighbors.push({ x: nx, y: ny });
            }
        }
        
        return neighbors;
    }

    removeWall(cell1, cell2) {
        const dx = cell2.x - cell1.x;
        const dy = cell2.y - cell1.y;
        
        // 移除中间的墙
        if (dx === 0 && dy === -1) { // 上
            this.grid[cell1.y - 1][cell1.x] = 0;
        } else if (dx === 0 && dy === 1) { // 下
            this.grid[cell1.y + 1][cell1.x] = 0;
        } else if (dx === -1 && dy === 0) { // 左
            this.grid[cell1.y][cell1.x - 1] = 0;
        } else if (dx === 1 && dy === 0) { // 右
            this.grid[cell1.y][cell1.x + 1] = 0;
        }
    }

    assignColors() {
        // 为迷宫路径分配颜色（简化版，实际可以更复杂）
        for (let y = 0; y < this.rows;