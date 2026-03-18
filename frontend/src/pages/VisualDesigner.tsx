import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Drawer, Button, Space, message, Typography, Divider, Spin, Breadcrumb } from 'antd';
import { SaveOutlined, CodeOutlined, HomeOutlined, FolderOutlined, ShareAltOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Node, Edge } from '@xyflow/react';
import { DesignerCanvas, ResourcePalette, ResourceTree, isContainerType, CONTAINER_SIZES } from '../components/canvas';
import DynamicForm from '../components/forms/DynamicForm';
import { generateMermaid } from '../utils/mermaid-export';
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

interface ProjectResource {
  id: string;
  type: string;
  name: string;
  configuration: Record<string, unknown>;
  dependencies?: Record<string, unknown> | null;
}

interface Project {
  id: string;
  name: string;
  description: string;
  resources: ProjectResource[];
}

// Resource type to icon/color mapping
const resourceTypeConfig: Record<string, { color: string; icon: string; category: string }> = {
  'azurerm_resource_group': { color: '#0078d4', icon: 'resource-group', category: 'core' },
  'azurerm_virtual_network': { color: '#00bcf2', icon: 'virtual-network', category: 'networking' },
  'azurerm_subnet': { color: '#00bcf2', icon: 'subnet', category: 'networking' },
  'azurerm_storage_account': { color: '#ffb900', icon: 'storage-account', category: 'storage' },
  'azurerm_windows_virtual_machine': { color: '#f25022', icon: 'virtual-machine', category: 'compute' },
  'azurerm_network_security_group': { color: '#e81123', icon: 'nsg', category: 'networking' },
  'azurerm_public_ip': { color: '#00bcf2', icon: 'public-ip', category: 'networking' },
  'azurerm_network_interface': { color: '#00bcf2', icon: 'nic', category: 'networking' },
  'azurerm_service_plan': { color: '#f25022', icon: 'service-plan', category: 'compute' },
  'azurerm_linux_web_app': { color: '#f25022', icon: 'web-app', category: 'compute' },
  'azurerm_mssql_server': { color: '#ffb900', icon: 'sql-server', category: 'database' },
  'azurerm_mssql_database': { color: '#ffb900', icon: 'sql-database', category: 'database' },
  'azurerm_application_insights': { color: '#68217a', icon: 'app-insights', category: 'monitoring' },
  'azurerm_log_analytics_workspace': { color: '#68217a', icon: 'log-analytics', category: 'monitoring' },
  'azurerm_key_vault': { color: '#e81123', icon: 'key-vault', category: 'security' },
  'azurerm_container_registry': { color: '#0078d4', icon: 'container-registry', category: 'container' },
};

const VisualDesigner = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedResourceSchema, setSelectedResourceSchema] = useState<AzureResourceSchema | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [codeDrawerOpen, setCodeDrawerOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<{ mainTf: string; outputsTf: string; variablesTf: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);

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

  // Fetch project resources if projectId is provided
  useEffect(() => {
    if (projectId) {
      fetchProjectResources();
    }
  }, [projectId]);

  const fetchProjectResources = async () => {
    if (!projectId) return;

    setProjectLoading(true);
    try {
      const response = await axios.get(`/api/v1/projects/${projectId}`);
      if (response.data.success) {
        const projectData = response.data.data;
        setProject(projectData);

        if (projectData.resources && projectData.resources.length > 0) {
          // Build parent-child relationships from dependencies
          const parentMap = new Map<string, string>(); // childId -> parentId
          projectData.resources.forEach((resource: ProjectResource) => {
            if (resource.dependencies && typeof resource.dependencies === 'object') {
              const deps = resource.dependencies as Record<string, unknown>;
              if (deps.parentResourceId) {
                parentMap.set(resource.id, deps.parentResourceId as string);
              }
            }
          });

          // Convert resources to nodes
          const projectNodes: Node[] = projectData.resources.map((resource: ProjectResource, index: number) => {
            const config = resourceTypeConfig[resource.type] || { color: '#666', icon: 'default', category: 'core' };
            const isGroup = isContainerType(resource.type);
            const parentId = parentMap.get(resource.id);

            const node: Node = {
              id: resource.id,
              type: isGroup ? 'group' : 'resource',
              position: { x: 100 + (index % 4) * 280, y: 100 + Math.floor(index / 4) * 200 },
              data: {
                type: resource.type,
                label: resource.name,
                configuration: resource.configuration || {},
                icon: config.icon,
                color: config.color,
                category: config.category,
              },
            };

            // Set dimensions for group nodes
            if (isGroup) {
              const size = CONTAINER_SIZES[resource.type] || { width: 400, height: 300 };
              node.style = { width: size.width, height: size.height };
            }

            // Set parent-child relationship
            if (parentId) {
              node.parentId = parentId;
              node.extent = 'parent';
              node.expandParent = true;
              // Position inside parent
              node.position = { x: 30 + (index % 3) * 220, y: 60 + Math.floor(index / 3) * 180 };
            }

            return node;
          });

          // Sort: parents must come before children (React Flow requirement)
          projectNodes.sort((a, b) => {
            if (a.parentId && !b.parentId) return 1;
            if (!a.parentId && b.parentId) return -1;
            // If both have parents, sort by depth
            if (a.parentId && b.parentId) {
              const aIsParentOfB = b.parentId === a.id;
              const bIsParentOfA = a.parentId === b.id;
              if (aIsParentOfB) return -1;
              if (bIsParentOfA) return 1;
            }
            return 0;
          });

          setNodes(projectNodes);

          // Generate edges based on resource relationships
          generateEdges(projectData.resources);
        }
      }
    } catch (error) {
      message.error('Failed to load project resources');
    } finally {
      setProjectLoading(false);
    }
  };

  const generateEdges = (projectResources: ProjectResource[]) => {
    const newEdges: Edge[] = [];
    const addedEdgeIds = new Set<string>();

    const addEdgeFn = (sourceId: string, targetId: string, color: string) => {
      const edgeId = `${sourceId}-${targetId}`;
      if (!addedEdgeIds.has(edgeId)) {
        addedEdgeIds.add(edgeId);
        newEdges.push({
          id: edgeId,
          source: sourceId,
          target: targetId,
          animated: true,
          style: { stroke: color },
        });
      }
    };

    // Build resource lookup for reference resolution
    const resourcesByType = new Map<string, ProjectResource[]>();
    projectResources.forEach(r => {
      const list = resourcesByType.get(r.type) || [];
      list.push(r);
      resourcesByType.set(r.type, list);
    });

    // Detect relationships from configuration values that contain ${...} references
    projectResources.forEach((resource) => {
      const config = resource.configuration;

      // Check for resource_group_name reference
      if (config.resource_group_name) {
        const rgs = resourcesByType.get('azurerm_resource_group') || [];
        const rgResource = rgs.find(
          r => r.name === config.resource_group_name ||
               r.configuration.name === config.resource_group_name ||
               (typeof config.resource_group_name === 'string' &&
                config.resource_group_name.includes(r.id))
        );
        if (rgResource) {
          addEdgeFn(rgResource.id, resource.id, '#0078d4');
        }
      }

      // Check for virtual_network_name reference
      if (config.virtual_network_name) {
        const vnets = resourcesByType.get('azurerm_virtual_network') || [];
        const vnetResource = vnets.find(
          r => r.name === config.virtual_network_name ||
               r.configuration.name === config.virtual_network_name ||
               (typeof config.virtual_network_name === 'string' &&
                config.virtual_network_name.includes(r.id))
        );
        if (vnetResource) {
          addEdgeFn(vnetResource.id, resource.id, '#00bcf2');
        }
      }

      // Check for subnet_id reference
      if (config.subnet_id) {
        const subnets = resourcesByType.get('azurerm_subnet') || [];
        const subnetResource = subnets.find(
          r => r.id === config.subnet_id ||
               r.configuration.name === config.subnet_id ||
               (typeof config.subnet_id === 'string' &&
                config.subnet_id.includes(r.id))
        );
        if (subnetResource) {
          addEdgeFn(subnetResource.id, resource.id, '#00bcf2');
        }
      }

      // Check for service_plan_id reference (Web App -> Service Plan)
      if (config.service_plan_id && typeof config.service_plan_id === 'string') {
        const plans = resourcesByType.get('azurerm_service_plan') || [];
        const planResource = plans.find(
          r => config.service_plan_id === r.id ||
               (typeof config.service_plan_id === 'string' &&
                (config.service_plan_id as string).includes(r.id))
        ) || plans[0];
        if (planResource) {
          addEdgeFn(planResource.id, resource.id, '#f25022');
        }
      }

      // Check for server_id reference (SQL Database -> SQL Server)
      if (config.server_id && typeof config.server_id === 'string') {
        const servers = resourcesByType.get('azurerm_mssql_server') || [];
        const serverResource = servers.find(
          r => config.server_id === r.id ||
               (typeof config.server_id === 'string' &&
                (config.server_id as string).includes(r.id))
        ) || servers[0];
        if (serverResource) {
          addEdgeFn(serverResource.id, resource.id, '#ffb900');
        }
      }
    });

    setEdges(newEdges);
  };

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

  // Handle form submission - saves config and parent-child relationship
  const handleFormSubmit = useCallback(async () => {
    if (selectedNode && selectedResourceSchema && projectId) {
      try {
        // Build dependencies object with parentResourceId
        const dependencies: Record<string, unknown> = {};
        if (selectedNode.parentId) {
          dependencies.parentResourceId = selectedNode.parentId;
        }

        await axios.put(`/api/v1/projects/${projectId}/resources/${selectedNode.id}`, {
          configuration: formValues,
          name: (formValues.name as string) || selectedNode.data.label,
          dependencies,
        });

        // Update the node's configuration locally
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
      } catch (error) {
        message.error('Failed to save resource configuration');
      }
    } else if (selectedNode && selectedResourceSchema) {
      // Just update locally if no project
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
  }, [selectedNode, selectedResourceSchema, nodes, formValues, projectId]);

  // Generate Terraform code
  const handleGenerateCode = useCallback(async () => {
    if (nodes.length === 0) {
      message.warning('Add resources to the canvas first');
      return;
    }

    setLoading(true);
    try {
      // Before generating, persist all parent-child relationships
      if (projectId) {
        for (const node of nodes) {
          if (node.parentId) {
            try {
              await axios.put(`/api/v1/projects/${projectId}/resources/${node.id}`, {
                dependencies: { parentResourceId: node.parentId },
              });
            } catch {
              // Continue even if individual save fails
            }
          }
        }

        // Use project-specific generation endpoint
        const response = await axios.post(`/api/v1/projects/${projectId}/generate`);
        if (response.data.success) {
          const files = response.data.data.files;
          setGeneratedCode({
            mainTf: files['main.tf'] || '',
            outputsTf: files['outputs.tf'] || '',
            variablesTf: files['variables.tf'] || '',
          });
          setCodeDrawerOpen(true);
        }
      } else {
        // Generate code for each resource individually
        const resources = nodes.map((node) => ({
          type: node.data.type as string,
          name: node.id.replace(/[^a-zA-Z0-9_]/g, '_'),
          configuration: (node.data.configuration as Record<string, unknown>) || {},
        }));

        const codePromises = resources.map(async (resource) => {
          const response = await axios.post('/api/v1/resources/generate', {
            type: resource.type,
            name: resource.name,
            configuration: resource.configuration,
          });
          return response.data;
        });

        const results = await Promise.all(codePromises);

        const mainTfParts = results.map((r: { data: { files: Record<string, string> } }) => r.data.files['main.tf']);
        const outputsTfParts = results.map((r: { data: { files: Record<string, string> } }) => r.data.files['outputs.tf']);

        setGeneratedCode({
          mainTf: mainTfParts.join('\n\n'),
          outputsTf: outputsTfParts.join('\n\n'),
          variablesTf: '',
        });
        setCodeDrawerOpen(true);
      }
    } catch (error) {
      message.error('Failed to generate Terraform code');
    } finally {
      setLoading(false);
    }
  }, [nodes, projectId]);

  // Export as Mermaid diagram
  const handleExportMermaid = useCallback(() => {
    if (nodes.length === 0) {
      message.warning('Add resources to the canvas first');
      return;
    }
    const mermaid = generateMermaid(nodes, edges);
    navigator.clipboard.writeText(mermaid);
    message.success('Mermaid diagram copied to clipboard');
  }, [nodes, edges]);

  // Save design
  const handleSave = useCallback(() => {
    const design = {
      nodes,
      edges,
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
  }, [nodes, edges]);

  return (
    <Layout style={{ height: 'calc(100vh - 64px)' }}>
      <Sider width={280} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', overflow: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: '0 0 auto', maxHeight: '50%', overflow: 'auto' }}>
            <Spin spinning={loading}>
              <ResourcePalette
                resources={resources}
                onResourceSelect={handleResourceSelect}
              />
            </Spin>
          </div>
          {nodes.length > 0 && (
            <div style={{ flex: 1, overflow: 'auto', borderTop: '1px solid #f0f0f0' }}>
              <ResourceTree
                nodes={nodes}
                onNodeSelect={(nodeId) => {
                  const node = nodes.find(n => n.id === nodeId);
                  if (node) handleNodeSelect(node);
                }}
                selectedNodeId={selectedNode?.id}
              />
            </div>
          )}
        </div>
      </Sider>

      <Content style={{ position: 'relative' }}>
        {/* Header with breadcrumb */}
        {project && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '8px 16px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            zIndex: 5,
          }}>
            <Breadcrumb
              items={[
                { href: '/', title: <><HomeOutlined /></> },
                { href: '/projects', title: <><FolderOutlined /> Projects</> },
                { title: project.name },
              ]}
            />
          </div>
        )}

        <div style={{ position: 'absolute', top: project ? 48 : 16, left: 16, zIndex: 10 }}>
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
            <Button
              icon={<ShareAltOutlined />}
              onClick={handleExportMermaid}
            >
              Export Mermaid
            </Button>
          </Space>
        </div>

        <div style={{ position: 'absolute', top: project ? 48 : 0, left: 0, right: 0, bottom: 0 }}>
          {projectLoading && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
              <Spin tip="Loading project resources..." />
            </div>
          )}
          <DesignerCanvas
            initialNodes={nodes}
            initialEdges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            onNodeSelect={handleNodeSelect}
          />
        </div>
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

            {generatedCode.variablesTf && (
              <>
                <Divider />
                <Title level={5}>variables.tf</Title>
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
                  {generatedCode.variablesTf}
                </pre>
              </>
            )}

            {generatedCode.outputsTf && (
              <>
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
              </>
            )}

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
