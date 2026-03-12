import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, message, notification } from 'antd';
import { useApi } from '../contexts/ApiContext';
import { useNavigate } from 'react-router-dom';

const AgentPage = () => {
  const { taskApi, healthApi } = useApi();
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [llmConfigured, setLlmConfigured] = useState(false);

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

  // 获取代理列表
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const isConfigured = await checkLlmConfig();
      setLlmConfigured(isConfigured);

      // 模拟代理数据
      const simulatedAgents = [
        {
          key: '1',
          name: '需求分析师',
          role: 'Requirements Analyst',
          status: isConfigured ? 'active' : 'inactive',
          specialty: '需求收集、用户故事、验收标准',
        },
        {
          key: '2',
          name: '产品设计师',
          role: 'Product Designer',
          status: isConfigured ? 'busy' : 'inactive',
          specialty: '功能设计、用户流程、界面设计',
        },
        {
          key: '3',
          name: '架构师',
          role: 'System Architect',
          status: isConfigured ? 'active' : 'inactive',
          specialty: '技术选型、系统架构、API 设计',
        },
        {
          key: '4',
          name: '前端开发者',
          role: 'Frontend Developer',
          status: isConfigured ? 'active' : 'inactive',
          specialty: 'React、Vue、Angular、TypeScript',
        },
        {
          key: '5',
          name: '后端开发者',
          role: 'Backend Developer',
          status: isConfigured ? 'active' : 'inactive',
          specialty: 'Node.js、Python、Java、数据库',
        },
        {
          key: '6',
          name: '测试工程师',
          role: 'Test Engineer',
          status: isConfigured ? 'active' : 'inactive',
          specialty: '单元测试、集成测试、E2E 测试',
        },
      ];

      setAgents(simulatedAgents);
    } catch (error) {
      console.error('获取代理列表失败:', error);
      message.error('获取代理列表失败');
      
      // 提供默认的代理数据（未配置状态）
      const defaultAgents = [
        {
          key: '1',
          name: '需求分析师',
          role: 'Requirements Analyst',
          status: 'inactive',
          specialty: '需求收集、用户故事、验收标准',
        },
        {
          key: '2',
          name: '产品设计师',
          role: 'Product Designer',
          status: 'inactive',
          specialty: '功能设计、用户流程、界面设计',
        },
        {
          key: '3',
          name: '架构师',
          role: 'System Architect',
          status: 'inactive',
          specialty: '技术选型、系统架构、API 设计',
        },
        {
          key: '4',
          name: '前端开发者',
          role: 'Frontend Developer',
          status: 'inactive',
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
          status: 'inactive',
          specialty: '单元测试、集成测试、E2E 测试',
        },
      ];
      
      setAgents(defaultAgents);
      setLlmConfigured(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // 测试或激活代理
  const handleTestAgent = (agent) => {
    if (!llmConfigured) {
      // 未配置大模型时，提示并跳转到设置页面
      Modal.confirm({
        title: '大模型未配置',
        content: `代理 "${agent.name}" 需要大模型支持。请先配置大模型后才能使用此代理。`,
        okText: '去配置',
        cancelText: '取消',
        onOk: () => {
          navigate('/settings');
        }
      });
      return;
    }

    message.success(`已激活代理：${agent.name}`);
  };

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
            onClick={() => handleTestAgent(record)}
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
      {!llmConfigured && (
        <Card style={{ marginBottom: 24 }} type="warning">
          <div style={{ color: '#faad14' }}>
            ⚠️ 大模型未配置。所有代理当前处于未激活状态。请先在设置页面配置大模型。
          </div>
        </Card>
      )}
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