import { Form, Input, InputNumber, Select, Switch, Button, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { PropertyDefinition } from '@ianc/shared';

interface DynamicFormProps {
  schema: PropertyDefinition[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

function DynamicForm({ schema, values, onChange, errors, disabled }: DynamicFormProps) {
  const sortedSchema = [...schema].sort((a, b) => {
    const orderA = a.ui?.order || 999;
    const orderB = b.ui?.order || 999;
    return orderA - orderB;
  });

  const handleChange = (name: string, value: unknown) => {
    onChange({ ...values, [name]: value });
  };

  const renderField = (property: PropertyDefinition) => {
    const { name, type, displayName, description, placeholder, enum: enumOptions, validation, ui } = property;
    const value = values[name];
    const error = errors?.[name];
    const isRequired = validation?.some(v => v.type === 'required');
    const width = ui?.width || 'full';

    const formItemStyle = {
      width: width === 'full' ? '100%' : width === 'half' ? '50%' : '33.33%',
    };

    // Render based on type
    switch (type) {
      case 'string':
        if (enumOptions && enumOptions.length > 0) {
          return (
            <Form.Item
              key={name}
              label={displayName}
              required={isRequired}
              help={error || description}
              validateStatus={error ? 'error' : undefined}
              style={formItemStyle}
            >
              <Select
                value={value as string}
                onChange={(v) => handleChange(name, v)}
                placeholder={placeholder}
                disabled={disabled}
                options={enumOptions.map(opt => ({
                  value: opt.value,
                  label: opt.label
                }))}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          );
        }
        return (
          <Form.Item
            key={name}
            label={displayName}
            required={isRequired}
            help={error || description}
            validateStatus={error ? 'error' : undefined}
            style={formItemStyle}
          >
            <Input
              value={value as string}
              onChange={(e) => handleChange(name, e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
            />
          </Form.Item>
        );

      case 'number':
        return (
          <Form.Item
            key={name}
            label={displayName}
            required={isRequired}
            help={error || description}
            validateStatus={error ? 'error' : undefined}
            style={formItemStyle}
          >
            <InputNumber
              value={value as number}
              onChange={(v) => handleChange(name, v)}
              placeholder={placeholder}
              disabled={disabled}
              style={{ width: '100%' }}
            />
          </Form.Item>
        );

      case 'boolean':
        return (
          <Form.Item
            key={name}
            label={displayName}
            required={isRequired}
            help={error || description}
            validateStatus={error ? 'error' : undefined}
            style={formItemStyle}
          >
            <Switch
              checked={value as boolean}
              onChange={(v) => handleChange(name, v)}
              disabled={disabled}
            />
          </Form.Item>
        );

      case 'array':
        const arrayValue = (value as string[]) || [];
        if (property.itemProperties && property.itemProperties.length > 0) {
          // Array of objects - simplified for now
          return (
            <Form.Item
              key={name}
              label={displayName}
              required={isRequired}
              help={error || description}
              validateStatus={error ? 'error' : undefined}
              style={formItemStyle}
            >
              <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, padding: 8 }}>
                {arrayValue.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newArray = [...arrayValue];
                        newArray[index] = e.target.value;
                        handleChange(name, newArray);
                      }}
                      placeholder={property.itemProperties?.[0]?.placeholder}
                    />
                    <Button
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => {
                        const newArray = arrayValue.filter((_, i) => i !== index);
                        handleChange(name, newArray);
                      }}
                    />
                  </div>
                ))}
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => handleChange(name, [...arrayValue, ''])}
                  block
                >
                  Add Item
                </Button>
              </div>
            </Form.Item>
          );
        }
        // Simple string array
        return (
          <Form.Item
            key={name}
            label={displayName}
            required={isRequired}
            help={error || description}
            validateStatus={error ? 'error' : undefined}
            style={formItemStyle}
          >
            <Select
              mode="tags"
              value={arrayValue}
              onChange={(v) => handleChange(name, v)}
              placeholder={placeholder}
              disabled={disabled}
              style={{ width: '100%' }}
            />
          </Form.Item>
        );

      case 'map':
        const mapValue = (value as Record<string, string>) || {};
        const mapEntries = Object.entries(mapValue);
        return (
          <Form.Item
            key={name}
            label={displayName}
            required={isRequired}
            help={error || description}
            validateStatus={error ? 'error' : undefined}
            style={formItemStyle}
          >
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, padding: 8 }}>
              {mapEntries.map(([key, val], index) => (
                <Space key={index} style={{ display: 'flex', marginBottom: 8 }}>
                  <Input
                    placeholder="Key"
                    value={key}
                    onChange={(e) => {
                      const newMap = { ...mapValue };
                      delete newMap[key];
                      newMap[e.target.value] = val;
                      handleChange(name, newMap);
                    }}
                    style={{ width: 120 }}
                  />
                  <Input
                    placeholder="Value"
                    value={val}
                    onChange={(e) => {
                      const newMap = { ...mapValue };
                      newMap[key] = e.target.value;
                      handleChange(name, newMap);
                    }}
                    style={{ width: 150 }}
                  />
                  <Button
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => {
                      const newMap = { ...mapValue };
                      delete newMap[key];
                      handleChange(name, newMap);
                    }}
                  />
                </Space>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => handleChange(name, { ...mapValue, '': '' })}
                block
              >
                Add Tag
              </Button>
            </div>
          </Form.Item>
        );

      case 'object':
        // Nested object - render sub-properties
        const objectValue = (value as Record<string, unknown>) || {};
        return (
          <div key={name} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>{displayName}</div>
            <div style={{ paddingLeft: 16, borderLeft: '2px solid #f0f0f0' }}>
              {property.subProperties?.map(subProp => {
                const subValue = objectValue[subProp.name];
                return (
                  <div key={subProp.name}>
                    {renderField({
                      ...subProp,
                      name: `${name}.${subProp.name}`,
                      displayName: subProp.displayName,
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Form layout="vertical" className="dynamic-form">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 16px' }}>
        {sortedSchema.map(property => renderField(property))}
      </div>
    </Form>
  );
}

export default DynamicForm;
