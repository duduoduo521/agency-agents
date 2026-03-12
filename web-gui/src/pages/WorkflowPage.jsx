import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Progress, Space, message } from 'antd';
import { useApi } from '../contexts/ApiContext';

const WorkflowPage = () => {
  const { taskApi } = useApi();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取工作流列表
  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      // 目前使用任务API获取数据，实际应用中应该有专门的工作流API
      const response = await taskApi.getTasks();
      const tasks = response.data || [];

      // 将任务数据转换为工作流数据格式
      const workflowData = tasks.map((task, index) => ({
        key: task.id || index.toString(),
        name: task.command || `任务 ${index + 1}`,
        status: task.status || 'pending',
        stage: mapStatusToStage(task.status),
        progress: task.progress || 0,
        createdAt: task.createdAt || new Date().toISOString()
      }));

      setWorkflows(workflowData);
    } catch (error) {
      console.error('获取工作流列表失败:', error);
      message.error('获取工作流列表失败');
      
      // 如果API调用失败，使用默认数据
      const defaultWorkflows = [
        {
          key: '1',
          name: '用户登录系统',
          status: 'completed',
          stage: '发布准备',
          progress: 100,
          createdAt: '2026-03-24 10:00',
        },
        {
          key: '2',
          name: '电商网站 MVP',
          status: 'running',
          stage: '代码实现',
          progress: 65,
          createdAt: '2026-03-24 14:30',
        },
        {
          key: '3',
          name: '博客系统',
          status: 'pending',
          stage: '需求分析',
          progress: 20,
          createdAt: '2026-03-24 16:00',
        },
      ];
      
      setWorkflows(defaultWorkflows);
    } finally {
      setLoading(false);
    }
  };

  // 根据任务状态映射到阶段
  const mapStatusToStage = (status) => {
    switch (status) {
      case 'pending':
        return '需求分析';
      case 'analyzing':
        return '需求分析';
      case 'designing':
        return '设计阶段';
      case 'coding':
        return '代码实现';
      case 'testing':
        return '测试阶段';
      case 'reviewing':
        return '代码审查';
      case 'completed':
        return '发布准备';
      case 'failed':
        return '问题诊断';
      default:
        return '未知阶段';
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const columns = [
    {
      title: '工作流名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          pending: 'orange',
          running: 'blue',
          completed: 'green',
          failed: 'red',
        };
        const textMap = {
          pending: '待处理',
          running: '进行中',
          completed: '已完成',
          failed: '失败',
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
    },
    {
      title: '当前阶段',
      dataIndex: 'stage',
      key: 'stage',
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress percent={progress} strokeColor={progress === 100 ? '#52c41a' : '#1677ff'} />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small">查看</Button>
          {record.status === 'pending' && (
            <Button type="link" size="small" onClick={() => message.success(`启动工作流：${record.name}`)}>
              启动
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>工作流管理</h1>
      <Card>
        <Table 
          columns={columns} 
          dataSource={workflows} 
          loading={loading}
          rowKey="key"
        />
      </Card>
    </div>
  );
};

export default WorkflowPage;