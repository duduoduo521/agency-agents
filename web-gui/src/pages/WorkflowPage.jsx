import React from'react';
import { Card, Table, Button, Tag, Progress, Space, message } from'antd';

const WorkflowPage = () => {
 const data = [
    {
    key: '1',
      name: '用户登录系统',
     status: 'completed',
    stage: '发布准备',
      progress: 100,
     createdAt: '2026-03-24 10:00',
    },
    {
     key: '2',
      name: '电商网站 MVP',
      status: 'running',
     stage: '代码实现',
      progress: 65,
     createdAt: '2026-03-24 14:30',
    },
    {
     key: '3',
      name: '博客系统',
      status: 'pending',
     stage: '需求分析',
      progress: 20,
     createdAt: '2026-03-24 16:00',
    },
  ];

const columns = [
    {
     title: '工作流名称',
     dataIndex: 'name',
     key: 'name',
    },
    {
     title: '状态',
     dataIndex: 'status',
     key: 'status',
     render: (status) => {
      const colorMap = {
         pending: 'orange',
         running: 'blue',
        completed: 'green',
         failed: 'red',
       };
      const textMap = {
         pending: '待处理',
         running: '进行中',
        completed: '已完成',
         failed: '失败',
       };
       return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
     },
    },
    {
     title: '当前阶段',
     dataIndex: 'stage',
     key: 'stage',
    },
    {
     title: '进度',
     dataIndex: 'progress',
     key: 'progress',
     render: (progress) => (
       <Progress percent={progress} strokeColor={progress === 100 ? '#52c41a' : '#1677ff'} />
     ),
    },
    {
     title: '创建时间',
     dataIndex: 'createdAt',
     key: 'createdAt',
    },
    {
     title: '操作',
     key: 'action',
     render: (_, record) => (
       <Space size="middle">
         <Button type="link" size="small">查看</Button>
         {record.status === 'pending' && (
           <Button type="link" size="small" onClick={() => message.success(`启动工作流：${record.name}`)}>
             启动
           </Button>
         )}
       </Space>
     ),
    },
  ];

 return (
    <div>
      <h1 style={{ marginBottom: 24 }}>工作流管理</h1>
      <Card>
        <Table columns={columns} dataSource={data} />
      </Card>
    </div>
  );
};

export default WorkflowPage;
