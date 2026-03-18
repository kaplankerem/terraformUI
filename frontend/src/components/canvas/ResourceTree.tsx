import React, { useMemo } from 'react';
import { Tree, Typography, Tag, Empty } from 'antd';
import type { Node } from '@xyflow/react';
import type { DataNode } from 'antd/es/tree';
import {
  AppstoreOutlined, CloudOutlined, CloudServerOutlined, DatabaseOutlined,
  GlobalOutlined, SafetyOutlined, WifiOutlined, CodeOutlined,
  FundOutlined, BarChartOutlined, ConsoleSqlOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface ResourceTreeProps {
  nodes: Node[];
  onNodeSelect: (nodeId: string) => void;
  selectedNodeId?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  'resource-group': <AppstoreOutlined />,
  'virtual-network': <GlobalOutlined />,
  subnet: <WifiOutlined />,
  'storage-account': <DatabaseOutlined />,
  nsg: <SafetyOutlined />,
  'public-ip': <CloudOutlined />,
  nic: <WifiOutlined />,
  'virtual-machine': <CloudServerOutlined />,
  'service-plan': <CodeOutlined />,
  'web-app': <CloudServerOutlined />,
  'sql-server': <ConsoleSqlOutlined />,
  'sql-database': <DatabaseOutlined />,
  'app-insights': <FundOutlined />,
  'log-analytics': <BarChartOutlined />,
  'key-vault': <SafetyOutlined />,
  'container-registry': <CloudOutlined />,
};

const categoryColors: Record<string, string> = {
  core: '#0078d4',
  networking: '#00bcf2',
  storage: '#0078d4',
  compute: '#f25022',
  database: '#ffb900',
  monitoring: '#68217a',
  security: '#e81123',
  container: '#0078d4',
};

const buildTree = (nodes: Node[]): DataNode[] => {
  const rootNodes = nodes.filter(n => !n.parentId && !n.hidden);

  const toTreeNode = (node: Node): DataNode => {
    const data = node.data as { label: string; type: string; category: string; icon: string };
    const children = nodes.filter(n => n.parentId === node.id && !n.hidden);
    const icon = iconMap[data.icon] || <AppstoreOutlined />;
    const color = categoryColors[data.category] || '#666';

    return {
      key: node.id,
      title: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color, fontSize: 14 }}>{icon}</span>
          <span>{data.label}</span>
          <Tag color={color} style={{ margin: 0, fontSize: 9, lineHeight: '16px' }}>{data.category}</Tag>
        </span>
      ),
      children: children.length > 0 ? children.map(toTreeNode) : undefined,
    };
  };

  return rootNodes.map(toTreeNode);
};

const ResourceTree: React.FC<ResourceTreeProps> = ({ nodes, onNodeSelect, selectedNodeId }) => {
  const treeData = useMemo(() => buildTree(nodes), [nodes]);
  const visibleCount = nodes.filter(n => !n.hidden).length;

  if (visibleCount === 0) {
    return (
      <div style={{ padding: 16 }}>
        <Empty description="No resources on canvas" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ padding: '0 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong style={{ fontSize: 13 }}>Resource Tree</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>{visibleCount} resources</Text>
      </div>
      <Tree
        treeData={treeData}
        defaultExpandAll
        selectedKeys={selectedNodeId ? [selectedNodeId] : []}
        onSelect={(keys) => {
          if (keys.length > 0) {
            onNodeSelect(keys[0] as string);
          }
        }}
        style={{ fontSize: 12 }}
      />
    </div>
  );
};

export default ResourceTree;
