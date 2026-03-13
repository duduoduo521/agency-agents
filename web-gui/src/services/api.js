import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: '/api', // 使用相对路径，适配当前域名和端口
  timeout: 60000, // 60秒超时
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// 任务相关API
export const taskApi = {
  // 获取任务列表
  getTasks: () => apiClient.get('/tasks'),
  
  // 获取单个任务
  getTaskById: (taskId) => apiClient.get(`/tasks/${taskId}`),
  
  // 创建任务
  createTask: (taskData) => apiClient.post('/tasks', taskData),
  
  // 终止任务
  terminateTask: (taskId) => apiClient.post(`/tasks/${taskId}/terminate`),

  // 删除任务
  deleteTask: (taskId) => apiClient.delete(`/tasks/${taskId}`),
  
  // 重试任务
  retryTask: (taskId) => apiClient.post(`/tasks/${taskId}/retry`),
  
  // 下载任务代码
  downloadTaskCode: (taskId) => {
    return `${apiClient.defaults.baseURL}/tasks/${taskId}/download`;
  },
  
  // 获取任务日志流
  getTaskLogsStream: (taskId) => {
    return `${apiClient.defaults.baseURL}/tasks/${taskId}/logs/stream`;
  }
};

// 服务器健康检查
export const healthApi = {
  getStatus: () => apiClient.get('/status'),
  // 检查大模型配置状态
  checkLlmConfig: async () => {
    try {
      // 尝试调用后端API
      const response = await apiClient.get('/health/llm-config');
      return response;
    } catch (error) {
      // 如果后端API不可用，返回错误状态
      console.warn('后端健康检查API不可用');
      return { 
        data: { 
          configured: false, 
          providers: {
            ali: { enabled: false, configured: false, apiKey: '', endpoint: '', planType: 'qwen-coder-plus' },
            tencent: { enabled: false, configured: false, secretId: '', endpoint: '', planType: 'hunyuan-code-pro' },
            baidu: { enabled: false, configured: false, apiKey: '', endpoint: '', planType: 'ernie-bot-code-pro' },
            custom: { enabled: false, configured: false, apiKey: '', endpoint: '', planType: '' }
          }
        }
      };
    }
  },
};

// Coding Plan 配置 API
export const configApi = {
  // 获取 Coding Plan 配置
  getCodingPlanConfig: () => apiClient.get('/config/coding-plan'),
  
  // 保存 Coding Plan 配置
  saveCodingPlanConfig: (config) => apiClient.post('/config/coding-plan', config),
};

export default apiClient;