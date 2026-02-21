import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Select, Button, Tabs, Spin, message, Input } from 'antd';
import { PlayCircleOutlined, DownloadOutlined, CopyOutlined } from '@ant-design/icons';
import axios from 'axios';
import type { AzureResourceSchema, PropertyDefinition } from '@terraformui/shared';
import DynamicForm from '../components/forms/DynamicForm';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

function ResourceDesigner() {
  const [resourceTypes, setResourceTypes] = useState<Array<{ type: string; displayName: string; category: string }>>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [schema, setSchema] = useState<AzureResourceSchema | null>(null);
  const [configuration, setConfiguration] = useState<Record<string, unknown>>({});
  const [generatedCode, setGeneratedCode] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchResourceTypes();
  }, []);

  const fetchResourceTypes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/resources/types');
      if (response.data.success) {
        setResourceTypes(response.data.data);
      }
    } catch (error) {
      message.error('Failed to load resource types');
    } finally {
      setLoading(false);
    }
  };

  const handleResourceTypeChange = async (type: string) => {
    setSelectedType(type);
    setConfiguration({});
    setGeneratedCode({});
    
    try {
      const response = await axios.get(`/api/v1/resources/types/${type}/schema`);
      if (response.data.success) {
        setSchema(response.data.data);
        // Set default values
        const defaults: Record<string, unknown> = {};
        response.data.data.properties.forEach((prop: PropertyDefinition) => {
          if (prop.defaultValue !== undefined) {
            defaults[prop.name] = prop.defaultValue;
          }
        });
        setConfiguration(defaults);
      }
    } catch (error) {
      message.error('Failed to load resource schema');
    }
  };

  const handleConfigurationChange = (values: Record<string, unknown>) => {
    setConfiguration(values);
  };

  const handleGenerate = async () => {
    if (!selectedType) return;

    setGenerating(true);
    try {
      const response = await axios.post('/api/v1/resources/generate', {
        type: selectedType,
        name: 'main',
        configuration,
        options: {
          extractVariables: true,
          includeProvider: true
        }
      });

      if (response.data.success) {
        setGeneratedCode(response.data.data.files);
        message.success('Terraform code generated successfully');
      }
    } catch (error) {
      message.error('Failed to generate Terraform code');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    const code = generatedCode['main.tf'] || '';
    navigator.clipboard.writeText(code);
    message.success('Code copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode['main.tf'] || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'main.tf';
    a.click();
    URL.revokeObjectURL(url);
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
      <Title level={2}>Resource Designer</Title>
      <Paragraph type="secondary">
        Select a resource type and configure it to generate Terraform code.
      </Paragraph>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="Select Resource Type">
            <Select
              style={{ width: '100%' }}
              placeholder="Choose a resource type"
              onChange={handleResourceTypeChange}
              value={selectedType}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={resourceTypes.map(r => ({
                value: r.type,
                label: r.displayName
              }))}
            />
          </Card>

          {schema && (
            <Card title="Configuration" style={{ marginTop: 16 }}>
              <DynamicForm
                schema={schema.properties}
                values={configuration}
                onChange={handleConfigurationChange}
              />
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleGenerate}
                loading={generating}
                block
                style={{ marginTop: 16 }}
              >
                Generate Terraform
              </Button>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="Generated Code"
            extra={
              Object.keys(generatedCode).length > 0 && (
                <>
                  <Button icon={<CopyOutlined />} onClick={handleCopy} style={{ marginRight: 8 }}>
                    Copy
                  </Button>
                  <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                    Download
                  </Button>
                </>
              )
            }
          >
            {Object.keys(generatedCode).length > 0 ? (
              <Tabs
                items={Object.entries(generatedCode).map(([filename, content]) => ({
                  key: filename,
                  label: filename,
                  children: (
                    <TextArea
                      value={content}
                      rows={20}
                      readOnly
                      style={{ fontFamily: 'monospace', fontSize: 13 }}
                    />
                  )
                }))}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <Paragraph>Select a resource type and configure it to generate Terraform code</Paragraph>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ResourceDesigner;
