import { memo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { Tag, Typography } from 'antd';
import {
  AppstoreOutlined,
  GlobalOutlined,
  WifiOutlined,
  ConsoleSqlOutlined,
  CodeOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export interface GroupNodeData {
  label: string;
  type: string;
  category: string;
  icon: string;
  configuration?: Record<string, unknown>;
}

const iconMap: Record<string, React.ReactNode> = {
  'resource-group': <AppstoreOutlined />,
  'virtual-network': <GlobalOutlined />,
  subnet: <WifiOutlined />,
  'sql-server': <ConsoleSqlOutlined />,
  'service-plan': <CodeOutlined />,
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
  const icon = iconMap[data.icon] || <AppstoreOutlined />;
  const color = categoryColors[data.category] || '#666';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 8,
        border: `2px ${selected ? 'solid' : 'dashed'} ${selected ? '#0078d4' : color}`,
        background: `${color}06`,
        position: 'relative',
      }}
    >
      <NodeResizer
        color={color}
        isVisible={selected}
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
          borderBottom: `1px solid ${color}30`,
          borderRadius: '6px 6px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
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
        <Text type="secondary" style={{ fontSize: 10, marginLeft: 'auto' }}>
          {data.type.replace('azurerm_', '').replace(/_/g, ' ')}
        </Text>
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
