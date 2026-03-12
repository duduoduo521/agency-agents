import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Switch, message, Space, Divider, Alert } from 'antd';
import { useApi } from '../contexts/ApiContext';
import { DingtalkOutlined, SlackOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const RobotConfigPage = () => {
  const [form] = Form.useForm();
  const { taskApi } = useApi();
  const [dingtalkEnabled, setDingtalkEnabled] = useState(false);
  const [feishuEnabled, setFeishuEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // 加载配置
  const loadConfig = async () => {
    setLoading(true);
    try {
      // 这里应该调用获取机器人配置的API
      // 实际项目中应该有类似这样的API端点：/api/config/robot
      const response = await taskApi.getTasks(); // 临时使用现有API
      // 实际应用中应为: const response = await apiClient.get('/config/robot');
      
      const config = response.data && response.data.length > 0 ? 
        response.data[0] : getDefaultConfig();
      
      // 设置表单和状态
      form.setFieldsValue({
        dingtalkWebhook: config.dingtalkWebhook || '',
        dingtalkSecret: config.dingtalkSecret || '',
        feishuWebhook: config.feishuWebhook || '',
        feishuSecret: config.feishuSecret || ''
      });
      
      setDingtalkEnabled(config.dingtalkEnabled || false);
      setFeishuEnabled(config.feishuEnabled || false);
    } catch (error) {
      console.error('加载机器人配置失败:', error);
      message.error('加载机器人配置失败，使用默认值');
      
      // 设置默认值
      form.setFieldsValue(getDefaultConfig());
    } finally {
      setLoading(false);
    }
  };

  // 获取默认配置
  const getDefaultConfig = () => ({
    dingtalkWebhook: '',
    dingtalkSecret: '',
    feishuWebhook: '',
    feishuSecret: '',
    dingtalkEnabled: false,
    feishuEnabled: false
  });

  const handleSave = async (values) => {
    try {
      setSaving(true);
      
      // 这里应该是实际的API调用
      const configData = {
        ...values,
        dingtalkEnabled,
        feishuEnabled
      };
      
      // 保存机器人配置
      await taskApi.createTask({ // 临时使用现有API
        command: 'save-robot-config',
        params: JSON.stringify(configData),
        options: {}
      });
      // 实际应用中应为: await apiClient.post('/config/robot', configData);
      
      message.success('机器人配置保存成功！');
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error('保存配置失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      // 这里应该是实际的API调用发送测试通知
      await taskApi.createTask({ // 临时使用现有API
        command: 'send-test-notification',
        params: JSON.stringify({ type: 'test' }),
        options: {}
      });
      // 实际应用中应为: await apiClient.post('/notifications/test');
      
      message.success('测试通知发送成功！');
    } catch (error) {
      console.error('发送测试通知失败:', error);
      message.error('发送测试通知失败');
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>机器人配置</h1>
      
      <Card title="机器人配置">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            dingtalkWebhook: '',
            dingtalkSecret: '',
            feishuWebhook: '',
            feishuSecret: ''
          }}
        >
          <Form.Item 
            label="启用钉钉机器人" 
            valuePropName="checked"
          >
            <Switch 
              checked={dingtalkEnabled} 
              onChange={setDingtalkEnabled}
              disabled={saving || loading}
            />
          </Form.Item>
          
          <Form.Item
            label="Webhook 地址"
            name="dingtalkWebhook"
          >
            <Input 
              placeholder="https://oapi.dingtalk.com/robot/send?access_token=xxx" 
              disabled={!dingtalkEnabled || saving || loading}
            />
          </Form.Item>
          
          <Form.Item
            label="密钥 (Secret)"
            name="dingtalkSecret"
          >
            <Input.Password 
              placeholder="安全密钥" 
              disabled={!dingtalkEnabled || saving || loading}
            />
          </Form.Item>
          
          <Divider />
          
          <Form.Item 
            label="启用飞书机器人" 
            valuePropName="checked"
          >
            <Switch 
              checked={feishuEnabled} 
              onChange={setFeishuEnabled}
              disabled={saving || loading}
            />
          </Form.Item>
          
          <Form.Item
            label="Webhook 地址"
            name="feishuWebhook"
          >
            <Input 
              placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/xxx" 
              disabled={!feishuEnabled || saving || loading}
            />
          </Form.Item>
          
          <Form.Item
            label="密钥 (Secret)"
            name="feishuSecret"
          >
            <Input.Password 
              placeholder="安全密钥" 
              disabled={!feishuEnabled || saving || loading}
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={saving}
              >
                保存配置
              </Button>
              <Button 
                onClick={handleTest}
                disabled={saving || loading}
              >
                发送测试通知
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      
      <Card title="使用说明" style={{ marginTop: 24 }}>
        <Alert
          message="配置说明"
          description={
            <div>
              <h3>钉钉机器人配置：</h3>
              <ol>
                <li>在钉钉群中添加自定义机器人</li>
                <li>复制Webhook地址和密钥</li>
                <li>将地址和密钥填入上方表单</li>
                <li>启用开关并保存配置</li>
              </ol>
              
              <h3>飞书机器人配置：</h3>
              <ol>
                <li>在飞书群中添加机器人</li>
                <li>获取Webhook地址和密钥</li>
                <li>将地址和密钥填入上方表单</li>
                <li>启用开关并保存配置</li>
              </ol>
              
              <h3>支持的命令：</h3>
              <ul>
                <li><code>/analyze [需求描述]</code> - 分析需求并生成设计方案</li>
                <li><code>/code [需求描述]</code> - 直接生成代码</li>
                <li><code>/test [项目路径]</code> - 生成测试用例</li>
                <li><code>/status [任务ID]</code> - 查询任务状态</li>
                <li>直接输入需求 - AI将为您自动生成代码</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};

export default RobotConfigPage;