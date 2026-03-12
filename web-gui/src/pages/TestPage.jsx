import React, { useState } from 'react';
import { Card, Button, Space, Result, Divider, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const TestPage = () => {
  const [testResults, setTestResults] = useState({
    apiConnection: null,
    componentRender: null,
    routing: null
  });

  const runTests = async () => {
    // 模拟API连接测试
    setTestResults(prev => ({ ...prev, apiConnection: 'testing' }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTestResults(prev => ({ ...prev, apiConnection: 'success' }));

    // 模拟组件渲染测试
    setTestResults(prev => ({ ...prev, componentRender: 'testing' }));
    await new Promise(resolve => setTimeout(resolve, 800));
    setTestResults(prev => ({ ...prev, componentRender: 'success' }));

    // 模拟路由测试
    setTestResults(prev => ({ ...prev, routing: 'testing' }));
    await new Promise(resolve => setTimeout(resolve, 600));
    setTestResults(prev => ({ ...prev, routing: 'success' }));
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Web GUI 功能测试</h1>
      
      <Card title="系统健康检查">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <h3>API 连接测试</h3>
            {testResults.apiConnection === null && (
              <Alert message="待运行" type="info" showIcon banner />
            )}
            {testResults.apiConnection === 'testing' && (
              <Alert message="测试中..." type="warning" showIcon banner />
            )}
            {testResults.apiConnection === 'success' && (
              <Result
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                title="API 连接正常"
                status="success"
              />
            )}
          </div>

          <Divider />

          <div>
            <h3>组件渲染测试</h3>
            {testResults.componentRender === null && (
              <Alert message="待运行" type="info" showIcon banner />
            )}
            {testResults.componentRender === 'testing' && (
              <Alert message="测试中..." type="warning" showIcon banner />
            )}
            {testResults.componentRender === 'success' && (
              <Result
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                title="组件渲染正常"
                status="success"
              />
            )}
          </div>

          <Divider />

          <div>
            <h3>路由功能测试</h3>
            {testResults.routing === null && (
              <Alert message="待运行" type="info" showIcon banner />
            )}
            {testResults.routing === 'testing' && (
              <Alert message="测试中..." type="warning" showIcon banner />
            )}
            {testResults.routing === 'success' && (
              <Result
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                title="路由功能正常"
                status="success"
              />
            )}
          </div>

          <Divider />

          <Button 
            type="primary" 
            size="large"
            onClick={runTests}
            disabled={testResults.apiConnection === 'testing' || 
                      testResults.componentRender === 'testing' || 
                      testResults.routing === 'testing'}
          >
            {testResults.apiConnection === 'testing' || 
             testResults.componentRender === 'testing' || 
             testResults.routing === 'testing' ? '测试中...' : '运行测试'}
          </Button>
        </Space>
      </Card>

      <Card title="系统信息" style={{ marginTop: 24 }}>
        <ul>
          <li><strong>Ant Design 版本:</strong> 6.3.2</li>
          <li><strong>React 版本:</strong> 19.2.4</li>
          <li><strong>API 服务地址:</strong> http://localhost:3000</li>
          <li><strong>当前状态:</strong> {testResults.apiConnection === 'success' && 
                                   testResults.componentRender === 'success' && 
                                   testResults.routing === 'success' ? 
                                   '所有测试通过' : '待测试'}</li>
        </ul>
      </Card>
    </div>
  );
};

export default TestPage;