import React, { useState } from'react';
import { Outlet, useNavigate, useLocation } from'react-router-dom';
import { Layout, Menu, theme, Button } from'antd';
import {
  HomeOutlined,
 AppstoreOutlined,
  RobotOutlined,
  SettingOutlined,
  ProjectOutlined,
  BugOutlined,
  CustomerServiceOutlined,  // 添加机器人配置图标
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
     key: '/',
      icon: <HomeOutlined />,
     label: '首页',
    },
    {
    key: '/task',
      icon: <ProjectOutlined />,
     label: '任务管理',
    },
    {
     key: '/workflow',
      icon: <AppstoreOutlined />,
     label: '工作流',
    },
    {
      key: '/agent',
      icon: <RobotOutlined />,
      label: '代理管理',
    },
    {
      key: '/test',  // 添加测试页面菜单项
      icon: <BugOutlined />,
      label: '系统测试',
    },
    {
      key: '/robot-config',  // 添加机器人配置菜单项
      icon: <CustomerServiceOutlined />,
      label: '机器人配置',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ];

  const handleMenuClick = (e) => {
    navigate(e.key);
  };

 return (
    <Layout style={{ minHeight:'100vh' }}>
      <Header
        style={{
          display: 'flex',
         alignItems: 'center',
         justifyContent: 'space-between',
          background: colorBgContainer,
         padding: '0 24px',
        }}
      >
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1677ff' }}>
          🚀 The Code Agency
        </div>
        <div style={{ color: '#666' }}>
          可视化工作流操作平台
        </div>
      </Header>
      <Layout>
        <Sider
         collapsible
         collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{ background: colorBgContainer }}
        >
          <Menu
            mode="inline"
           selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
        <Layout>
          <Content
            style={{
             margin: '24px 16px',
             padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;