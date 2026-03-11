import React from'react';
import { Card, Table, Tag, Button, Space, Modal, message } from'antd';

const AgentPage = () => {
 const data = [
    {
   key: '1',
      name: '需求分析师',
     role: 'Requirements Analyst',
    status: 'active',
    specialty: '需求收集、用户故事、验收标准',
    },
    {
     key: '2',
      name: '产品设计师',
      role: 'Product Designer',
      status: 'busy',
     specialty: '功能设计、用户流程、界面设计',
    },
    {
     key: '3',
      name: '架构师',
      role: 'System Architect',
      status: 'active',
     specialty: '技术选型、系统架构、API 设计',
    },
    {
     key: '4',
      name: '前端开发者',
      role: 'Frontend Developer',
      status: 'active',
     specialty: 'React、Vue、Angular、TypeScript',
    },
    {
     key: '5',
      name: '后端开发者',
      role: 'Backend Developer',
      status: 'inactive',
     specialty: 'Node.js、Python、Java、数据库',
    },
    {
     key: '6',
      name: '测试工程师',
      role: 'Test Engineer',
      status: 'active',
     specialty: '单元测试、集成测试、E2E 测试',
    },
  ];

const columns = [
    {
     title: '代理名称',
     dataIndex: 'name',
     key: 'name',
    },
    {
     title: '角色',
     dataIndex: 'role',
     key: 'role',
    },
    {
     title: '状态',
     dataIndex: 'status',
     key: 'status',
     render: (status) => {
     const colorMap = {
         active: 'green',
         inactive: 'gray',
         busy: 'blue',
       };
     const textMap = {
         active: '空闲',
         inactive: '未激活',
         busy: '忙碌',
       };
       return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
     },
    },
    {
     title: '专业领域',
     dataIndex: 'specialty',
     key: 'specialty',
    },
    {
     title: '操作',
     key: 'action',
     render: (_, record) => (
       <Space size="middle">
         <Button
           type="link" 
           size="small"
           onClick={() => Modal.info({
             title: `${record.name} - 配置`,
            content: '代理配置功能开发中...',
           })}
         >
           配置
         </Button>
         <Button
           type="link" 
           size="small"
           onClick={() => message.success(`已激活代理：${record.name}`)}
         >
           {record.status === 'inactive' ? '激活' : '测试'}
         </Button>
       </Space>
     ),
    },
  ];

 return (
    <div>
      <h1 style={{ marginBottom: 24 }}>代理管理</h1>
      <Card>
        <Table columns={columns} dataSource={data} />
      </Card>
    </div>
  );
};

export default AgentPage;
