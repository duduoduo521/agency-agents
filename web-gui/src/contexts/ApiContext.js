import React, { createContext, useContext, useState } from 'react';
import apiClient from '../services/api';
import { taskApi, healthApi } from '../services/api';

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider = ({ children }) => {
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000/api');
  
  // 更新API客户端的baseURL
  const updateBaseUrl = (newBaseUrl) => {
    apiClient.defaults.baseURL = newBaseUrl;
    setBaseUrl(newBaseUrl);
  };

  const value = {
    taskApi,
    healthApi,
    baseUrl,
    updateBaseUrl
  };

  return React.createElement(
    ApiContext.Provider,
    { value },
    children
  );
};