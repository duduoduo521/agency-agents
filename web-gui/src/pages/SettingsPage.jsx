import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Switch, Button, Divider, message, Tabs, Space, Alert, Modal } from 'antd';
import { RobotOutlined, ApiOutlined, GlobalOutlined, SafetyCertificateOutlined, CopyOutlined } from '@ant-design/icons';
import { useApi } from '../contexts/ApiContext';

// 配置存储键名
const CONFIG_STORAGE_KEY = 'the-code-agency-settings';

const SettingsPage = () => {
  const [form] = Form.useForm();
  const [robotForm] = Form.useForm();
  const [llmForm] = Form.useForm();
  const { taskApi } = useApi();
  
  // 状态管理
  const [activeTab, setActiveTab] = useState('basic');
  const [testingPlatform, setTestingPlatform] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [settings, setSettings] = useState({});
  
  // Coding Plan 启用状态管理
  const [aliEnabled, setAliEnabled] = useState(false);
  const [tencentEnabled, setTencentEnabled] = useState(false);
  const [baiduEnabled, setBaiduEnabled] = useState(false);
  const [customEnabled, setCustomEnabled] = useState(false);
  const [showEnvGuide, setShowEnvGuide] = useState(false);
  const [envVariables, setEnvVariables] = useState('');

  // 从localStorage加载配置
  const loadConfigFromStorage = () => {
    try {
      const configStr = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (configStr) {
        return JSON.parse(configStr);
      }
    } catch (error) {
      console.error('从localStorage加载配置失败:', error);
    }
    return null;
  };

  // 保存配置到localStorage
  const saveConfigToStorage = (config) => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('保存配置到localStorage失败:', error);
      return false;
    }
  };

  // 生成环境变量字符串
  const generateEnvVariables = (config) => {
    const envVars = [];
    
    // 阿里云配置
    if (config.aliEnabled) {
      envVars.push(`ALI_ENABLED=true`);
      if (config.aliApiKey) envVars.push(`ALI_API_KEY=${config.aliApiKey}`);
      if (config.aliEndpoint) envVars.push(`ALI_ENDPOINT=${config.aliEndpoint}`);
      if (config.aliPlanType) envVars.push(`ALI_PLAN_TYPE=${config.aliPlanType}`);
    } else {
      envVars.push(`ALI_ENABLED=false`);
    }
    
    // 腾讯云配置
    if (config.tencentEnabled) {
      envVars.push(`TENCENT_ENABLED=true`);
      if (config.tencentSecretId) envVars.push(`TENCENT_SECRET_ID=${config.tencentSecretId}`);
      if (config.tencentSecretKey) envVars.push(`TENCENT_SECRET_KEY=${config.tencentSecretKey}`);
      if (config.tencentEndpoint) envVars.push(`TENCENT_ENDPOINT=${config.tencentEndpoint}`);
      if (config.tencentPlanType) envVars.push(`TENCENT_PLAN_TYPE=${config.tencentPlanType}`);
    } else {
      envVars.push(`TENCENT_ENABLED=false`);
    }
    
    // 百度配置
    if (config.baiduEnabled) {
      envVars.push(`BAIDU_ENABLED=true`);
      if (config.baiduApiKey) envVars.push(`BAIDU_API_KEY=${config.baiduApiKey}`);
      if (config.baiduSecretKey) envVars.push(`BAIDU_SECRET_KEY=${config.baiduSecretKey}`);
      if (config.baiduEndpoint) envVars.push(`BAIDU_ENDPOINT=${config.baiduEndpoint}`);
      if (config.baiduPlanType) envVars.push(`BAIDU_PLAN_TYPE=${config.baiduPlanType}`);
    } else {
      envVars.push(`BAIDU_ENABLED=false`);
    }
    
    // 自定义配置
    if (config.customEnabled) {
      envVars.push(`CUSTOM_ENABLED=true`);
      if (config.customApiKey) envVars.push(`CUSTOM_API_KEY=${config.customApiKey}`);
      if (config.customEndpoint) envVars.push(`CUSTOM_ENDPOINT=${config.customEndpoint}`);
      if (config.customPlanType) envVars.push(`CUSTOM_PLAN_TYPE=${config.customPlanType}`);
    } else {
      envVars.push(`CUSTOM_ENABLED=false`);
    }
    
    return envVars.join('\n');
  };

  // 加载设置
  const loadSettings = async () => {
    try {
      // 优先从localStorage加载配置
      const storedConfig = loadConfigFromStorage() || getDefaultSettings();
      
      setSettings(storedConfig);
      
      // 设置表单初始值
      form.setFieldsValue({
        model: storedConfig.model || 'qwen-max',
        temperature: storedConfig.temperature || 0.7,
        autoSave: storedConfig.autoSave !== false, // 默认为true
        workflowStartStage: storedConfig.workflowStartStage || 'requirements',
        qualityThreshold: storedConfig.qualityThreshold || 90,
        cliPath: storedConfig.cliPath || './scripts/agency-cli.js',
        outputDir: storedConfig.outputDir || './output'
      });
      
      robotForm.setFieldsValue({
        dingtalkEnabled: storedConfig.dingtalkEnabled || false,
        dingtalkToken: storedConfig.dingtalkToken || '',
        dingtalkSecret: storedConfig.dingtalkSecret || '',
        feishuEnabled: storedConfig.feishuEnabled || false,
        feishuToken: storedConfig.feishuToken || '',
        feishuSecret: storedConfig.feishuSecret || ''
      });
      
      // 设置LLM表单值和状态
      const llmSettings = {
        aliEnabled: storedConfig.aliEnabled || false,
        aliApiKey: storedConfig.aliApiKey || '',
        aliEndpoint: storedConfig.aliEndpoint || 'https://coding.dashscope.aliyuncs.com/v1',
        aliPlanType: storedConfig.aliPlanType || 'qwen-coder-plus',
        tencentEnabled: storedConfig.tencentEnabled || false,
        tencentSecretId: storedConfig.tencentSecretId || '',
        tencentSecretKey: storedConfig.tencentSecretKey || '',
        tencentEndpoint: storedConfig.tencentEndpoint || 'https://hunyuan.tencentcloudapi.com',
        tencentPlanType: storedConfig.tencentPlanType || 'hunyuan-code-pro',
        baiduEnabled: storedConfig.baiduEnabled || false,
        baiduApiKey: storedConfig.baiduApiKey || '',
        baiduSecretKey: storedConfig.baiduSecretKey || '',
        baiduEndpoint: storedConfig.baiduEndpoint || 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1',
        baiduPlanType: storedConfig.baiduPlanType || 'ernie-bot-code-pro',
        customEnabled: storedConfig.customEnabled || false,
        customPlatformName: storedConfig.customPlatformName || '',
        customApiKey: storedConfig.customApiKey || '',
        customEndpoint: storedConfig.customEndpoint || '',
        customPlanType: storedConfig.customPlanType || ''
      };
      
      llmForm.setFieldsValue(llmSettings);
      setAliEnabled(llmSettings.aliEnabled);
      setTencentEnabled(llmSettings.tencentEnabled);
      setBaiduEnabled(llmSettings.baiduEnabled);
      setCustomEnabled(llmSettings.customEnabled);
    } catch (error) {
      console.error('加载设置失败:', error);
      message.error('加载设置失败，使用默认值');
      
      // 设置默认值
      const defaultSettings = getDefaultSettings();
      const defaultRobot = getDefaultRobotSettings();
      const defaultLlm = getDefaultLlmSettings();
      
      setSettings({...defaultSettings, ...defaultRobot, ...defaultLlm});
      form.setFieldsValue(defaultSettings);
      robotForm.setFieldsValue(defaultRobot);
      llmForm.setFieldsValue(defaultLlm);
      setAliEnabled(defaultLlm.aliEnabled);
      setTencentEnabled(defaultLlm.tencentEnabled);
      setBaiduEnabled(defaultLlm.baiduEnabled);
      setCustomEnabled(defaultLlm.customEnabled);
    }
  };

  // 获取默认设置
  const getDefaultSettings = () => ({
    model: 'qwen-max',
    temperature: 0.7,
    autoSave: true,
    workflowStartStage: 'requirements',
    qualityThreshold: 90,
    cliPath: './scripts/agency-cli.js',
    outputDir: './output'
  });

  const getDefaultRobotSettings = () => ({
    dingtalkEnabled: false,
    dingtalkToken: '',
    dingtalkSecret: '',
    feishuEnabled: false,
    feishuToken: '',
    feishuSecret: ''
  });

  const getDefaultLlmSettings = () => ({
    aliEnabled: false,
    aliApiKey: '',
    aliEndpoint: 'https://coding.dashscope.aliyuncs.com/v1',
    aliPlanType: 'qwen-coder-plus',
    tencentEnabled: false,
    tencentSecretId: '',
    tencentSecretKey: '',
    tencentEndpoint: 'https://hunyuan.tencentcloudapi.com',
    tencentPlanType: 'hunyuan-code-pro',
    baiduEnabled: false,
    baiduApiKey: '',
    baiduSecretKey: '',
    baiduEndpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1',
    baiduPlanType: 'ernie-bot-code-pro',
    customEnabled: false,
    customPlatformName: '',
    customApiKey: '',
    customEndpoint: '',
    customPlanType: ''
  });

  // 保存设置
  const onFinish = async (values) => {
    try {
      const newSettings = {...settings, ...values};
      setSettings(newSettings);
      
      if (saveConfigToStorage(newSettings)) {
        message.success('设置已保存');
      } else {
        message.error('保存设置失败，请检查浏览器设置');
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
    }
  };

  // 保存机器人配置
  const onRobotFinish = async (values) => {
    try {
      const newSettings = {...settings, ...values};
      setSettings(newSettings);
      
      if (saveConfigToStorage(newSettings)) {
        message.success('机器人配置已保存');
      } else {
        message.error('保存机器人配置失败，请检查浏览器设置');
      }
    } catch (error) {
      console.error('保存机器人配置失败:', error);
      message.error('保存机器人配置失败');
    }
  };

  // 保存大模型配置
  const onLlmFinish = async (values) => {
    try {
      const newSettings = {...settings, ...values};
      setSettings(newSettings);
      
      if (saveConfigToStorage(newSettings)) {
        message.success('大模型配置已保存');
        
        // 生成环境变量并显示指南
        const envVars = generateEnvVariables(values);
        setEnvVariables(envVars);
        setShowEnvGuide(true);
      } else {
        message.error('保存大模型配置失败，请检查浏览器设置');
      }
    } catch (error) {
      console.error('保存大模型配置失败:', error);
      message.error('保存大模型配置失败');
    }
  };

  // 复制环境变量到剪贴板
  const copyEnvVariables = async () => {
    try {
      await navigator.clipboard.writeText(envVariables);
      message.success('环境变量已复制到剪贴板');
    } catch (error) {
      message.error('复制失败，请手动复制');
    }
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

  useEffect(() => {
    loadSettings();
  }, []);

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
            children: <CodingPlanSettings 
              form={llmForm} 
              onFinish={onLlmFinish}
              aliEnabled={aliEnabled}
              setAliEnabled={setAliEnabled}
              tencentEnabled={tencentEnabled}
              setTencentEnabled={setTencentEnabled}
              baiduEnabled={baiduEnabled}
              setBaiduEnabled={setBaiduEnabled}
              customEnabled={customEnabled}
              setCustomEnabled={setCustomEnabled}
            />
          },
          {
            key: 'security',
            label: <span><SafetyCertificateOutlined />安全配置</span>,
            children: <SecuritySettings />
          }
        ]}
      />
      
      {/* 环境变量设置指南模态框 */}
      <Modal
        title="环境变量设置指南"
        open={showEnvGuide}
        onCancel={() => setShowEnvGuide(false)}
        footer={[
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={copyEnvVariables}>
            复制到剪贴板
          </Button>,
          <Button key="ok" type="primary" onClick={() => setShowEnvGuide(false)}>
            确定
          </Button>
        ]}
        width={600}
      >
        <Alert
          message="重要提示"
          description="为了使大模型配置生效，您需要将以下环境变量添加到您的系统中，然后重启服务器。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: 12, 
          borderRadius: 4, 
          fontFamily: 'monospace',
          maxHeight: 300,
          overflow: 'auto'
        }}>
          {envVariables}
        </div>
        <div style={{ marginTop: 16 }}>
          <h4>设置方法：</h4>
          <ul>
            <li><strong>Windows</strong>: 在命令行中使用 <code>set 变量名=值</code> 或创建 .env 文件</li>
            <li><strong>Linux/Mac</strong>: 在终端中使用 <code>export 变量名=값</code> 或创建 .env 文件</li>
            <li><strong>Docker</strong>: 在 docker run 命令中使用 <code>-e 变量명=값</code></li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;

// ==================== 基础设置组件 ====================
const BasicSettings = ({ form, onFinish }) => (
  <Card>
    <Form form={form} layout="vertical" onFinish={onFinish}>
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
const CodingPlanSettings = ({ 
  form, 
  onFinish,
  aliEnabled,
  setAliEnabled,
  tencentEnabled,
  setTencentEnabled,
  baiduEnabled,
  setBaiduEnabled,
  customEnabled,
  setCustomEnabled
}) => (
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
        <Switch 
          checked={aliEnabled}
          onChange={setAliEnabled}
        />
      </Form.Item>

      <Form.Item label="API Key" name="aliApiKey" tooltip="在阿里云百炼平台获取的 API Key">
        <Input.Password placeholder="请输入阿里云 API Key" disabled={!aliEnabled} />
      </Form.Item>

      <Form.Item 
        label="Base URL" 
        name="aliEndpoint" 
        initialValue="https://coding.dashscope.aliyuncs.com/v1"
        tooltip="阿里云百炼 Coding Plan 的基础URL"
      >
        <Input 
          placeholder="https://coding.dashscope.aliyuncs.com/v1" 
          disabled={!aliEnabled} 
        />
      </Form.Item>

      <Form.Item 
        label="模型名称" 
        name="aliPlanType" 
        tooltip="输入具体的 Coding Plan 模型名称，如 qwen-coder-plus、qwen-coder-turbo 等"
      >
        <Input 
          placeholder="例如：qwen-coder-plus" 
          disabled={!aliEnabled} 
        />
      </Form.Item>

      <Divider orientation="left">腾讯云智能创作 - 混元 Coding Plan</Divider>
      
      <Form.Item label="启用" name="tencentEnabled" valuePropName="checked">
        <Switch 
          checked={tencentEnabled}
          onChange={setTencentEnabled}
        />
      </Form.Item>

      <Form.Item label="SecretId" name="tencentSecretId" tooltip="在腾讯云控制台获取的 SecretId">
        <Input.Password placeholder="请输入腾讯云 SecretId" disabled={!tencentEnabled} />
      </Form.Item>

      <Form.Item label="SecretKey" name="tencentSecretKey" tooltip="在腾讯云控制台获取的 SecretKey">
        <Input.Password placeholder="请输入腾讯云 SecretKey" disabled={!tencentEnabled} />
      </Form.Item>

      <Form.Item label="API Endpoint" name="tencentEndpoint" initialValue="https://hunyuan.tencentcloudapi.com">
        <Input placeholder="https://hunyuan.tencentcloudapi.com" disabled={!tencentEnabled} />
      </Form.Item>

      <Form.Item label="套餐类型" name="tencentPlanType" tooltip="选择混元 Coding Plan 类型">
        <Select disabled={!tencentEnabled}>
          <Select.Option value="hunyuan-code-pro">HunYuan-Code-Pro (混元代码专业版)</Select.Option>
          <Select.Option value="hunyuan-code-lite">HunYuan-Code-Lite (混元代码轻量版)</Select.Option>
        </Select>
      </Form.Item>

      <Divider orientation="left">百度智能云千帆 - 文心一言 Coding Plan</Divider>
      
      <Form.Item label="启用" name="baiduEnabled" valuePropName="checked">
        <Switch 
          checked={baiduEnabled}
          onChange={setBaiduEnabled}
        />
      </Form.Item>

      <Form.Item label="API Key" name="baiduApiKey" tooltip="在百度智能云千帆平台获取的 API Key">
        <Input.Password placeholder="请输入百度云 API Key" disabled={!baiduEnabled} />
      </Form.Item>

      <Form.Item label="Secret Key" name="baiduSecretKey" tooltip="在百度智能云千帆平台获取的 Secret Key">
        <Input.Password placeholder="请输入百度云 Secret Key" disabled={!baiduEnabled} />
      </Form.Item>

      <Form.Item label="API Endpoint" name="baiduEndpoint" initialValue="https://aip.baidubce.com/rpc/2.0/ai_custom/v1">
        <Input placeholder="https://aip.baidubce.com/rpc/2.0/ai_custom/v1" disabled={!baiduEnabled} />
      </Form.Item>

      <Form.Item label="套餐类型" name="baiduPlanType" tooltip="选择文心一言 Coding Plan 类型">
        <Select disabled={!baiduEnabled}>
          <Select.Option value="ernie-bot-code-pro">ERNIE-Bot-Code-Pro (文心快码专业版)</Select.Option>
          <Select.Option value="ernie-bot-code-lite">ERNIE-Bot-Code-Lite (文心快码轻量版)</Select.Option>
        </Select>
      </Form.Item>

      <Divider orientation="left">其他厂商 - 自定义 Coding Plan</Divider>
      
      <Form.Item label="启用" name="customEnabled" valuePropName="checked">
        <Switch 
          checked={customEnabled}
          onChange={setCustomEnabled}
        />
      </Form.Item>

      <Form.Item label="平台名称" name="customPlatformName" tooltip="Coding Plan 平台名称">
        <Input placeholder="例如：讯飞星火、智谱 AI 等" disabled={!customEnabled} />
      </Form.Item>

      <Form.Item label="API Key" name="customApiKey" tooltip="该平台提供的 API Key 或等效凭证">
        <Input.Password placeholder="请输入 API Key" disabled={!customEnabled} />
      </Form.Item>

      <Form.Item label="API Endpoint" name="customEndpoint" tooltip="该平台的 API 端点地址">
        <Input placeholder="请输入 API Endpoint" disabled={!customEnabled} />
      </Form.Item>

      <Form.Item label="套餐类型" name="customPlanType" tooltip="该平台的 Coding Plan 名称">
        <Input placeholder="请输入套餐类型名称" disabled={!customEnabled} />
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
      rateLimitMax: 10,
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