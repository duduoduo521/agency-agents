/**
 * Coding Plan API 调用服务
 * 
 * 支持阿里云、腾讯云、百度等厂商的 Coding Plan API
 */

const axios = require('axios');

class CodingPlanService {
 constructor(config = {}) {
  this.config = config;
 }

 /**
  * 根据配置选择启用的服务商
  */
 getEnabledService() {
  if (this.config.ali?.enabled && this.config.ali.apiKey) {
   return 'ali';
  }
  if (this.config.tencent?.enabled && this.config.tencent.secretId) {
   return 'tencent';
  }
  if (this.config.baidu?.enabled && this.config.baidu.apiKey) {
   return 'baidu';
  }
  if (this.config.custom?.enabled && this.config.custom.apiKey) {
   return 'custom';
  }
 return null;
 }

 /**
  * 调用阿里云百炼 API（通义千问）
  */
 async callAliyun(prompt, model= 'qwen-coder-plus') {
 const endpoint = this.config.ali.endpoint || 'https://dashscope.aliyuncs.com/api/v1';
  
 try {
  const response = await axios.post(
     `${endpoint}/services/aigc/text-generation/generation`,
    {
      model,
     input: {
       messages: [
         { role: 'system', content: '你是一个专业的 AI 编程助手，擅长编写高质量代码。' },
        { role: 'user', content: prompt }
       ]
     },
     parameters: {
       temperature: 0.7,
       max_tokens: 4096
     }
    },
    {
     headers: {
       'Authorization': `Bearer ${this.config.ali.apiKey}`,
       'Content-Type': 'application/json'
     }
    }
   );
   
   return response.data.output.text;
 } catch (error) {
   throw new Error(`阿里云 API 调用失败：${error.message}`);
 }
 }

 /**
  * 调用腾讯云混元 API
  */
 async callTencent(prompt, model = 'hunyuan-code-pro') {
  // 腾讯云需要签名算法，这里简化处理
  // 实际应该使用腾讯云的 SDK 进行签名
 const endpoint = this.config.tencent.endpoint;
  
 try {
   // TODO: 实现腾讯云签名算法
  const response = await axios.post(
     endpoint,
    {
      Model: model,
     Messages: [
       { Role: 'system', Content: '你是一个专业的 AI 编程助手。' },
       { Role: 'user', Content: prompt }
     ]
    },
    {
     headers: {
       'X-TC-Action': 'ChatCompletions',
       'X-TC-Version': '2023-09-01',
       'X-TC-Region': 'ap-guangzhou',
       'Authorization': 'TODO-Implement-Signature', // 需要实现 TC3-HMAC-SHA256 签名
       'Content-Type': 'application/json'
     }
    }
   );
   
   return response.data.Choices[0].Message.Content;
 } catch (error) {
   throw new Error(`腾讯云 API 调用失败：${error.message}`);
 }
 }

 /**
  * 调用百度千帆 API（文心一言）
  */
 async callBaidu(prompt, model= 'ernie-bot-code-pro') {
  // 百度需要先获取 access_token
 const apiKey = this.config.baidu.apiKey;
 const secretKey = this.config.baidu.secretKey;
  
 try {
   // 获取 access_token
  const tokenResponse = await axios.post(
     `https://aip.baidubce.com/oauth/2.0/token`,
    null,
    {
     params: {
       grant_type: 'client_credentials',
       client_id: apiKey,
       client_secret: secretKey
     }
    }
   );
   
  const accessToken= tokenResponse.data.access_token;
   
   // 调用文心一言 API
  const response = await axios.post(
     `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${model}?access_token=${accessToken}`,
    {
      messages: [
        { role: 'system', content: '你是一个专业的 AI 编程助手。' },
        { role: 'user', content: prompt }
      ]
    },
    {
     headers: {
       'Content-Type': 'application/json'
     }
    }
   );
   
   return response.data.result;
 } catch (error) {
   throw new Error(`百度云 API 调用失败：${error.message}`);
 }
 }

 /**
  * 调用自定义平台 API
  */
 async callCustom(prompt) {
 const endpoint = this.config.custom.endpoint;
  
 try {
  const response = await axios.post(
     endpoint,
    {
      prompt,
      model: this.config.custom.planType
    },
    {
     headers: {
       'Authorization': `Bearer ${this.config.custom.apiKey}`,
       'Content-Type': 'application/json'
     }
    }
   );
   
   // 不同平台的响应格式可能不同，需要根据实际情况调整
   return response.data.text || response.data.content || response.data.result;
 } catch (error) {
   throw new Error(`自定义平台 API 调用失败：${error.message}`);
 }
 }

 /**
  * 统一的代码生成接口
  */
 async generateCode(requirement, techStack = []) {
 const service = this.getEnabledService();
  
  if (!service) {
   throw new Error('未启用任何 Coding Plan 服务，请在设置中配置至少一个服务商');
  }
  
  // 构建提示词
 const prompt = this.buildPrompt(requirement, techStack);
  
  // 调用对应的 API
  switch (service) {
   case 'ali':
    return await this.callAliyun(prompt, this.config.ali.planType);
   case'tencent':
    return await this.callTencent(prompt, this.config.tencent.planType);
   case 'baidu':
    return await this.callBaidu(prompt, this.config.baidu.planType);
   case 'custom':
    return await this.callCustom(prompt);
   default:
    throw new Error('未知的服务提供商');
  }
 }

 /**
  * 构建提示词模板
  */
 buildPrompt(requirement, techStack) {
 const techStackStr = techStack.length > 0 ? `技术栈：${techStack.join(', ')}` : '';
  
 return `你是一个专业的全栈开发工程师，请根据以下需求生成完整的代码实现：

**需求描述**:
${requirement}

${techStackStr ? `**技术栈要求**:
${techStackStr}` : ''}

**输出要求**:
1. 提供完整的项目结构
2. 每个文件都要包含完整的代码
3. 代码要有详细的注释
4. 遵循最佳实践和编码规范
5. 如果是前端项目，确保可以直接运行
6. 如果是后端项目，包含必要的配置文件和启动说明

请按照以下格式输出：
\`\`\`
文件名：path/to/file.js
\`\`\`
[文件内容]

现在开始生成代码：`;
 }
}

module.exports = CodingPlanService;
