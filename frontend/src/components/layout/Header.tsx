import { Layout, Typography } from 'antd';
import { CloudOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

function AppHeader() {
  return (
    <Header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <CloudOutlined style={{ fontSize: '24px', color: '#0078d4' }} />
        <Title level={4} style={{ margin: 0, color: '#0078d4' }}>
          TerraformUI
        </Title>
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <span style={{ color: '#666' }}>Azure Infrastructure Designer</span>
      </div>
    </Header>
  );
}

export default AppHeader;
