import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Space, Empty, Spin, message, Tag, Modal, Input, Form } from 'antd';
import { PlusOutlined, AppstoreOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  resources: Array<{
    type: string;
    name: string;
    configuration: Record<string, unknown>;
  }>;
  variables: Array<{
    name: string;
    type: string;
    defaultValue: unknown;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const Templates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/templates');
      if (response.data.success) {
        setTemplates(response.data.data || []);
      }
    } catch (error) {
      // If no templates exist yet, show empty state
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (values: { name: string; description: string; category: string }) => {
    try {
      const response = await axios.post('/api/v1/templates', {
        ...values,
        resources: [],
        variables: [],
      });
      if (response.data.success) {
        message.success('Template created successfully');
        setCreateModalOpen(false);
        form.resetFields();
        fetchTemplates();
      }
    } catch (error) {
      message.error('Failed to create template');
    }
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewModalOpen(true);
  };

  const handleUseTemplate = async (template: Template) => {
    try {
      // Check if it's a default template (starts with 'default-')
      if (template.id.startsWith('default-')) {
        // Create project directly from the default template resources
        const response = await axios.post('/api/v1/projects', {
          name: `${template.name} - ${new Date().toLocaleDateString()}`,
          description: template.description,
          environment: 'development',
        });
        
        if (response.data.success) {
          const projectId = response.data.data.id;
          
          // Add resources to the project
          for (const resource of template.resources) {
            await axios.post(`/api/v1/projects/${projectId}/resources`, {
              type: resource.type,
              name: resource.name,
              configuration: resource.configuration,
            });
          }
          
          message.success('Project created from template');
          window.location.href = `/projects/${projectId}`;
        }
      } else {
        // Use the template instantiate endpoint for database templates
        const response = await axios.post(`/api/v1/templates/${template.id}/instantiate`, {
          projectName: `${template.name} - ${new Date().toLocaleDateString()}`,
        });
        if (response.data.success) {
          message.success('Project created from template');
          window.location.href = `/projects/${response.data.data.id}`;
        }
      }
    } catch (error) {
      message.error('Failed to create project from template');
    }
  };

  // Default templates for demonstration
  const defaultTemplates: Template[] = [
    {
      id: 'default-1',
      name: 'Basic Web Application',
      description: 'A basic web application infrastructure with Virtual Network, Subnet, and Network Security Group',
      category: 'web-app',
      resources: [
        { type: 'azurerm_resource_group', name: 'main-rg', configuration: { name: 'rg-webapp', location: 'eastus' } },
        { type: 'azurerm_virtual_network', name: 'main-vnet', configuration: { name: 'vnet-main', address_space: ['10.0.0.0/16'] } },
        { type: 'azurerm_subnet', name: 'web-subnet', configuration: { name: 'snet-web', address_prefixes: ['10.0.1.0/24'] } },
        { type: 'azurerm_network_security_group', name: 'web-nsg', configuration: { name: 'nsg-web' } },
      ],
      variables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-2',
      name: 'Storage Account Setup',
      description: 'A storage account with standard configuration for general purpose v2',
      category: 'storage',
      resources: [
        { type: 'azurerm_resource_group', name: 'storage-rg', configuration: { name: 'rg-storage', location: 'eastus' } },
        { type: 'azurerm_storage_account', name: 'main-storage', configuration: { name: 'stmain', account_tier: 'Standard', account_replication_type: 'LRS' } },
      ],
      variables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-3',
      name: 'Network Infrastructure',
      description: 'Complete network setup with VNet, subnets, and public IP',
      category: 'networking',
      resources: [
        { type: 'azurerm_resource_group', name: 'network-rg', configuration: { name: 'rg-network', location: 'eastus' } },
        { type: 'azurerm_virtual_network', name: 'main-vnet', configuration: { name: 'vnet-main', address_space: ['10.0.0.0/16'] } },
        { type: 'azurerm_subnet', name: 'frontend-subnet', configuration: { name: 'snet-frontend', address_prefixes: ['10.0.1.0/24'] } },
        { type: 'azurerm_subnet', name: 'backend-subnet', configuration: { name: 'snet-backend', address_prefixes: ['10.0.2.0/24'] } },
        { type: 'azurerm_public_ip', name: 'frontend-pip', configuration: { name: 'pip-frontend', sku: 'Standard' } },
      ],
      variables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const displayTemplates = templates.length > 0 ? templates : defaultTemplates;

  const categoryColors: Record<string, string> = {
    'web-app': '#0078d4',
    storage: '#ffb900',
    networking: '#00bcf2',
    compute: '#f25022',
    database: '#e81123',
  };

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Template Library
          </Title>
          <Text type="secondary">
            Pre-built infrastructure templates for common Azure patterns
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Template
          </Button>
        </Col>
      </Row>

      <Spin spinning={loading}>
        {displayTemplates.length === 0 ? (
          <Empty
            description="No templates available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {displayTemplates.map((template) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={template.id}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  styles={{
                    body: { display: 'flex', flexDirection: 'column', height: 'calc(100% - 57px)' },
                  }}
                >
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        background: `${categoryColors[template.category] || '#666'}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <AppstoreOutlined
                        style={{
                          fontSize: 24,
                          color: categoryColors[template.category] || '#666',
                        }}
                      />
                    </div>
                    <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                      {template.name}
                    </Title>
                    <Tag color={categoryColors[template.category] || 'default'}>
                      {template.category}
                    </Tag>
                  </div>

                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    style={{ flex: 1, marginBottom: 12 }}
                  >
                    {template.description}
                  </Paragraph>

                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {template.resources.length} resources
                    </Text>
                  </div>

                  <Space style={{ marginTop: 'auto' }}>
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      Preview
                    </Button>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use
                    </Button>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      {/* Create Template Modal */}
      <Modal
        title="Create New Template"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTemplate}
        >
          <Form.Item
            name="name"
            label="Template Name"
            rules={[{ required: true, message: 'Please enter a template name' }]}
          >
            <Input placeholder="e.g., My Custom Template" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Input placeholder="e.g., web-app, storage, networking" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Describe the template purpose and resources" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Template Modal */}
      <Modal
        title={selectedTemplate?.name}
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="use"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              if (selectedTemplate) {
                handleUseTemplate(selectedTemplate);
              }
            }}
          >
            Use Template
          </Button>,
        ]}
        width={600}
      >
        {selectedTemplate && (
          <div>
            <Paragraph>
              <Text strong>Description:</Text>
              <br />
              {selectedTemplate.description}
            </Paragraph>
            
            <Title level={5}>Resources ({selectedTemplate.resources.length})</Title>
            <div style={{ marginBottom: 16 }}>
              {selectedTemplate.resources.map((resource, index) => (
                <Tag key={index} style={{ marginBottom: 4 }}>
                  {resource.type.replace('azurerm_', '').replace(/_/g, ' ')}: {resource.name}
                </Tag>
              ))}
            </div>

            {selectedTemplate.variables.length > 0 && (
              <>
                <Title level={5}>Variables</Title>
                <div>
                  {selectedTemplate.variables.map((variable, index) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <Text code>{variable.name}</Text>
                      <Text type="secondary"> - {variable.description}</Text>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Templates;
