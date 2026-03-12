import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, message } from 'antd';
import { useApi } from '../contexts/ApiContext';

const AgentPage = () => {
  const { taskApi } = useApi(); // 使用现有的taskApi或需要创建新的agentsApi
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取代理列表
  const fetchAgents = async () => {
    setLoading(true);
    try {
      // 注意：这里假设后端有一个获取代理列表的API
      // 如果后端没有提供这样的API，我们暂时使用模拟数据
      // 在实际应用中，这里应该调用真实的API
      const response = await taskApi.getTasks(); // 临时使用taskApi获取数据
      const tasks = response.data || [];

      // 模拟代理数据，基于任务数据或使用默认值
      // 在实际应用中，这里应该是直接返回代理列表
      const simulatedAgents = [
        {
          key: '1',
          name: '需求分析师',
          role: 'Requirements Analyst',
          status: 'active',
          specialty: '需求收集、用户故事、验收标准',
        },
        {
          key: '2',
          name: '产品设计师',
          role: 'Product Designer',
          status: 'busy',
          specialty: '功能设计、用户流程、界面设计',
        },
        {
          key: '3',
          name: '架构师',
          role: 'System Architect',
          status: 'active',
          specialty: '技术选型、系统架构、API 设计',
        },
        {
          key: '4',
          name: '前端开发者',
          role: 'Frontend Developer',
          status: 'active',
          specialty: 'React、Vue、Angular、TypeScript',
        },
        {
          key: '5',
          name: '后端开发者',
          role: 'Backend Developer',
          status: 'inactive',
          specialty: 'Node.js、Python、Java、数据库',
        },
        {
          key: '6',
          name: '测试工程师',
          role: 'Test Engineer',
          status: 'active',
          specialty: '单元测试、集成测试、E2E 测试',
        },
      ];

      setAgents(simulatedAgents);
    } catch (error) {
      console.error('获取代理列表失败:', error);
      message.error('获取代理列表失败');
      
      // 提供默认的代理数据
      const defaultAgents = [
        {
          key: '1',
          name: '需求分析师',
          role: 'Requirements Analyst',
          status: 'active',
          specialty: '需求收集、用户故事、验收标准',
        },
        {
          key: '2',
          name: '产品设计师',
          role: 'Product Designer',
          status: 'busy',
          specialty: '功能设计、用户流程、界面设计',
        },
        {
          key: '3',
          name: '架构师',
          role: 'System Architect',
          status: 'active',
          specialty: '技术选型、系统架构、API 设计',
        },
        {
          key: '4',
          name: '前端开发者',
          role: 'Frontend Developer',
          status: 'active',
          specialty: 'React、Vue、Angular、TypeScript',
        },
        {
          key: '5',
          name: '后端开发者',
          role: 'Backend Developer',
          status: 'inactive',
          specialty: 'Node.js、Python、Java、数据库',
        },
        {
          key: '6',
          name: '测试工程师',
          role: 'Test Engineer',
          status: 'active',
          specialty: '单元测试、集成测试、E2E 测试',
        },
      ];
      
      setAgents(defaultAgents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const columns = [
    {
      title: '代理名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          active: 'green',
          inactive: 'gray',
          busy: 'blue',
        };
        const textMap = {
          active: '空闲',
          inactive: '未激活',
          busy: '忙碌',
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
    },
    {
      title: '专业领域',
      dataIndex: 'specialty',
      key: 'specialty',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link" 
            size="small"
            onClick={() => Modal.info({
              title: `${record.name} - 配置`,
              content: '代理配置功能开发中...',
            })}
          >
            配置
          </Button>
          <Button
            type="link" 
            size="small"
            onClick={() => message.success(`已激活代理：${record.name}`)}
          >
            {record.status === 'inactive' ? '激活' : '测试'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>代理管理</h1>
      <Card>
        <Table 
          columns={columns} 
          dataSource={agents} 
          loading={loading}
          rowKey="key"
        />
      </Card>
    </div>
  );
};

export default AgentPage;