import React, { useState } from'react';
import { Card, Form, Input, Select, Switch, Button, Divider, message, Tabs, Space, Alert } from 'antd';
import { RobotOutlined, ApiOutlined, GlobalOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const SettingsPage = () => {
 const [form] = Form.useForm();
 const [robotForm] = Form.useForm();
 const [llmForm] = Form.useForm();

 // 状态管理
 const [activeTab, setActiveTab] = useState('basic');
 const [testingPlatform, setTestingPlatform] = useState(null);
 const [testLoading, setTestLoading] = useState(false);

 // 保存设置
 const onFinish = (values) => {
   console.log('设置值:', values);
   message.success('设置已保存');
  };

 // 保存机器人配置
 const onRobotFinish = (values) => {
   console.log('机器人配置:', values);
   message.success('机器人配置已保存');
  };

 // 保存大模型配置
 const onLlmFinish = (values) => {
   console.log('大模型配置:', values);
   message.success('大模型配置已保存');
  };

 // 测试机器人连接
 const testRobotConnection = async (platform) => {
   setTestLoading(true);
   setTestingPlatform(platform);
   
  try {
     // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));
     message.success(`${platform === 'dingtalk' ? '钉钉' : '飞书'} 机器人连接测试成功！`);
   } catch (error) {
     message.error(`${platform === 'dingtalk' ? '钉钉' : '飞书'} 机器人连接失败`);
    }
   
   setTestLoading(false);
   setTestingPlatform(null);
  };

 return (
    <div>
      <h1 style={{ marginBottom: 24 }}>系统配置中心</h1>
      
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
         {
           key: 'basic',
           label: <span><GlobalOutlined />基础设置</span>,
            children: <BasicSettings form={form} onFinish={onFinish} />
          },
         {
           key: 'robot',
           label: <span><RobotOutlined />机器人配置</span>,
            children: <RobotSettings form={robotForm} onFinish={onRobotFinish} onTest={testRobotConnection} testing={testingPlatform} loading={testLoading} />
          },
         {
          key: 'llm',
          label: <span><ApiOutlined />Coding Plan 配置</span>,
            children: <CodingPlanSettings form={llmForm} onFinish={onLlmFinish} />
          },
         {
           key: 'security',
           label: <span><SafetyCertificateOutlined />安全配置</span>,
            children: <SecuritySettings />
          }
        ]}
      />
    </div>
  );
};

export default SettingsPage;

// ==================== 基础设置组件 ====================
const BasicSettings = ({ form, onFinish }) => (
  <Card>
   <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{
     model: 'qwen-max',
     temperature: 0.7,
     autoSave: true,
     workflowStartStage: 'requirements',
     qualityThreshold: 90,
     cliPath: './scripts/agency-cli.js',
     outputDir: './output'
   }}>
    <Divider orientation="left">AI 模型配置</Divider>
     
     <Form.Item label="默认 AI 模型" name="model" rules={[{ required: true, message: '请选择 AI 模型' }]}>
       <Select>
         <Select.Option value="qwen-max">Qwen-Max (通义千问)</Select.Option>
         <Select.Option value="qwen-plus">Qwen-Plus</Select.Option>
         <Select.Option value="gpt-4">GPT-4</Select.Option>
         <Select.Option value="gpt-3.5-turbo">GPT-3.5-Turbo</Select.Option>
         <Select.Option value="claude-3">Claude 3</Select.Option>
         <Select.Option value="gemini-pro">Gemini Pro</Select.Option>
       </Select>
     </Form.Item>

     <Form.Item label="温度参数 (Temperature)" name="temperature" tooltip="控制输出的随机性，范围 0-1">
       <Select>
         <Select.Option value={0.3}>0.3 - 保守</Select.Option>
         <Select.Option value={0.5}>0.5 - 较保守</Select.Option>
         <Select.Option value={0.7}>0.7 - 平衡</Select.Option>
         <Select.Option value={0.9}>0.9 - 创意</Select.Option>
       </Select>
     </Form.Item>

     <Form.Item label="自动保存" name="autoSave" valuePropName="checked">
       <Switch />
     </Form.Item>

    <Divider orientation="left">工作流设置</Divider>
     
     <Form.Item label="默认工作流阶段" name="workflowStartStage" tooltip="选择新工作流的起始阶段">
       <Select>
         <Select.Option value="requirements">需求分析</Select.Option>
         <Select.Option value="design">产品设计</Select.Option>
         <Select.Option value="architecture">架构设计</Select.Option>
       </Select>
     </Form.Item>

     <Form.Item label="质量门禁阈值" name="qualityThreshold" tooltip="测试覆盖率最低要求 (%)">
       <Input suffix="%" type="number" min={0} max={100} />
     </Form.Item>

    <Divider orientation="left">CLI 集成配置</Divider>
     
     <Form.Item label="CLI 工具路径" name="cliPath" tooltip="agency-cli.js 的路径">
       <Input placeholder="./scripts/agency-cli.js" />
     </Form.Item>

     <Form.Item label="输出目录" name="outputDir" tooltip="生成代码的默认输出目录">
       <Input placeholder="./output" />
     </Form.Item>

     <Form.Item>
       <Button type="primary" htmlType="submit" size="large">
         保存基础设置
       </Button>
     </Form.Item>
   </Form>
  </Card>
);

// ==================== 机器人配置组件 ====================
const RobotSettings = ({ form, onFinish, onTest, testing, loading }) => (
  <Card>
   <Alert
     message="机器人集成说明"
     description="配置钉钉或飞书机器人后，可以通过聊天命令控制工作流，并接收工作流状态通知。"
    type="info"
     showIcon
     style={{ marginBottom: 24 }}
   />
   
   <Form form={form} layout="vertical" onFinish={onFinish}>
    <Divider orientation="left">钉钉机器人配置</Divider>
     
     <Form.Item label="启用钉钉机器人" name="dingtalkEnabled" valuePropName="checked">
       <Switch />
     </Form.Item>

     <Form.Item label="Webhook Token" name="dingtalkToken" tooltip="从钉钉后台获取的 Webhook Token" rules={[{ required: false }]}>
       <Input.Password placeholder="请输入钉钉 Webhook Token" disabled={!form.getFieldValue('dingtalkEnabled')} />
     </Form.Item>

     <Form.Item label="加签密钥 (Secret)" name="dingtalkSecret" tooltip="钉钉加签设置的密钥" rules={[{ required: false }]}>
       <Input.Password placeholder="请输入钉钉加签密钥" disabled={!form.getFieldValue('dingtalkEnabled')} />
     </Form.Item>

     <Form.Item>
       <Space>
         <Button 
          type="primary" 
           onClick={() => onTest('dingtalk')}
           loading={testing === 'dingtalk'}
           disabled={!form.getFieldValue('dingtalkEnabled')}
         >
           测试连接
         </Button>
         <Button href="https://open.dingtalk.com/document/robots/custom-robot-access" target="_blank">
           查看钉钉文档
         </Button>
       </Space>
     </Form.Item>

    <Divider orientation="left">飞书机器人配置</Divider>
     
     <Form.Item label="启用飞书机器人" name="feishuEnabled" valuePropName="checked">
       <Switch />
     </Form.Item>

     <Form.Item label="Verification Token" name="feishuToken" tooltip="从飞书开放平台获取的 Verification Token" rules={[{ required: false }]}>
       <Input.Password placeholder="请输入飞书 Verification Token" disabled={!form.getFieldValue('feishuEnabled')} />
     </Form.Item>

     <Form.Item label="Encrypt Key" name="feishuSecret" tooltip="飞书的加密密钥" rules={[{ required: false }]}>
       <Input.Password placeholder="请输入飞书 Encrypt Key" disabled={!form.getFieldValue('feishuEnabled')} />
     </Form.Item>

     <Form.Item>
       <Space>
         <Button 
          type="primary" 
           onClick={() => onTest('feishu')}
           loading={testing === 'feishu'}
           disabled={!form.getFieldValue('feishuEnabled')}
         >
           测试连接
         </Button>
         <Button href="https://open.feishu.cn/document/ukTMukTMukTM/ucjM14iL2kTM0UDI" target="_blank">
           查看飞书文档
         </Button>
       </Space>
     </Form.Item>

     <Form.Item style={{ marginTop: 24 }}>
       <Button type="primary" htmlType="submit" size="large">
         保存机器人配置
       </Button>
     </Form.Item>
   </Form>
  </Card>
);

// ==================== Coding Plan 配置组件 ====================
const CodingPlanSettings = ({ form, onFinish }) => (
  <Card>
   <Alert
    message="Coding Plan 配置"
     description="配置各大厂的编码专用套餐（Coding Plan），支持阿里云、腾讯云、百度等主流平台。"
   type="info"
     showIcon
     style={{ marginBottom: 24 }}
   />
   
   <Form form={form} layout="vertical" onFinish={onFinish}>
    <Divider orientation="left">阿里云百炼 - 通义千问 Coding Plan</Divider>
     
     <Form.Item label="启用" name="aliEnabled" valuePropName="checked">
       <Switch />
     </Form.Item>

     <Form.Item label="API Key" name="aliApiKey" tooltip="在阿里云百炼平台获取的 API Key">
       <Input.Password placeholder="请输入阿里云 API Key" disabled={!form.getFieldValue('aliEnabled')} />
     </Form.Item>

     <Form.Item label="API Endpoint" name="aliEndpoint" initialValue="https://dashscope.aliyuncs.com/api/v1">
       <Input placeholder="https://dashscope.aliyuncs.com/api/v1" disabled={!form.getFieldValue('aliEnabled')} />
     </Form.Item>

     <Form.Item label="套餐类型" name="aliPlanType" tooltip="选择通义千问 Coding Plan 类型">
       <Select disabled={!form.getFieldValue('aliEnabled')}>
         <Select.Option value="qwen-coder-plus">Qwen-Coder-Plus (通义灵码专业版)</Select.Option>
         <Select.Option value="qwen-coder-turbo">Qwen-Coder-Turbo (通义灵码加速版)</Select.Option>
         <Select.Option value="qwen2.5-coder-32b">Qwen2.5-Coder-32B (通义灵码标准版)</Select.Option>
       </Select>
     </Form.Item>

    <Divider orientation="left">腾讯云智能创作 - 混元 Coding Plan</Divider>
     
     <Form.Item label="启用" name="tencentEnabled" valuePropName="checked">
       <Switch />
     </Form.Item>

     <Form.Item label="SecretId" name="tencentSecretId" tooltip="在腾讯云控制台获取的 SecretId">
       <Input.Password placeholder="请输入腾讯云 SecretId" disabled={!form.getFieldValue('tencentEnabled')} />
     </Form.Item>

     <Form.Item label="SecretKey" name="tencentSecretKey" tooltip="在腾讯云控制台获取的 SecretKey">
       <Input.Password placeholder="请输入腾讯云 SecretKey" disabled={!form.getFieldValue('tencentEnabled')} />
     </Form.Item>

     <Form.Item label="API Endpoint" name="tencentEndpoint" initialValue="https://hunyuan.tencentcloudapi.com">
       <Input placeholder="https://hunyuan.tencentcloudapi.com" disabled={!form.getFieldValue('tencentEnabled')} />
     </Form.Item>

     <Form.Item label="套餐类型" name="tencentPlanType" tooltip="选择混元 Coding Plan 类型">
       <Select disabled={!form.getFieldValue('tencentEnabled')}>
         <Select.Option value="hunyuan-code-pro">HunYuan-Code-Pro (混元代码专业版)</Select.Option>
         <Select.Option value="hunyuan-code-lite">HunYuan-Code-Lite (混元代码轻量版)</Select.Option>
       </Select>
     </Form.Item>

    <Divider orientation="left">百度智能云千帆 - 文心一言 Coding Plan</Divider>
     
     <Form.Item label="启用" name="baiduEnabled" valuePropName="checked">
       <Switch />
     </Form.Item>

     <Form.Item label="API Key" name="baiduApiKey" tooltip="在百度智能云千帆平台获取的 API Key">
       <Input.Password placeholder="请输入百度云 API Key" disabled={!form.getFieldValue('baiduEnabled')} />
     </Form.Item>

     <Form.Item label="Secret Key" name="baiduSecretKey" tooltip="在百度智能云千帆平台获取的 Secret Key">
       <Input.Password placeholder="请输入百度云 Secret Key" disabled={!form.getFieldValue('baiduEnabled')} />
     </Form.Item>

     <Form.Item label="API Endpoint" name="baiduEndpoint" initialValue="https://aip.baidubce.com/rpc/2.0/ai_custom/v1">
       <Input placeholder="https://aip.baidubce.com/rpc/2.0/ai_custom/v1" disabled={!form.getFieldValue('baiduEnabled')} />
     </Form.Item>

     <Form.Item label="套餐类型" name="baiduPlanType" tooltip="选择文心一言 Coding Plan 类型">
       <Select disabled={!form.getFieldValue('baiduEnabled')}>
         <Select.Option value="ernie-bot-code-pro">ERNIE-Bot-Code-Pro (文心快码专业版)</Select.Option>
         <Select.Option value="ernie-bot-code-lite">ERNIE-Bot-Code-Lite (文心快码轻量版)</Select.Option>
       </Select>
     </Form.Item>

    <Divider orientation="left">其他厂商 - 自定义 Coding Plan</Divider>
     
     <Form.Item label="启用" name="customEnabled" valuePropName="checked">
       <Switch />
     </Form.Item>

     <Form.Item label="平台名称" name="customPlatformName" tooltip="Coding Plan 平台名称">
       <Input placeholder="例如：讯飞星火、智谱 AI 等" disabled={!form.getFieldValue('customEnabled')} />
     </Form.Item>

     <Form.Item label="API Key" name="customApiKey" tooltip="该平台提供的 API Key 或等效凭证">
       <Input.Password placeholder="请输入 API Key" disabled={!form.getFieldValue('customEnabled')} />
     </Form.Item>

     <Form.Item label="API Endpoint" name="customEndpoint" tooltip="该平台的 API 端点地址">
       <Input placeholder="请输入 API Endpoint" disabled={!form.getFieldValue('customEnabled')} />
     </Form.Item>

     <Form.Item label="套餐类型" name="customPlanType" tooltip="该平台的 Coding Plan 名称">
       <Input placeholder="请输入套餐类型名称" disabled={!form.getFieldValue('customEnabled')} />
     </Form.Item>

     <Form.Item style={{ marginTop: 24 }}>
       <Button type="primary" htmlType="submit" size="large">
         保存 Coding Plan 配置
       </Button>
     </Form.Item>
   </Form>
  </Card>
);

// ==================== 安全配置组件 ====================
const SecuritySettings = () => (
  <Card>
   <Alert
     message="安全配置"
     description="配置访问控制和速率限制，保护服务安全。"
    type="warning"
     showIcon
     style={{ marginBottom: 24 }}
   />
   
   <Form layout="vertical" initialValues={{
     enableRateLimit: true,
     rateLimitWindow: 60,
     rateLimitMax:10,
     enableIpWhitelist: false,
     ipWhitelist: ''
   }}>
    <Divider orientation="left">速率限制</Divider>
     
     <Form.Item label="启用速率限制" name="enableRateLimit" valuePropName="checked">
       <Switch />
     </Form.Item>

     <Form.Item label="时间窗口 (秒)" name="rateLimitWindow" tooltip="在这个时间窗口内限制请求次数">
       <Input suffix="秒" type="number" min={10} step={10} />
     </Form.Item>

     <Form.Item label="最大请求数" name="rateLimitMax" tooltip="每个时间窗口内允许的最大请求数">
       <Input suffix="次" type="number" min={1} />
     </Form.Item>

    <Divider orientation="left">IP 白名单</Divider>
     
     <Form.Item label="启用 IP 白名单" name="enableIpWhitelist" valuePropName="checked">
       <Switch />
     </Form.Item>

     <Form.Item 
       label="IP 白名单列表" 
       name="ipWhitelist" 
       tooltip="每行一个 IP 地址，支持 CIDR 格式（如 192.168.1.0/24）"
     >
       <Input.TextArea 
         rows={6} 
         placeholder="192.168.1.1&#10;192.168.1.0/24&#10;10.0.0.1"
         style={{ fontFamily: 'monospace' }}
       />
     </Form.Item>

    <Divider orientation="left">Token 管理</Divider>
     
     <Form.Item label="Webhook 验证 Token" name="webhookToken">
       <Input.Password placeholder="用于验证 Webhook 请求的 Token" />
     </Form.Item>

     <Form.Item>
       <Button type="primary" htmlType="submit" size="large">
         保存安全配置
       </Button>
     </Form.Item>
   </Form>
  </Card>
);
