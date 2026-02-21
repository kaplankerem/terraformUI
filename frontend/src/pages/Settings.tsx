import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Form, Input, Select, Button, Switch, Divider, message, Spin, Tabs } from 'antd';
import { SaveOutlined, GlobalOutlined, CloudOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface AppSettings {
  azure: {
    subscriptionId: string;
    tenantId: string;
    defaultLocation: string;
    defaultResourceGroup: string;
  };
  terraform: {
    version: string;
    outputDirectory: string;
    generateVariables: boolean;
    generateOutputs: boolean;
  };
  ui: {
    theme: string;
    autoSave: boolean;
    showNotifications: boolean;
  };
}

const defaultSettings: AppSettings = {
  azure: {
    subscriptionId: '',
    tenantId: '',
    defaultLocation: 'eastus',
    defaultResourceGroup: '',
  },
  terraform: {
    version: '1.5.0',
    outputDirectory: './terraform',
    generateVariables: true,
    generateOutputs: true,
  },
  ui: {
    theme: 'light',
    autoSave: true,
    showNotifications: true,
  },
};

const azureLocations = [
  { value: 'eastus', label: 'East US' },
  { value: 'eastus2', label: 'East US 2' },
  { value: 'westus', label: 'West US' },
  { value: 'westus2', label: 'West US 2' },
  { value: 'centralus', label: 'Central US' },
  { value: 'northeurope', label: 'North Europe' },
  { value: 'westeurope', label: 'West Europe' },
  { value: 'uksouth', label: 'UK South' },
  { value: 'ukwest', label: 'UK West' },
  { value: 'francecentral', label: 'France Central' },
  { value: 'germanywestcentral', label: 'Germany West Central' },
  { value: 'norwayeast', label: 'Norway East' },
  { value: 'switzerlandnorth', label: 'Switzerland North' },
  { value: 'southeastasia', label: 'Southeast Asia' },
  { value: 'eastasia', label: 'East Asia' },
  { value: 'japaneast', label: 'Japan East' },
  { value: 'japanwest', label: 'Japan West' },
  { value: 'australiaeast', label: 'Australia East' },
  { value: 'australiasoutheast', label: 'Australia Southeast' },
];

const terraformVersions = [
  { value: '1.5.0', label: '1.5.0 (Latest)' },
  { value: '1.4.0', label: '1.4.0' },
  { value: '1.3.0', label: '1.3.0' },
  { value: '1.2.0', label: '1.2.0' },
];

function Settings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [azureForm] = Form.useForm();
  const [terraformForm] = Form.useForm();
  const [uiForm] = Form.useForm();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load settings from localStorage for now
      const savedSettings = localStorage.getItem('ianc-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        azureForm.setFieldsValue(settings.azure);
        terraformForm.setFieldsValue(settings.terraform);
        uiForm.setFieldsValue(settings.ui);
      } else {
        azureForm.setFieldsValue(defaultSettings.azure);
        terraformForm.setFieldsValue(defaultSettings.terraform);
        uiForm.setFieldsValue(defaultSettings.ui);
      }
    } catch (error) {
      message.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const settings: AppSettings = {
        azure: azureForm.getFieldsValue(),
        terraform: terraformForm.getFieldsValue(),
        ui: uiForm.getFieldsValue(),
      };
      
      localStorage.setItem('ianc-settings', JSON.stringify(settings));
      message.success('Settings saved successfully');
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    azureForm.setFieldsValue(defaultSettings.azure);
    terraformForm.setFieldsValue(defaultSettings.terraform);
    uiForm.setFieldsValue(defaultSettings.ui);
    message.info('Settings reset to defaults');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <SettingOutlined style={{ marginRight: 8 }} />
            Settings
          </Title>
          <Paragraph type="secondary">
            Configure your IaNC application preferences
          </Paragraph>
        </Col>
        <Col>
          <Button onClick={resetSettings} style={{ marginRight: 8 }}>
            Reset to Defaults
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={saveSettings} loading={saving}>
            Save Settings
          </Button>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="azure"
        items={[
          {
            key: 'azure',
            label: (
              <span>
                <CloudOutlined />
                Azure Configuration
              </span>
            ),
            children: (
              <Card title="Azure Settings" style={{ marginBottom: 24 }}>
                <Form form={azureForm} layout="vertical">
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="subscriptionId"
                        label="Subscription ID"
                        tooltip="Your Azure subscription ID (optional, for future integration)"
                      >
                        <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="tenantId"
                        label="Tenant ID"
                        tooltip="Your Azure tenant ID (optional, for future integration)"
                      >
                        <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="defaultLocation"
                        label="Default Location"
                        tooltip="Default Azure region for new resources"
                      >
                        <Select showSearch optionFilterProp="children">
                          {azureLocations.map(loc => (
                            <Option key={loc.value} value={loc.value}>{loc.label}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="defaultResourceGroup"
                        label="Default Resource Group"
                        tooltip="Default resource group name (optional)"
                      >
                        <Input placeholder="my-resource-group" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
                <Divider />
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  <Text strong>Note:</Text> Azure credentials are not stored in the application. 
                  Terraform will use your local Azure CLI authentication or environment variables.
                </Paragraph>
              </Card>
            ),
          },
          {
            key: 'terraform',
            label: (
              <span>
                <SettingOutlined />
                Terraform Settings
              </span>
            ),
            children: (
              <Card title="Terraform Configuration" style={{ marginBottom: 24 }}>
                <Form form={terraformForm} layout="vertical">
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="version"
                        label="Terraform Version"
                        tooltip="Terraform version for generated configuration"
                      >
                        <Select>
                          {terraformVersions.map(v => (
                            <Option key={v.value} value={v.value}>{v.label}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="outputDirectory"
                        label="Output Directory"
                        tooltip="Default directory for generated Terraform files"
                      >
                        <Input placeholder="./terraform" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="generateVariables"
                        label="Generate Variables File"
                        tooltip="Automatically generate variables.tf file"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="generateOutputs"
                        label="Generate Outputs File"
                        tooltip="Automatically generate outputs.tf file"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>
            ),
          },
          {
            key: 'ui',
            label: (
              <span>
                <GlobalOutlined />
                UI Preferences
              </span>
            ),
            children: (
              <Card title="User Interface Settings" style={{ marginBottom: 24 }}>
                <Form form={uiForm} layout="vertical">
                  <Row gutter={24}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="theme"
                        label="Theme"
                        tooltip="Application color theme"
                      >
                        <Select>
                          <Option value="light">Light</Option>
                          <Option value="dark">Dark (Coming Soon)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="autoSave"
                        label="Auto Save"
                        tooltip="Automatically save changes"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="showNotifications"
                        label="Show Notifications"
                        tooltip="Show success/error notifications"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}

export default Settings;
