import React, { useState, useEffect } from'react';
import { 
  Card, Table, Button, Tag, Space, Modal, Form, Input, Select, 
  message, Progress, Drawer, Timeline, Statistic, Row, Col, Badge,
  Tooltip, Popconfirm, notification
} from'antd';
import { 
  PlusOutlined, PlayCircleOutlined, CheckCircleOutlined,
  SyncOutlined, CloseCircleOutlined, DownloadOutlined,
  DeleteOutlined, EyeOutlined, CodeOutlined, SearchOutlined
} from '@ant-design/icons';
import { taskApi, healthApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import JSZip from'jszip';
import { saveAs } from 'file-saver';
import dayjs from'dayjs';

const { TextArea } = Input;

// 任务状态映射
const statusConfig = {
 pending: { color: 'orange', text: '待处理', icon: <SyncOutlined /> },
 analyzing: { color: 'blue', text: '需求分析中', icon: <SyncOutlined spin /> },
 designing: { color: 'cyan', text: '设计中', icon: <SyncOutlined spin /> },
 coding: { color: 'purple', text: '编码中', icon: <CodeOutlined spin /> },
 testing: { color: 'gold', text: '测试中', icon: <SyncOutlined spin /> },
 reviewing: { color: 'lime', text: '审查中', icon: <SyncOutlined spin /> },
 completed: { color: 'green', text: '已完成', icon: <CheckCircleOutlined /> },
 failed: { color: 'red', text: '失败', icon: <CloseCircleOutlined /> }
};

const TaskPage = () => {
 const [tasks, setTasks] = useState([]);
const [loading, setLoading] = useState(false);
const [selectedTask, setSelectedTask] = useState(null);
const [drawerVisible, setDrawerVisible] = useState(false);
const [createModalVisible, setCreateModalVisible] = useState(false);
const [searchText, setSearchText] = useState('');
const [filteredTasks, setFilteredTasks] = useState([]);
const [createForm] = Form.useForm();
const navigate = useNavigate();

 // 检查大模型配置状态
 const checkLlmConfig = async () => {
   try {
     const response = await healthApi.checkLlmConfig();
     return response.data?.configured === true;
   } catch (error) {
     console.error('检查大模型配置失败:', error);
     return false;
   }
 };

 // 创建任务处理函数
 const handleCreateTask = async (values) => {
   // 先检查大模型配置
   const isConfigured = await checkLlmConfig();
   
   if (!isConfigured) {
     // 显示提示并跳转到设置页面
     Modal.confirm({
       title: '大模型未配置',
       content: '您尚未配置大模型。请先配置大模型后才能创建任务。',
       okText: '去配置',
       cancelText: '取消',
       onOk: () => {
         setCreateModalVisible(false);
         navigate('/settings');
       },
       onCancel: () => {
         // 取消创建
       }
     });
     return;
   }

   try {
     const taskData = {
       command: values.command,
       description: values.description,
       techStack: values.techStack || [],
       status: 'pending',
       progress: 0
     };
     
     await taskApi.createTask(taskData);
     message.success('任务创建成功！');
     setCreateModalVisible(false);
     createForm.resetFields();
     fetchTasks();
   } catch (error) {
     message.error('创建任务失败，请稍后重试');
     console.error('创建任务失败:', error);
   }
 };

 // 获取任务列表
 const fetchTasks = async () => {
   setLoading(true);
   try {
     const response = await taskApi.getTasks();
     setTasks(response.data);
   } catch (error) {
    message.error('获取任务列表失败');
    }
   setLoading(false);
 };

 useEffect(() => {
   fetchTasks();
   // 每 5 秒刷新一次
   const interval = setInterval(fetchTasks, 5000);
  return () => clearInterval(interval);
 }, []);

 // 根据搜索文本过滤任务
 useEffect(() => {
   if (!searchText) {
     setFilteredTasks(tasks);
   } else {
     const filtered = tasks.filter(task => 
       task.id.toLowerCase().includes(searchText.toLowerCase()) ||
       task.command.toLowerCase().includes(searchText.toLowerCase()) ||
       task.params.toLowerCase().includes(searchText.toLowerCase())
     );
     setFilteredTasks(filtered);
   }
 }, [tasks, searchText]);

 // 查看任务详情
 const viewTaskDetail = async (task) => {
   setSelectedTask(task);
   setDrawerVisible(true);
 };

 // 下载代码
 const downloadCode = async (task) => {
  if (!task.zipUrl) {
    message.warning('任务尚未完成，无法下载');
   return;
   }
   
   try {
    // 使用下载链接
    window.open(`http://localhost:3000${task.zipUrl}`, '_blank');
    message.success('下载已开始！');
   } catch (error) {
    message.error('下载失败');
    }
 };

 // 删除任务
 const deleteTask = async (taskId) => {
   try {
     await taskApi.deleteTask(taskId);
    message.success('删除成功');
     fetchTasks();
   } catch (error) {
    message.error('删除失败');
    }
 };

 // 表格列定义
 const columns = [
   {
     title: '任务 ID',
     dataIndex: 'id',
    key: 'id',
     width: 180,
     sorter: (a, b) => a.id.localeCompare(b.id)
    },
   {
     title: '命令',
     dataIndex: 'command',
    key: 'command',
    render: (text) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    sorter: (a, b) => a.command.localeCompare(b.command)
    },
   {
     title: '参数',
     dataIndex: 'params',
    key: 'params',
     ellipsis: true
    },
   {
     title: '状态',
     dataIndex: 'status',
    key: 'status',
    render: (status) => {
       const config = statusConfig[status] || statusConfig.pending;
      return (
         <Tag color={config.color} icon={config.icon}>
           {config.text}
         </Tag>
       );
     },
    filters: Object.keys(statusConfig).map(key => ({ text: statusConfig[key].text, value: key })),
    onFilter: (value, record) => record.status === value
    },
   {
     title: '进度',
     dataIndex: 'progress',
    key: 'progress',
    render: (progress) => (
       <Progress percent={progress} strokeColor={progress === 100 ? '#52c41a' : '#1677ff'} size="small" />
     ),
    sorter: (a, b) => a.progress - b.progress
    },
   {
     title: '创建时间',
     dataIndex: 'createdAt',
    key: 'createdAt',
    render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    },
   {
     title: '操作',
    key: 'action',
    render: (_, record) => (
       <Space size="small">
         <Button
          type="link"
           size="small"
           icon={<EyeOutlined />}
           onClick={() => viewTaskDetail(record)}
         >
          查看
         </Button>
         {record.status === 'completed' && (
           <Button
            type="link"
             size="small"
             icon={<DownloadOutlined />}
             onClick={() => downloadCode(record)}
           >
             下载
           </Button>
         )}
         <Popconfirm
           title="确定要删除此任务吗？"
           onConfirm={() => deleteTask(record.id)}
           okText="确定"
           cancelText="取消"
         >
           <Button type="link" size="small" danger icon={<DeleteOutlined />}>
             删除
           </Button>
         </Popconfirm>
       </Space>
     )
    }
  ];

 return (
   <div>
     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
       <h1 style={{ margin: 0 }}>任务管理</h1>
       <Button
        type="primary"
         size="large"
         icon={<PlusOutlined />}
         onClick={() => setCreateModalVisible(true)}
       >
         创建任务
       </Button>
     </div>

     <Row gutter={16} style={{ marginBottom: 24 }}>
       <Col span={6}>
         <Card>
           <Statistic
             title="总任务数"
             value={tasks.length}
            prefix={<PlayCircleOutlined />}
           />
         </Card>
       </Col>
       <Col span={6}>
         <Card>
           <Statistic
             title="进行中"
             value={tasks.filter(t => ['analyzing', 'designing', 'coding', 'testing', 'reviewing'].includes(t.status)).length}
            prefix={<SyncOutlined spin style={{ color: '#1677ff' }} />}
           />
         </Card>
       </Col>
       <Col span={6}>
         <Card>
           <Statistic
             title="已完成"
             value={tasks.filter(t => t.status === 'completed').length}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
           />
         </Card>
       </Col>
       <Col span={6}>
         <Card>
           <Statistic
             title="失败"
             value={tasks.filter(t => t.status === 'failed').length}
            prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
           />
         </Card>
       </Col>
     </Row>

     <Card style={{ marginBottom: 24 }}>
       <Input
         placeholder="搜索任务ID、命令或参数"
         prefix={<SearchOutlined />}
         value={searchText}
         onChange={(e) => setSearchText(e.target.value)}
         style={{ maxWidth: 300 }}
       />
     </Card>

     <Card>
       <Table
         columns={columns}
         dataSource={filteredTasks}
         loading={loading}
         rowKey="id"
         pagination={{ pageSize: 10 }}
       />
     </Card>

     {/* 创建任务弹窗 */}
     <Modal
       title="创建新任务"
       open={createModalVisible}
       onCancel={() => setCreateModalVisible(false)}
       onOk={() => createForm.submit()}
       okText="创建"
       cancelText="取消"
     >
       <Form form={createForm} layout="vertical" onFinish={handleCreateTask}>
         <Form.Item
          label="命令类型"
           name="command"
           rules={[{ required: true, message: '请选择命令类型' }]}
         >
           <Select>
             <Select.Option value="create-feature">创建功能</Select.Option>
             <Select.Option value="fix-bug">修复 Bug</Select.Option>
             <Select.Option value="refactor-code">重构代码</Select.Option>
             <Select.Option value="add-test">添加测试</Select.Option>
           </Select>
         </Form.Item>

         <Form.Item
          label="任务描述"
           name="description"
           rules={[{ required: true, message: '请输入任务描述' }]}
         >
           <TextArea 
             rows={4} 
             placeholder="例如：制作一个 HTML5 赛车小游戏，包含起点、终点和障碍物..."
           />
         </Form.Item>

         <Form.Item
          label="技术栈偏好"
           name="techStack"
         >
           <Select mode="multiple" placeholder="选择技术栈偏好（可选）">
             <Select.Option value="react">React</Select.Option>
             <Select.Option value="vue">Vue</Select.Option>
             <Select.Option value="node">Node.js</Select.Option>
             <Select.Option value="python">Python</Select.Option>
             <Select.Option value="html5">HTML5</Select.Option>
           </Select>
         </Form.Item>
       </Form>
     </Modal>

     {/* 任务详情抽屉 */}
     {selectedTask && (
       <Drawer
         title={`任务详情 - ${selectedTask.id}`}
         placement="right"
         width={800}
         open={drawerVisible}
         onClose={() => setDrawerVisible(false)}
       >
         <Space direction="vertical" style={{ width: '100%' }} size="large">
           {/* 基本信息 */}
           <Card title="基本信息" size="small">
             <p><strong>命令:</strong> <code>{selectedTask.command}</code></p>
             <p><strong>参数:</strong> {selectedTask.params}</p>
             <p><strong>状态:</strong> <Badge status={statusConfig[selectedTask.status]?.color || 'default'} text={statusConfig[selectedTask.status]?.text || selectedTask.status} /></p>
             <p><strong>进度:</strong> <Progress percent={selectedTask.progress} /></p>
             <p><strong>创建时间:</strong> {dayjs(selectedTask.createdAt).format('YYYY-MM-DD HH:mm:ss')}</p>
           </Card>

           {/* 实时日志 */}
           <Card title="执行日志" size="small">
             <Timeline
               items={selectedTask.logs?.map((log, index) => ({
                key: index,
                 color: log.message.includes('✅') ? 'green' : log.message.includes('❌') ? 'red' : 'blue',
                children: (
                   <div>
                     <div style={{ fontSize: 12, color: '#999' }}>
                       {dayjs(log.timestamp).format('HH:mm:ss')}
                     </div>
                     <div>{log.message}</div>
                   </div>
                 )
               }))}
             />
           </Card>

           {/* 输出目录 */}
           {selectedTask.outputDir && (
             <Card title="输出目录" size="small">
               <p><strong>路径:</strong> <code>{selectedTask.outputDir}</code></p>
               <Button 
                type="primary" 
                 icon={<DownloadOutlined />}
                 onClick={() => downloadCode(selectedTask)}
               >
                 下载 ZIP 包
               </Button>
             </Card>
           )}
         </Space>
       </Drawer>
     )}
   </div>
 );
};

export default TaskPage;