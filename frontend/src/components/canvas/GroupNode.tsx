import { memo, useCallback } from 'react';
import { Handle, Position, NodeResizer, useNodeId } from '@xyflow/react';
import { Tag, Typography, Button, Badge } from 'antd';
import {
  AppstoreOutlined,
  GlobalOutlined,
  WifiOutlined,
  ConsoleSqlOutlined,
  CodeOutlined,
  MinusOutlined,
  PlusOutlined,
  SafetyOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export interface GroupNodeData {
  label: string;
  type: string;
  category: string;
  icon: string;
  configuration?: Record<string, unknown>;
  collapsed?: boolean;
  childCount?: number;
}

const iconMap: Record<string, React.ReactNode> = {
  'resource-group': <AppstoreOutlined />,
  'virtual-network': <GlobalOutlined />,
  subnet: <WifiOutlined />,
  'sql-server': <ConsoleSqlOutlined />,
  'service-plan': <CodeOutlined />,
  'key-vault': <SafetyOutlined />,
};

const categoryColors: Record<string, string> = {
  core: '#0078d4',
  networking: '#00bcf2',
  storage: '#0078d4',
  compute: '#f25022',
  database: '#ffb900',
  monitoring: '#68217a',
  security: '#e81123',
};

interface GroupNodeProps {
  data: GroupNodeData;
  selected?: boolean;
}

const GroupNode = memo(({ data, selected }: GroupNodeProps) => {
  const nodeId = useNodeId();
  const icon = iconMap[data.icon] || <AppstoreOutlined />;
  const color = categoryColors[data.category] || '#666';
  const isCollapsed = !!data.collapsed;

  const handleToggleCollapse = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      window.dispatchEvent(
        new CustomEvent('toggle-collapse', { detail: { nodeId } })
      );
    },
    [nodeId]
  );

  return (
    <div
      style={{
        width: '100%',
        height: isCollapsed ? 46 : '100%',
        borderRadius: 8,
        border: `2px ${selected ? 'solid' : isCollapsed ? 'solid' : 'dashed'} ${selected ? '#0078d4' : color}`,
        background: `${color}06`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <NodeResizer
        color={color}
        isVisible={selected && !isCollapsed}
        minWidth={250}
        minHeight={180}
      />

      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: color,
          width: 10,
          height: 10,
          border: '2px solid #fff',
        }}
      />

      {/* Header bar */}
      <div
        style={{
          background: `${color}18`,
          padding: '6px 12px',
          borderBottom: isCollapsed ? 'none' : `1px solid ${color}30`,
          borderRadius: isCollapsed ? 8 : '6px 6px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: 46,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            background: `${color}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            fontSize: 14,
          }}
        >
          {icon}
        </div>
        <Text strong style={{ fontSize: 13, color: '#333' }}>
          {data.label}
        </Text>
        <Tag
          color={color}
          style={{ margin: 0, fontSize: 10, textTransform: 'capitalize' }}
        >
          {data.category}
        </Tag>
        {isCollapsed && data.childCount != null && data.childCount > 0 && (
          <Badge
            count={`${data.childCount} resource${data.childCount !== 1 ? 's' : ''}`}
            style={{
              backgroundColor: `${color}20`,
              color: color,
              fontSize: 10,
              fontWeight: 600,
              boxShadow: 'none',
            }}
          />
        )}
        <Text type="secondary" style={{ fontSize: 10, marginLeft: 'auto' }}>
          {data.type.replace('azurerm_', '').replace(/_/g, ' ')}
        </Text>
        <Button
          type="text"
          size="small"
          icon={isCollapsed ? <PlusOutlined /> : <MinusOutlined />}
          onClick={handleToggleCollapse}
          style={{
            width: 22,
            height: 22,
            minWidth: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            fontSize: 12,
          }}
        />
      </div>

      {/* Body: React Flow renders child nodes here */}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: color,
          width: 10,
          height: 10,
          border: '2px solid #fff',
        }}
      />
    </div>
  );
});

GroupNode.displayName = 'GroupNode';

export default GroupNode;
