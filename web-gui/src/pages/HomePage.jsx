import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Spin } from 'antd';
import {
  CheckCircleOutlined,
  SyncOutlined,
  ProjectOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { useApi } from '../contexts/ApiContext';

const HomePage = () => {
  const { taskApi, healthApi } = useApi();
  const [stats, setStats] = useState({
    completedWorkflows: 0,
    activeTasks: 0,
    agentCount: 0,
    projectCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 这里应该调用实际的API来获取统计数据
        // 由于目前的API端点可能不直接提供这些统计信息，
        // 我们先使用taskApi.getTasks来获取任务数据
        const response = await taskApi.getTasks();
        const tasks = response.data || [];
        
        // 根据任务状态计算统计数据
        let completedCount = 0;
        let activeCount = 0;
        
        tasks.forEach(task => {
          if (task.status === 'completed') {
            completedCount++;
          } else if (task.status === 'running' || task.status === 'pending') {
            activeCount++;
          }
        });

        // 模拟其他统计信息（实际应用中需要从API获取）
        setStats({
          completedWorkflows: completedCount,
          activeTasks: activeCount,
          agentCount: 15, // 实际应用中应从API获取
          projectCount: 28 // 实际应用中应从API获取
        });
      } catch (error) {
        console.error('获取统计数据失败:', error);
        // 如果API调用失败，保留默认值
        setStats({
          completedWorkflows: 0,
          activeTasks: 0,
          agentCount: 0,
          projectCount: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [taskApi]);

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>欢迎使用 The Code Agency</h1>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="已完成工作流"
                value={stats.completedWorkflows}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="进行中任务"
                value={stats.activeTasks}
                prefix={<SyncOutlined spin style={{ color: '#1677ff' }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="代理数量"
                value={stats.agentCount}
                prefix={<CodeOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="项目总数"
                value={stats.projectCount}
                prefix={<ProjectOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card title="快速开始">
        <Space>
          <Button type="primary" size="large">
            创建工作流
          </Button>
          <Button size="large">
            查看文档
          </Button>
          <Button size="large">
            配置代理
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default HomePage;