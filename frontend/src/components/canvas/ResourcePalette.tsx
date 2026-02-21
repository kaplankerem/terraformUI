import { Card, Input, List, Typography, Space, Tag, Empty } from 'antd';
import {
  AppstoreOutlined,
  CloudOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  SafetyOutlined,
  WifiOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useState, useMemo } from 'react';

const { Text } = Typography;

interface ResourceType {
  type: string;
  displayName: string;
  category: string;
  icon: string;
  description: string;
}

interface ResourcePaletteProps {
  resources: ResourceType[];
  onResourceSelect?: (resource: ResourceType) => void;
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
};

// Category color mapping
const categoryColors: Record<string, string> = {
  core: '#0078d4',
  networking: '#00bcf2',
  storage: '#0078d4',
  compute: '#f25022',
  database: '#ffb900',
};

const ResourcePalette = ({ resources, onResourceSelect }: ResourcePaletteProps) => {
  const [search, setSearch] = useState('');

  const filteredResources = useMemo(() => {
    if (!search) return resources;
    const searchLower = search.toLowerCase();
    return resources.filter(
      (r) =>
        r.displayName.toLowerCase().includes(searchLower) ||
        r.type.toLowerCase().includes(searchLower) ||
        r.category.toLowerCase().includes(searchLower)
    );
  }, [resources, search]);

  const onDragStart = (event: React.DragEvent, resource: ResourceType) => {
    event.dataTransfer.setData('application/reactflow', resource.type);
    event.dataTransfer.setData('label', resource.displayName);
    event.dataTransfer.setData('category', resource.category);
    event.dataTransfer.setData('icon', resource.icon);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card
      title="Resource Palette"
      size="small"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{
        body: { flex: 1, overflow: 'auto', padding: '8px' },
      }}
    >
      <Input
        placeholder="Search resources..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 8 }}
        allowClear
      />

      {filteredResources.length === 0 ? (
        <Empty description="No resources found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={filteredResources}
          renderItem={(resource) => {
            const icon = iconMap[resource.icon] || <AppstoreOutlined />;
            const color = categoryColors[resource.category] || '#666';

            return (
              <List.Item
                style={{
                  padding: '8px',
                  cursor: 'grab',
                  borderRadius: 4,
                  marginBottom: 4,
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.2s',
                }}
                draggable
                onDragStart={(e) => onDragStart(e, resource)}
                onClick={() => onResourceSelect?.(resource)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.boxShadow = `0 2px 8px ${color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#f0f0f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Space style={{ width: '100%' }}>
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
                    }}
                  >
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ display: 'block', fontSize: 12 }}>
                      {resource.displayName}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 10 }}>
                      {resource.description}
                    </Text>
                  </div>
                </Space>
                <Tag color={color} style={{ marginLeft: 'auto', fontSize: 10 }}>
                  {resource.category}
                </Tag>
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};

export default ResourcePalette;
