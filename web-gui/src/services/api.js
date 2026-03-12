import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // 默认后端API地址
  timeout: 30000, // 30秒超时
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
      // 首先尝试调用后端API
      const response = await apiClient.get('/health/llm-config');
      return response;
    } catch (error) {
      // 如果后端API不可用，回退到检查localStorage
      console.warn('后端健康检查API不可用，使用localStorage配置');
      try {
        const configStr = localStorage.getItem('the-code-agency-settings');
        if (configStr) {
          const config = JSON.parse(configStr);
          const hasConfiguredLlm = 
            (config.aliEnabled && config.aliApiKey) ||
            (config.tencentEnabled && config.tencentSecretId && config.tencentSecretKey) ||
            (config.baiduEnabled && config.baiduApiKey && config.baiduSecretKey) ||
            (config.customEnabled && config.customApiKey);
          
          return {
            data: {
              configured: hasConfiguredLlm,
              providers: {
                ali: { enabled: config.aliEnabled, configured: config.aliEnabled && config.aliApiKey },
                tencent: { enabled: config.tencentEnabled, configured: config.tencentEnabled && config.tencentSecretId && config.tencentSecretKey },
                baidu: { enabled: config.baiduEnabled, configured: config.baiduEnabled && config.baiduApiKey && config.baiduSecretKey },
                custom: { enabled: config.customEnabled, configured: config.customEnabled && config.customApiKey }
              }
            }
          };
        }
      } catch (e) {
        console.error('从localStorage读取配置失败:', e);
      }
      // 默认返回未配置
      return { data: { configured: false, providers: {} } };
    }
  },
};

export default apiClient;