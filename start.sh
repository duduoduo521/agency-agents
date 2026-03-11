#!/bin/bash

# ============================================
# The Code Agency- 一键启动脚本
# 
# 功能:
# - 检查环境依赖
# - 构建 Web GUI
# - 启动统一服务器
# - 打开浏览器
# ============================================

echo ""
echo "========================================"
echo "   🚀 The Code Agency- 启动中..."
echo "========================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本：$(node -v)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未找到 npm"
    exit 1
fi

echo "✅ npm 版本：$(npm -v)"

# 进入项目目录
cd "$(dirname "$0")"

# 安装主服务器依赖
echo ""
echo "📦 安装主服务器依赖..."
if [ ! -d "node_modules" ]; then
    npm install express archiver cors
else
    echo "✅ 主服务器依赖已存在"
fi

# 构建 Web GUI
echo ""
echo "🔨 构建 Web GUI..."
cd web-gui

if [ ! -d "node_modules" ]; then
    echo "📦 安装 Web GUI 依赖..."
    npm install
fi

echo "🏗️  开始构建..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web GUI 构建失败"
    exit 1
fi

echo "✅ Web GUI 构建完成"

cd ..

# 创建 generated-code 目录
if [ ! -d "generated-code" ]; then
    mkdir generated-code
    echo "✅ 创建代码输出目录：generated-code"
fi

# 启动服务器
echo ""
echo "🚀 启动统一服务器..."
echo ""

node server.js &
SERVER_PID=$!

# 等待服务器启动
sleep 3

# 检查服务器是否正常启动
if ps -p $SERVER_PID > /dev/null; then
    echo ""
    echo "========================================"
    echo "   ✅ 系统启动成功！"
    echo "========================================"
    echo ""
    echo "🌐 访问地址：http://localhost:3000"
    echo ""
    echo "💡 提示:"
    echo "   - 按 Ctrl+C 停止服务"
    echo "   - 生成的代码保存在：generated-code/"
    echo ""
    
    # 自动打开浏览器（仅 macOS）
   if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:3000
    fi
    
    # 等待进程结束
    wait $SERVER_PID
else
    echo "❌ 服务器启动失败"
    exit 1
fi
