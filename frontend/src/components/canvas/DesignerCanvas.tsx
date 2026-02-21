import { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  ReactFlowProvider,
  ReactFlowInstance,
  Panel,
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

const nodeTypes = {
  resource: ResourceNode,
};

interface DesignerCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onNodeSelect?: (node: Node | null) => void;
}

const DesignerCanvasInner = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
}: DesignerCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Sync external initialNodes/initialEdges changes
  useEffect(() => {
    if (initialNodes.length > 0) {
      setNodes(initialNodes);
    }
  }, [initialNodes, setNodes]);

  useEffect(() => {
    if (initialEdges.length > 0) {
      setEdges(initialEdges);
    }
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      if (onEdgesChange) {
        onEdgesChange(addEdge(params, edges));
      }
    },
    [edges, onEdgesChange, setEdges]
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
    (changes: Parameters<typeof onNodesChangeInternal>[0]) => {
      onNodesChangeInternal(changes);
      if (onNodesChange) {
        onNodesChange(nodes);
      }
    },
    [nodes, onNodesChange, onNodesChangeInternal]
  );

  const onEdgesChangeHandler = useCallback(
    (changes: Parameters<typeof onEdgesChangeInternal>[0]) => {
      onEdgesChangeInternal(changes);
      if (onEdgesChange) {
        onEdgesChange(edges);
      }
    },
    [edges, onEdgesChange, onEdgesChangeInternal]
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

      // Check if the dropped element is valid
      if (!type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Generate a unique name for the resource
      const resourceCount = nodes.length + 1;
      const resourceName = `${type.replace('azurerm_', '').replace(/_/g, '-')}-${resourceCount}`;

      // Default configurations for each resource type
      const defaultConfigs: Record<string, Record<string, unknown>> = {
        'azurerm_resource_group': {
          name: `rg-${resourceCount}`,
          location: 'eastus',
        },
        'azurerm_virtual_network': {
          name: `vnet-${resourceCount}`,
          resource_group_name: '<resource_group_name>',
          location: 'eastus',
          address_space: ['10.0.0.0/16'],
        },
        'azurerm_subnet': {
          name: `snet-${resourceCount}`,
          resource_group_name: '<resource_group_name>',
          virtual_network_name: '<virtual_network_name>',
          address_prefixes: ['10.0.1.0/24'],
        },
        'azurerm_storage_account': {
          name: `st${resourceCount}`,
          resource_group_name: '<resource_group_name>',
          location: 'eastus',
          account_tier: 'Standard',
          account_replication_type: 'LRS',
        },
        'azurerm_network_security_group': {
          name: `nsg-${resourceCount}`,
          resource_group_name: '<resource_group_name>',
          location: 'eastus',
        },
        'azurerm_public_ip': {
          name: `pip-${resourceCount}`,
          resource_group_name: '<resource_group_name>',
          location: 'eastus',
          allocation_method: 'Static',
          sku: 'Standard',
        },
        'azurerm_network_interface': {
          name: `nic-${resourceCount}`,
          resource_group_name: '<resource_group_name>',
          location: 'eastus',
          ip_configuration_name: 'ipconfig',
          subnet_id: '<subnet_id>',
        },
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'resource',
        position,
        data: {
          label: label || type,
          type,
          category,
          icon,
          configuration: defaultConfigs[type] || { name: resourceName },
        },
      };

      setNodes((nds) => nds.concat(newNode));
      if (onNodesChange) {
        onNodesChange([...nodes, newNode]);
      }
      
      message.success(`Added ${label} to canvas`);
    },
    [reactFlowInstance, nodes, onNodesChange, setNodes]
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
    const selectedNodes = nodes.filter((node) => node.selected);
    const selectedEdges = edges.filter((edge) => edge.selected);
    
    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      message.info('No elements selected');
      return;
    }

    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
    message.success(`Deleted ${selectedNodes.length} node(s) and ${selectedEdges.length} edge(s)`);
  }, [nodes, edges, setNodes, setEdges]);

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

const DesignerCanvas = (props: DesignerCanvasProps) => {
  return (
    <ReactFlowProvider>
      <DesignerCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default DesignerCanvas;
