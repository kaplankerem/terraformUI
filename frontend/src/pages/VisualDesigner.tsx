import { useState, useEffect, useCallback } from 'react';
import { Layout, Drawer, Button, Space, message, Typography, Divider, Spin } from 'antd';
import { SaveOutlined, CodeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Node } from '@xyflow/react';
import { DesignerCanvas, ResourcePalette } from '../components/canvas';
import DynamicForm from '../components/forms/DynamicForm';
import type { AzureResourceSchema, PropertyDefinition } from '@ianc/shared';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

interface ResourceType {
  type: string;
  displayName: string;
  category: string;
  icon: string;
  description: string;
}

const VisualDesigner = () => {
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedResourceSchema, setSelectedResourceSchema] = useState<AzureResourceSchema | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [codeDrawerOpen, setCodeDrawerOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<{ mainTf: string; outputsTf: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch resource types
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/v1/resources/types');
        if (response.data.success) {
          setResources(response.data.data);
        }
      } catch (error) {
        message.error('Failed to load resource types');
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Handle node selection
  const handleNodeSelect = useCallback(async (node: Node | null) => {
    setSelectedNode(node);
    if (node) {
      setSchemaLoading(true);
      try {
        const resourceType = node.data.type as string;
        const response = await axios.get(`/api/v1/resources/types/${resourceType}/schema`);
        if (response.data.success) {
          const schema = response.data.data as AzureResourceSchema;
          setSelectedResourceSchema(schema);
          
          // Set initial form values from node configuration or defaults
          const config = (node.data.configuration as Record<string, unknown>) || {};
          const defaults: Record<string, unknown> = {};
          schema.properties.forEach((prop: PropertyDefinition) => {
            if (config[prop.name] !== undefined) {
              defaults[prop.name] = config[prop.name];
            } else if (prop.defaultValue !== undefined) {
              defaults[prop.name] = prop.defaultValue;
            }
          });
          setFormValues(defaults);
          setDrawerOpen(true);
        }
      } catch (error) {
        message.error('Failed to load resource schema');
      } finally {
        setSchemaLoading(false);
      }
    } else {
      setSelectedResourceSchema(null);
      setFormValues({});
      setFormErrors({});
      setDrawerOpen(false);
    }
  }, []);

  // Handle resource selection from palette
  const handleResourceSelect = useCallback((resource: ResourceType) => {
    message.info(`Drag ${resource.displayName} to the canvas to add it`);
  }, []);

  // Handle form values change
  const handleFormChange = useCallback((values: Record<string, unknown>) => {
    setFormValues(values);
  }, []);

  // Handle form submission
  const handleFormSubmit = useCallback(() => {
    if (selectedNode && selectedResourceSchema) {
      // Update the node's configuration
      const updatedNodes = nodes.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              configuration: formValues,
              label: (formValues.name as string) || node.data.label,
            },
          };
        }
        return node;
      });
      setNodes(updatedNodes);
      message.success('Resource configuration saved');
      setDrawerOpen(false);
    }
  }, [selectedNode, selectedResourceSchema, nodes, formValues]);

  // Generate Terraform code
  const handleGenerateCode = useCallback(async () => {
    if (nodes.length === 0) {
      message.warning('Add resources to the canvas first');
      return;
    }

    setLoading(true);
    try {
      // Generate code for each resource
      const resources = nodes.map((node) => ({
        type: node.data.type as string,
        name: node.id.replace(/[^a-zA-Z0-9_]/g, '_'),
        configuration: (node.data.configuration as Record<string, unknown>) || {},
      }));

      // For now, generate code for each resource individually
      const codePromises = resources.map(async (resource) => {
        const response = await axios.post('/api/v1/resources/generate', {
          type: resource.type,
          name: resource.name,
          configuration: resource.configuration,
        });
        return response.data;
      });

      const results = await Promise.all(codePromises);
      
      // Combine all main.tf and outputs.tf
      const mainTfParts = results.map((r: { data: { files: Record<string, string> } }) => r.data.files['main.tf']);
      const outputsTfParts = results.map((r: { data: { files: Record<string, string> } }) => r.data.files['outputs.tf']);

      setGeneratedCode({
        mainTf: mainTfParts.join('\n\n'),
        outputsTf: outputsTfParts.join('\n\n'),
      });
      setCodeDrawerOpen(true);
    } catch (error) {
      message.error('Failed to generate Terraform code');
    } finally {
      setLoading(false);
    }
  }, [nodes]);

  // Save design
  const handleSave = useCallback(() => {
    const design = {
      nodes,
      timestamp: new Date().toISOString(),
    };
    const json = JSON.stringify(design, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'infrastructure-design.json';
    link.click();
    URL.revokeObjectURL(url);
    message.success('Design saved');
  }, [nodes]);

  return (
    <Layout style={{ height: 'calc(100vh - 64px)' }}>
      <Sider width={280} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <Spin spinning={loading}>
          <ResourcePalette
            resources={resources}
            onResourceSelect={handleResourceSelect}
          />
        </Spin>
      </Sider>
      
      <Content style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
          <Space>
            <Button icon={<SaveOutlined />} onClick={handleSave}>
              Save
            </Button>
            <Button
              type="primary"
              icon={<CodeOutlined />}
              onClick={handleGenerateCode}
              loading={loading}
            >
              Generate Terraform
            </Button>
          </Space>
        </div>
        
        <DesignerCanvas
          initialNodes={nodes}
          onNodesChange={setNodes}
          onNodeSelect={handleNodeSelect}
        />
      </Content>

      {/* Configuration Drawer */}
      <Drawer
        title={
          <Space>
            <span>Configure Resource</span>
            {selectedNode && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                ({String(selectedNode.data.type)})
              </Text>
            )}
          </Space>
        }
        placement="right"
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Button type="primary" onClick={handleFormSubmit}>
            Save Configuration
          </Button>
        }
        styles={{
          body: { padding: 0 },
        }}
      >
        <Spin spinning={schemaLoading}>
          {selectedResourceSchema && (
            <div style={{ padding: 16 }}>
              <DynamicForm
                schema={selectedResourceSchema.properties}
                values={formValues}
                onChange={handleFormChange}
                errors={formErrors}
              />
            </div>
          )}
        </Spin>
      </Drawer>

      {/* Code Preview Drawer */}
      <Drawer
        title="Generated Terraform Code"
        placement="right"
        width={600}
        open={codeDrawerOpen}
        onClose={() => setCodeDrawerOpen(false)}
      >
        {generatedCode && (
          <div>
            <Title level={5}>main.tf</Title>
            <pre
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: 16,
                borderRadius: 4,
                overflow: 'auto',
                maxHeight: 400,
              }}
            >
              {generatedCode.mainTf}
            </pre>
            
            <Divider />
            
            <Title level={5}>outputs.tf</Title>
            <pre
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: 16,
                borderRadius: 4,
                overflow: 'auto',
                maxHeight: 200,
              }}
            >
              {generatedCode.outputsTf}
            </pre>
            
            <Divider />
            
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode.mainTf);
                  message.success('Code copied to clipboard');
                }}
              >
                Copy main.tf
              </Button>
              <Button
                onClick={() => {
                  const blob = new Blob([generatedCode.mainTf], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'main.tf';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download main.tf
              </Button>
            </Space>
          </div>
        )}
      </Drawer>
    </Layout>
  );
};

export default VisualDesigner;
