import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Empty, Spin, message } from 'antd';
import { PlusOutlined, FolderOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Project } from '@terraformui/shared';

const { Title, Paragraph } = Typography;

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/v1/projects');
      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (error) {
      message.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    navigate('/designer');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Projects</Title>
          <Paragraph type="secondary">Manage your infrastructure projects</Paragraph>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateProject}>
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <Empty
            description="No projects yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateProject}>
              Create Your First Project
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {projects.map((project) => (
            <Col xs={24} sm={12} lg={8} key={project.id}>
              <Card
                hoverable
                className="resource-card"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FolderOutlined style={{ fontSize: 24, color: '#0078d4' }} />
                  <div>
                    <Title level={5} style={{ margin: 0 }}>{project.name}</Title>
                    <Paragraph type="secondary" style={{ margin: 0 }}>
                      {project.description || 'No description'}
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default Projects;
