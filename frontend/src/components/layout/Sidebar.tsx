import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  AppstoreOutlined,
  FolderOutlined,
  SettingOutlined,
  ApartmentOutlined,
  CopyOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/designer',
      icon: <AppstoreOutlined />,
      label: 'Resource Designer',
    },
    {
      key: '/visual-designer',
      icon: <ApartmentOutlined />,
      label: 'Visual Designer',
    },
    {
      key: '/projects',
      icon: <FolderOutlined />,
      label: 'Projects',
    },
    {
      key: '/templates',
      icon: <CopyOutlined />,
      label: 'Templates',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider width={220} className="sidebar" theme="light">
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className="sidebar-menu"
      />
    </Sider>
  );
}

export default AppSidebar;
