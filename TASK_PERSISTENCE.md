# 任务状态持久化解决方案

## 问题背景

在原始设计中，The Code Agency 使用内存中的 Map 对象来存储任务状态。这种设计存在以下问题：

1. 关闭浏览器后，任务状态丢失
2. 服务重启后，所有正在进行的任务状态丢失
3. 无法实现真正意义上的后台任务处理

## 解决方案

我们实现了基于文件系统的任务状态持久化机制，确保任务状态在服务重启后仍然保持。

### 核心实现

1. **任务数据目录**：
   - 创建 `data/tasks/` 目录用于存储任务状态
   - 每个任务对应一个JSON文件，文件名为 `{taskId}.json`

2. **持久化机制**：
   - 服务启动时自动从磁盘加载已有任务
   - 任务状态更新时同步保存到磁盘
   - 任务删除时同步删除磁盘文件

3. **API集成**：
   - 所有任务相关的API端点都与文件系统同步
   - 确保内存状态与磁盘状态的一致性

### 代码变更

#### 1. 任务存储初始化
```javascript
// 创建任务数据目录
const TASKS_DIR = path.join(__dirname, 'data', 'tasks');
if (!fs.existsSync(TASKS_DIR)) {
  fs.mkdirSync(TASKS_DIR, { recursive: true });
}

// 从文件系统加载现有任务
function loadTasksFromDisk() {
  const taskFiles = fs.readdirSync(TASKS_DIR);
  for (const file of taskFiles) {
    if (file.endsWith('.json')) {
      try {
        const taskData = JSON.parse(fs.readFileSync(path.join(TASKS_DIR, file), 'utf8'));
        tasks.set(taskData.id, taskData);
      } catch (error) {
        console.error(`加载任务文件失败 ${file}:`, error.message);
      }
    }
  }
  console.log(`✅ 从磁盘加载了 ${tasks.size} 个任务`);
}
```

#### 2. 任务保存功能
```javascript
// 保存任务到磁盘
function saveTaskToDisk(taskId, taskData) {
  try {
    const taskFilePath = path.join(TASKS_DIR, `${taskId}.json`);
    fs.writeFileSync(taskFilePath, JSON.stringify(taskData, null, 2));
  } catch (error) {
    console.error(`保存任务到磁盘失败 ${taskId}:`, error.message);
  }
}
```

#### 3. 状态更新同步
```javascript
function updateTaskStatus(taskId, status, progress) {
 const task = tasks.get(taskId);
  if (task) {
   task.status = status;
   task.progress = progress;
   task.updatedAt = new Date().toISOString();
   tasks.set(taskId, task); // 更新map中的任务
   saveTaskToDisk(taskId, task); // 保存到磁盘
   taskEmitter.emit('taskUpdate', task);
  }
}
```

### 功能优势

1. **状态持久化**：即使关闭浏览器或重启服务，任务状态也不会丢失
2. **后台处理**：任务可以在后台持续运行，不受前端影响
3. **数据安全**：任务数据双重保障（内存+磁盘）
4. **无缝体验**：用户可以从上次离开的地方继续

### 使用场景

现在，以下场景都可以正常使用：

1. 用户提交任务后关闭浏览器，稍后重新打开查看进度
2. 服务重启后，用户可以看到之前提交的任务状态
3. 长时间运行的任务可以在后台执行，用户随时查看进度
4. 任务完成通知仍然有效，即使用户不在页面上

## 总结

通过实现任务状态持久化，我们解决了用户在使用过程中的关键痛点，使得 The Code Agency 成为一个更加可靠和实用的AI编程助手平台。