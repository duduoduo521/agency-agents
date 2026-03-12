import React, { useState } from 'react';
import { Card, Form, Input, Button, Switch, message, Space, Divider, Alert } from 'antd';
import { DingtalkOutlined, SlackOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const RobotConfigPage = () => {
  const [form] = Form.useForm();
  const [dingtalkEnabled, setDingtalkEnabled] = useState(false);
  const [feishuEnabled, setFeishuEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (values) => {
    try {
      setSaving(true);
      
      // 这里应该是实际的API调用
      console.log('保存机器人配置:', {
        ...values,
        dingtalkEnabled,
        feishuEnabled
      });
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('机器人配置保存成功！');
    } catch (error) {
      message.error('保存配置失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      // 这里应该是实际的API调用
      console.log('发送测试通知');
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('测试通知发送成功！');
    } catch (error) {
      message.error('发送测试通知失败');
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>机器人配置</h1>
      
      <Card title="钉钉机器人配置">
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
              disabled={saving}
            />
          </Form.Item>
          
          <Form.Item
            label="Webhook 地址"
            name="dingtalkWebhook"
          >
            <Input 
              placeholder="https://oapi.dingtalk.com/robot/send?access_token=xxx" 
              disabled={!dingtalkEnabled || saving}
            />
          </Form.Item>
          
          <Form.Item
            label="密钥 (Secret)"
            name="dingtalkSecret"
          >
            <Input.Password 
              placeholder="安全密钥" 
              disabled={!dingtalkEnabled || saving}
            />
          </Form.Item>
          
          <Divider />
          
          <Form.Item 
            label="飞书机器人配置" 
            valuePropName="checked"
          >
            <Switch 
              checked={feishuEnabled} 
              onChange={setFeishuEnabled}
              disabled={saving}
            />
          </Form.Item>
          
          <Form.Item
            label="Webhook 地址"
            name="feishuWebhook"
          >
            <Input 
              placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/xxx" 
              disabled={!feishuEnabled || saving}
            />
          </Form.Item>
          
          <Form.Item
            label="密钥 (Secret)"
            name="feishuSecret"
          >
            <Input.Password 
              placeholder="安全密钥" 
              disabled={!feishuEnabled || saving}
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
                disabled={saving}
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