import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, Tag, Space, Typography } from 'antd';
import {
  AppstoreOutlined,
  CloudOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  SafetyOutlined,
  WifiOutlined,
  CodeOutlined,
  FundOutlined,
  BarChartOutlined,
  ConsoleSqlOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export interface ResourceNodeData {
  label: string;
  type: string;
  category: string;
  icon: string;
  configuration?: Record<string, unknown>;
  selected?: boolean;
}

// Icon mapping
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
  'default': <AppstoreOutlined />,
};

// Category color mapping
const categoryColors: Record<string, string> = {
  core: '#0078d4',
  networking: '#00bcf2',
  storage: '#0078d4',
  compute: '#f25022',
  database: '#ffb900',
  monitoring: '#68217a',
  security: '#e81123',
};

interface ResourceNodeProps {
  data: ResourceNodeData;
  selected?: boolean;
}

const ResourceNode = memo(({ data, selected }: ResourceNodeProps) => {
  const icon = iconMap[data.icon] || <AppstoreOutlined />;
  const color = categoryColors[data.category] || '#666';

  return (
    <div style={{ position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#555',
          width: 10,
          height: 10,
          border: '2px solid #fff',
        }}
      />
      
      <Card
        size="small"
        style={{
          width: 200,
          borderColor: selected ? '#0078d4' : '#d9d9d9',
          borderWidth: selected ? 2 : 1,
          boxShadow: selected ? '0 0 0 2px rgba(0, 120, 212, 0.2)' : 'none',
        }}
        styles={{
          body: { padding: '12px' },
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                background: `${color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                fontSize: 16,
              }}
            >
              {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {data.label}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {data.type.replace('azurerm_', '').replace(/_/g, ' ')}
              </Text>
            </div>
          </div>
          
          <Tag
            color={color}
            style={{
              margin: 0,
              textTransform: 'capitalize',
              fontSize: 10,
            }}
          >
            {data.category}
          </Tag>
        </Space>
      </Card>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#555',
          width: 10,
          height: 10,
          border: '2px solid #fff',
        }}
      />
    </div>
  );
});

ResourceNode.displayName = 'ResourceNode';

export default ResourceNode;
