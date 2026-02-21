import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Empty, Spin, message, Modal, Input, Space, Tag, Dropdown, Form } from 'antd';
import { PlusOutlined, FolderOutlined, MoreOutlined, DeleteOutlined, EditOutlined, CodeOutlined, ExportOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Project } from '@ianc/shared';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/v1/projects');
      if (response.data.success) {
        setProjects(response.data.data || []);
      }
    } catch (error) {
      message.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (values: { name: string; description: string }) => {
    try {
      const response = await axios.post('/api/v1/projects', {
        name: values.name,
        description: values.description,
        environment: 'development',
      });
      if (response.data.success) {
        message.success('Project created successfully');
        setCreateModalOpen(false);
        form.resetFields();
        fetchProjects();
        // Navigate to the new project
        navigate(`/projects/${response.data.data.id}`);
      }
    } catch (error) {
      message.error('Failed to create project');
    }
  };

  const handleEditProject = async (values: { name: string; description: string }) => {
    if (!selectedProject) return;
    
    try {
      const response = await axios.put(`/api/v1/projects/${selectedProject.id}`, {
        name: values.name,
        description: values.description,
      });
      if (response.data.success) {
        message.success('Project updated successfully');
        setEditModalOpen(false);
        setSelectedProject(null);
        form.resetFields();
        fetchProjects();
      }
    } catch (error) {
      message.error('Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await axios.delete(`/api/v1/projects/${projectId}`);
      if (response.data.success) {
        message.success('Project deleted successfully');
        fetchProjects();
      }
    } catch (error) {
      message.error('Failed to delete project');
    }
  };

  const handleGenerateTerraform = async (project: Project) => {
    try {
      const response = await axios.post(`/api/v1/projects/${project.id}/generate`);
      if (response.data.success) {
        // Download the generated files
        const files = response.data.data.files;
        const mainTf = files['main.tf'];
        
        // Create downloadable content
        const blob = new Blob([mainTf], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project.name}-main.tf`;
        link.click();
        URL.revokeObjectURL(url);
        
        message.success('Terraform code generated and downloaded');
      }
    } catch (error) {
      message.error('Failed to generate Terraform code');
    }
  };

  const handleExportProject = async (project: Project) => {
    try {
      const response = await axios.get(`/api/v1/projects/${project.id}/export`);
      if (response.data.success) {
        const json = JSON.stringify(response.data.data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project.name}-export.json`;
        link.click();
        URL.revokeObjectURL(url);
        message.success('Project exported successfully');
      }
    } catch (error) {
      message.error('Failed to export project');
    }
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    form.setFieldsValue({
      name: project.name,
      description: project.description,
    });
    setEditModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Projects</Title>
          <Paragraph type="secondary">Manage your infrastructure projects</Paragraph>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <Empty
            description="No projects yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
              Create Your First Project
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {projects.map((project) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
              <Card
                hoverable
                style={{ height: '100%' }}
                styles={{
                  body: { display: 'flex', flexDirection: 'column' },
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      background: '#0078d420',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FolderOutlined style={{ fontSize: 24, color: '#0078d4' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Title level={5} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {project.name}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {project.environment || 'development'}
                    </Text>
                  </div>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'edit',
                          icon: <EditOutlined />,
                          label: 'Edit',
                          onClick: () => openEditModal(project),
                        },
                        {
                          key: 'generate',
                          icon: <CodeOutlined />,
                          label: 'Generate Terraform',
                          onClick: () => handleGenerateTerraform(project),
                        },
                        {
                          key: 'export',
                          icon: <ExportOutlined />,
                          label: 'Export',
                          onClick: () => handleExportProject(project),
                        },
                        {
                          type: 'divider',
                        },
                        {
                          key: 'delete',
                          icon: <DeleteOutlined />,
                          label: 'Delete',
                          danger: true,
                          onClick: () => {
                            Modal.confirm({
                              title: 'Delete Project',
                              content: `Are you sure you want to delete "${project.name}"?`,
                              okText: 'Delete',
                              okButtonProps: { danger: true },
                              onOk: () => handleDeleteProject(project.id),
                            });
                          },
                        },
                      ],
                    }}
                    trigger={['click']}
                  >
                    <Button type="text" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                  </Dropdown>
                </div>

                <Paragraph
                  type="secondary"
                  ellipsis={{ rows: 2 }}
                  style={{ flex: 1, marginBottom: 12, minHeight: 44 }}
                >
                  {project.description || 'No description'}
                </Paragraph>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {project.resources?.length || 0} resources
                  </Text>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    Open
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Create Project Modal */}
      <Modal
        title="Create New Project"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateProject}
        >
          <Form.Item
            name="name"
            label="Project Name"
            rules={[{ required: true, message: 'Please enter a project name' }]}
          >
            <Input placeholder="e.g., My Infrastructure Project" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Describe your infrastructure project" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Create Project
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        title="Edit Project"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedProject(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditProject}
        >
          <Form.Item
            name="name"
            label="Project Name"
            rules={[{ required: true, message: 'Please enter a project name' }]}
          >
            <Input placeholder="e.g., My Infrastructure Project" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Describe your infrastructure project" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => {
                setEditModalOpen(false);
                setSelectedProject(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Projects;
