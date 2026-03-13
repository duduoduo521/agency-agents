/**
 * Coding Plan API 调用服务
 * 
 * 支持阿里云、腾讯云、百度等厂商的 Coding Plan API
 */

const axios = require('axios');
const crypto = require('crypto');

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
  * 调用阿里云百炼 API（通义千问）- 支持 OpenAI 兼容接口
  */
 async callAliyun(prompt, model = 'qwen-coder-plus') {
   const endpoint = this.config.ali.endpoint || 'https://dashscope.aliyuncs.com/api/v1';
   // 使用配置中的 planType，如果没有则使用传入的 model 参数
   const modelToUse = this.config.ali.planType || model;
   
   try {
     // 根据 endpoint 类型确定 API 路径
     let apiUrl;
     if (endpoint.includes('coding.dashscope.aliyuncs.com')) {
       // 针对 Coding Plan 的 OpenAI 兼容接口
       apiUrl = `${endpoint}/chat/completions`;
     } else if (endpoint.includes('dashscope.aliyuncs.com')) {
       // 传统 DashScope 接口
       apiUrl = `${endpoint}/services/aigc/text-generation/generation`;
     } else {
       // 默认使用 OpenAI 兼容接口
       apiUrl = `${endpoint}/chat/completions`;
     }
     
     // 根据 endpoint 类型选择请求和响应格式
     let requestData, requestBody;
     if (endpoint.includes('coding.dashscope.aliyuncs.com')) {
       // OpenAI 兼容格式
       requestData = {
         model: modelToUse,
         messages: [
           { role: 'system', content: '你是一个专业的 AI 编程助手，擅长编写高质量代码。' },
           { role: 'user', content: prompt }
         ],
         temperature: 0.7,
         max_tokens: 4096
       };
       requestBody = requestData;
     } else {
       // 传统的阿里云格式
       requestData = {
         model: modelToUse,
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
       };
       requestBody = requestData;
     }
     
     const response = await axios.post(
       apiUrl,
       requestBody,
       {
         headers: {
           'Authorization': `Bearer ${this.config.ali.apiKey}`,
           'Content-Type': 'application/json'
         },
         timeout: 60000 // 添加超时设置
       }
     );
     
     // 根据不同的 API 响应格式提取文本
     if (endpoint.includes('coding.dashscope.aliyuncs.com')) {
       // OpenAI 兼容响应格式
       return response.data.choices[0]?.message?.content || response.data.choices[0]?.text || 'API响应格式不正确';
     } else {
       // 传统的阿里云响应格式
       if (response.data.output && response.data.output.choices) {
         return response.data.output.choices[0]?.message?.content || response.data.output.text;
       } else if (response.data.output) {
         return response.data.output.text;
       } else {
         throw new Error(`API 响应格式不正确: ${JSON.stringify(response.data)}`);
       }
     }
   } catch (error) {
     console.error('阿里云 API 错误详情:', error.response?.data || error.message);
     // 如果是认证错误，提供更多细节
     if (error.response?.status === 401) {
       throw new Error(`阿里云 API 调用失败：认证失败，请检查 API Key 是否正确 - ${error.message}`);
     } else if (error.response?.status === 404) {
       throw new Error(`阿里云 API 调用失败：请求的接口不存在，请检查 endpoint 和 API 路径是否正确 - ${error.message}`);
     }
     throw new Error(`阿里云 API 调用失败：${error.message}`);
   }
 }

 /**
  * 计算TC3-HMAC-SHA256签名
  */
 async calculateTC3HMACSHA256(secretId, secretKey, region, action, version, timestamp, endpoint, payload) {
    // 1. 构造标准化请求
    const httpRequestMethod = 'POST';
    const canonicalUri = '/';
    const canonicalQueryString = '';
    const contentType = 'application/json; charset=utf-8';
    
    const canonicalHeaders = `content-type:${contentType}\nhost:${endpoint}\n`;
    const signedHeaders = 'content-type;host';
    
    // 对请求载荷进行哈希
    const hashedRequestPayload = crypto.createHash('sha256').update(payload).digest('hex');
    
    const canonicalRequest = httpRequestMethod + '\n' +
                           canonicalUri + '\n' +
                           canonicalQueryString + '\n' +
                           canonicalHeaders + '\n' +
                           signedHeaders + '\n' +
                           hashedRequestPayload;

    // 2. 拼接待签名字符串
    const algorithm = 'TC3-HMAC-SHA256';
    const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    
    // 日期格式为 YYYY-MM-DD
    const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
    const credentialScope = date + '/' + region + '/' + 'tmt' + '/' + 'tc3_request'; // tmt是翻译服务示例，实际应根据具体服务调整
    
    const stringToSign = algorithm + '\n' +
                        timestamp + '\n' +
                        credentialScope + '\n' +
                        hashedCanonicalRequest;

    // 3. 计算签名
    const kDate = crypto.createHmac('sha256', 'TC3' + secretKey)
                         .update(date)
                         .digest();
    const kService = crypto.createHmac('sha256', kDate)
                            .update(region)
                            .digest();
    const kSigning = crypto.createHmac('sha256', kService)
                           .update('tmt') // 实际应根据具体服务调整
                           .digest();
    const kSubService = crypto.createHmac('sha256', kSigning)
                              .update('tc3_request')
                              .digest();
    const signature = crypto.createHmac('sha256', kSubService)
                            .update(stringToSign)
                            .digest('hex');

    // 4. 拼接 Authorization
    const authorization = algorithm + ' ' +
                         'Credential=' + secretId + '/' + credentialScope + ', ' +
                         'SignedHeaders=' + signedHeaders + ', ' +
                         'Signature=' + signature;

    return authorization;
 }

 /**
  * 调用腾讯云混元 API
  */
 async callTencent(prompt, model = 'hunyuan-code-pro') {
    const endpoint = this.config.tencent.endpoint || 'hunyuan.tencentcloudapi.com';
    const region = this.config.tencent.region || 'ap-beijing'; // 默认北京region
    const action = 'ChatCompletions';
    const version = '2023-09-01';
    
    // 构建请求载荷
    const payload = JSON.stringify({
      Model: model,
      Messages: [
        { Role: 'system', Content: '你是一个专业的 AI 编程助手，擅长编写高质量代码。' },
        { Role: 'user', Content: prompt }
      ],
      Stream: false
    });
    
    // 获取当前时间戳
    const timestamp = Math.floor(Date.now() / 1000);
    
    // 计算签名
    const authorization = await this.calculateTC3HMACSHA256(
      this.config.tencent.secretId,
      this.config.tencent.secretKey,
      region,
      action,
      version,
      timestamp,
      endpoint,
      payload
    );

    try {
      const response = await axios.post(
        `https://${endpoint}`,
        payload,
        {
          headers: {
            'Authorization': authorization,
            'Content-Type': 'application/json; charset=utf-8',
            'Host': endpoint,
            'X-TC-Action': action,
            'X-TC-Version': version,
            'X-TC-Region': region,
            'X-TC-Timestamp': timestamp,
          }
        }
      );
      
      // 腾讯云API响应格式可能略有不同，需要根据实际API文档调整
      return response.data.Response?.Choices?.[0]?.Message?.Content || 
             response.data.Response?.ResponseText || 
             'API响应格式不正确';
    } catch (error) {
      if (error.response) {
        // API返回错误信息
        throw new Error(`腾讯云 API 调用失败：${error.response.data.Response?.Error?.Message || error.message}`);
      } else {
        throw new Error(`腾讯云 API 调用失败：${error.message}`);
      }
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
    return await this.callAliyun(prompt, this.config.ali.planType || 'qwen-coder-plus'); // 确保使用配置的 planType
   case'tencent':
    return await this.callTencent(prompt, this.config.tencent.planType || 'hunyuan-code-pro');
   case 'baidu':
    return await this.callBaidu(prompt, this.config.baidu.planType || 'ernie-bot-code-pro');
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