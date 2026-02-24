import { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  Node,
  Edge,
  ReactFlowProvider,
  ReactFlowInstance,
  Panel,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button, Space, Tooltip, message } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';

import ResourceNode from './ResourceNode';
import GroupNode from './GroupNode';
import {
  isContainerType,
  CONTAINER_SIZES,
  findContainerAtPosition,
  applyAutoReferences,
} from './containment-rules';

const nodeTypes = {
  resource: ResourceNode,
  group: GroupNode,
};

interface DesignerCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onNodeSelect?: (node: Node | null) => void;
}

// Default configurations for each resource type
const defaultConfigs: Record<string, (count: number) => Record<string, unknown>> = {
  'azurerm_resource_group': (c) => ({
    name: `rg-${c}`,
    location: 'eastus',
  }),
  'azurerm_virtual_network': (c) => ({
    name: `vnet-${c}`,
    resource_group_name: '<resource_group_name>',
    location: 'eastus',
    address_space: ['10.0.0.0/16'],
  }),
  'azurerm_subnet': (c) => ({
    name: `snet-${c}`,
    resource_group_name: '<resource_group_name>',
    virtual_network_name: '<virtual_network_name>',
    address_prefixes: ['10.0.1.0/24'],
  }),
  'azurerm_storage_account': (c) => ({
    name: `st${c}`,
    resource_group_name: '<resource_group_name>',
    location: 'eastus',
    account_tier: 'Standard',
    account_replication_type: 'LRS',
  }),
  'azurerm_network_security_group': (c) => ({
    name: `nsg-${c}`,
    resource_group_name: '<resource_group_name>',
    location: 'eastus',
  }),
  'azurerm_public_ip': (c) => ({
    name: `pip-${c}`,
    resource_group_name: '<resource_group_name>',
    location: 'eastus',
    allocation_method: 'Static',
    sku: 'Standard',
  }),
  'azurerm_network_interface': (c) => ({
    name: `nic-${c}`,
    resource_group_name: '<resource_group_name>',
    location: 'eastus',
    ip_configuration_name: 'ipconfig',
    subnet_id: '<subnet_id>',
  }),
  'azurerm_service_plan': (c) => ({
    name: `asp-${c}`,
    resource_group_name: '<resource_group_name>',
    location: 'eastus',
    os_type: 'Linux',
    sku_name: 'B1',
  }),
  'azurerm_linux_web_app': (c) => ({
    name: `webapp-${c}`,
    resource_group_name: '<resource_group_name>',
    location: 'eastus',
    service_plan_id: '<service_plan_id>',
  }),
  'azurerm_mssql_server': (c) => ({
    name: `sqlserver-${c}`,
    resource_group_name: '<resource_group_name>',
    location: 'eastus',
    version: '12.0',
    administrator_login: 'sqladmin',
    administrator_login_password: '<password>',
  }),
  'azurerm_mssql_database': (c) => ({
    name: `sqldb-${c}`,
    server_id: '<mssql_server_id>',
    sku_name: 'S0',
  }),
  'azurerm_application_insights': (c) => ({
    name: `appi-${c}`,
    resource_group_name: '<resource_group_name>',
    location: 'eastus',
    application_type: 'web',
  }),
  'azurerm_log_analytics_workspace': (c) => ({
    name: `log-${c}`,
    resource_group_name: '<resource_group_name>',
    location: 'eastus',
    sku: 'PerGB2018',
    retention_in_days: 30,
  }),
};

const DesignerCanvasInner = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
}: DesignerCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Track previous props to detect external changes
  const prevInitialNodesRef = useRef<string>('');
  const prevInitialEdgesRef = useRef<string>('');
  // Track whether changes are internal (from user interaction)
  const isInternalChange = useRef(false);

  // Sync external initialNodes changes
  useEffect(() => {
    const newNodeIds = (initialNodes || []).map(n => n.id).sort().join(',');
    if (newNodeIds && newNodeIds !== prevInitialNodesRef.current && !isInternalChange.current) {
      prevInitialNodesRef.current = newNodeIds;
      setNodes(initialNodes || []);
    }
    isInternalChange.current = false;
  }, [initialNodes]);

  // Sync external initialEdges changes
  useEffect(() => {
    const newEdgeIds = (initialEdges || []).map(e => e.id).sort().join(',');
    if (newEdgeIds && newEdgeIds !== prevInitialEdgesRef.current && !isInternalChange.current) {
      prevInitialEdgesRef.current = newEdgeIds;
      setEdges(initialEdges || []);
    }
  }, [initialEdges]);

  // Fit view when reactFlowInstance is ready and nodes are loaded
  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 100);
    }
  }, [reactFlowInstance, nodes.length]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge(params, eds);
        if (onEdgesChange) {
          onEdgesChange(newEdges);
        }
        return newEdges;
      });
    },
    [onEdgesChange]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  const onNodesChangeHandler = useCallback(
    (changes: NodeChange[]) => {
      setNodes((currentNodes) => {
        const newNodes = applyNodeChanges(changes, currentNodes);
        if (onNodesChange) {
          isInternalChange.current = true;
          onNodesChange(newNodes);
        }
        return newNodes;
      });
    },
    [onNodesChange]
  );

  const onEdgesChangeHandler = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((currentEdges) => {
        const newEdges = applyEdgeChanges(changes, currentEdges);
        if (onEdgesChange) {
          onEdgesChange(newEdges);
        }
        return newEdges;
      });
    },
    [onEdgesChange]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('label');
      const category = event.dataTransfer.getData('category');
      const icon = event.dataTransfer.getData('icon');

      if (!type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setNodes((currentNodes) => {
        const resourceCount = currentNodes.length + 1;
        const resourceName = `${type.replace('azurerm_', '').replace(/_/g, '-')}-${resourceCount}`;

        const configFn = defaultConfigs[type];
        let configuration = configFn ? configFn(resourceCount) : { name: resourceName };

        const isGroup = isContainerType(type);
        const nodeId = `${type}-${Date.now()}`;

        // Check if dropped onto a container node
        const containerNode = findContainerAtPosition(currentNodes, position, type);

        const newNode: Node = {
          id: nodeId,
          type: isGroup ? 'group' : 'resource',
          position: containerNode
            ? {
                // Convert to parent-relative coordinates
                x: position.x - getAbsoluteNodePosition(containerNode, currentNodes).x,
                y: position.y - getAbsoluteNodePosition(containerNode, currentNodes).y,
              }
            : position,
          data: {
            label: label || type,
            type,
            category,
            icon,
            configuration,
          },
        };

        // If this is a container, set explicit dimensions
        if (isGroup) {
          const size = CONTAINER_SIZES[type] || { width: 400, height: 300 };
          newNode.style = { width: size.width, height: size.height };
        }

        // If dropped into a container, set parent-child relationship
        if (containerNode) {
          newNode.parentId = containerNode.id;
          newNode.extent = 'parent';
          newNode.expandParent = true;

          // Auto-wire Terraform references based on containment
          configuration = applyAutoReferences(
            configuration,
            type,
            containerNode,
            currentNodes
          );
          newNode.data = { ...newNode.data, configuration };

          // Also inherit location from parent if applicable
          const parentConfig = (containerNode.data as { configuration?: Record<string, unknown> }).configuration;
          if (parentConfig?.location && configuration.location !== undefined) {
            configuration.location = parentConfig.location;
          }
        }

        const updatedNodes = [...currentNodes, newNode];

        if (onNodesChange) {
          isInternalChange.current = true;
          prevInitialNodesRef.current = updatedNodes.map(n => n.id).sort().join(',');
          onNodesChange(updatedNodes);
        }

        return updatedNodes;
      });

      const parentMsg = '';
      message.success(`Added ${label || type} to canvas${parentMsg}`);
    },
    [reactFlowInstance, onNodesChange]
  );

  const handleZoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut();
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView();
  }, [reactFlowInstance]);

  const handleDeleteSelected = useCallback(() => {
    setNodes((currentNodes) => {
      setEdges((currentEdges) => {
        const selectedNodes = currentNodes.filter((node) => node.selected);
        const selectedEdges = currentEdges.filter((edge) => edge.selected);

        if (selectedNodes.length === 0 && selectedEdges.length === 0) {
          message.info('No elements selected');
          return currentEdges;
        }

        // Collect IDs of selected nodes and their children (cascade delete)
        const deletedIds = new Set<string>();
        const collectChildren = (parentId: string) => {
          deletedIds.add(parentId);
          currentNodes.forEach(n => {
            if (n.parentId === parentId && !deletedIds.has(n.id)) {
              collectChildren(n.id);
            }
          });
        };
        selectedNodes.forEach(n => collectChildren(n.id));

        const newEdges = currentEdges.filter(
          (edge) => !edge.selected && !deletedIds.has(edge.source) && !deletedIds.has(edge.target)
        );
        if (onEdgesChange) {
          onEdgesChange(newEdges);
        }
        message.success(`Deleted ${deletedIds.size} node(s) and ${selectedEdges.length} edge(s)`);
        return newEdges;
      });

      // Remove selected nodes and their children
      const deletedIds = new Set<string>();
      const collectChildren = (parentId: string) => {
        deletedIds.add(parentId);
        currentNodes.forEach(n => {
          if (n.parentId === parentId && !deletedIds.has(n.id)) {
            collectChildren(n.id);
          }
        });
      };
      currentNodes.filter(n => n.selected).forEach(n => collectChildren(n.id));

      const newNodes = currentNodes.filter((node) => !deletedIds.has(node.id));
      if (onNodesChange) {
        isInternalChange.current = true;
        onNodesChange(newNodes);
      }
      return newNodes;
    });
  }, [onNodesChange, onEdgesChange]);

  const handleExport = useCallback(() => {
    if (!reactFlowInstance) return;

    const flow = reactFlowInstance.toObject();
    const json = JSON.stringify(flow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'infrastructure-design.json';
    link.click();
    URL.revokeObjectURL(url);

    message.success('Design exported successfully');
  }, [reactFlowInstance]);

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#0078d4', strokeWidth: 2 },
        }}
      >
        <Background gap={15} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as { category?: string };
            const categoryColors: Record<string, string> = {
              core: '#0078d4',
              networking: '#00bcf2',
              storage: '#0078d4',
              compute: '#f25022',
              database: '#ffb900',
              monitoring: '#68217a',
              security: '#e81123',
            };
            return categoryColors[data?.category || ''] || '#666';
          }}
          style={{ background: '#f5f5f5' }}
        />

        <Panel position="top-right">
          <Space>
            <Tooltip title="Zoom In">
              <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
            </Tooltip>
            <Tooltip title="Zoom Out">
              <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
            </Tooltip>
            <Tooltip title="Fit View">
              <Button icon={<FullscreenOutlined />} onClick={handleFitView} />
            </Tooltip>
            <Tooltip title="Delete Selected">
              <Button icon={<DeleteOutlined />} danger onClick={handleDeleteSelected} />
            </Tooltip>
            <Tooltip title="Export Design">
              <Button icon={<DownloadOutlined />} type="primary" onClick={handleExport} />
            </Tooltip>
          </Space>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Helper: get absolute position of a node accounting for parent chain
function getAbsoluteNodePosition(node: Node, allNodes: Node[]): { x: number; y: number } {
  let x = node.position.x;
  let y = node.position.y;
  let current = node;

  while (current.parentId) {
    const parent = allNodes.find(n => n.id === current.parentId);
    if (!parent) break;
    x += parent.position.x;
    y += parent.position.y;
    current = parent;
  }

  return { x, y };
}

const DesignerCanvas = (props: DesignerCanvasProps) => {
  return (
    <ReactFlowProvider>
      <DesignerCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default DesignerCanvas;
