import { Row, Col, Card, Typography, Button, Space, Statistic } from 'antd';
import { PlusOutlined, FolderOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Paragraph type="secondary">
        Welcome to TerraformUI. Design your Azure infrastructure visually and generate Terraform code.
      </Paragraph>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Projects"
              value={0}
              prefix={<FolderOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Resources Configured"
              value={0}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Templates Available"
              value={0}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Quick Actions"
            extra={<Button type="link">View All</Button>}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                block
                onClick={() => navigate('/designer')}
              >
                New Resource Configuration
              </Button>
              <Button
                icon={<FolderOutlined />}
                block
                onClick={() => navigate('/projects')}
              >
                View Projects
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Getting Started">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph>
                <strong>1. Design Resources</strong>
                <br />
                Use the Resource Designer to configure Azure resources visually.
              </Paragraph>
              <Paragraph>
                <strong>2. Generate Terraform</strong>
                <br />
                Generate valid Terraform code from your configuration.
              </Paragraph>
              <Paragraph>
                <strong>3. Deploy</strong>
                <br />
                Download the generated files and deploy with Terraform CLI.
              </Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
