import React from'react';
import { Card, Row, Col, Statistic, Button, Space } from'antd';
import {
  CheckCircleOutlined,
  SyncOutlined,
  ProjectOutlined,
  CodeOutlined,
} from '@ant-design/icons';

const HomePage = () => {
 return (
    <div>
      <h1 style={{ marginBottom: 24 }}>欢迎使用 The Code Agency</h1>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
             title="已完成工作流"
              value={15}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
             title="进行中任务"
              value={3}
             prefix={<SyncOutlined spin style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
             title="代理数量"
              value={15}
              prefix={<CodeOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
             title="项目总数"
              value={28}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
      </Row>

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
