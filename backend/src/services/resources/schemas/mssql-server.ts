import type { AzureResourceSchema } from '@ianc/shared';
import { AZURE_REGIONS } from '@ianc/shared';

export const mssqlServerSchema: AzureResourceSchema = {
  type: 'azurerm_mssql_server',
  displayName: 'SQL Server',
  category: 'database',
  icon: 'sql-server',
  version: '1.0.0',
  description: 'An Azure SQL Server instance for hosting SQL databases',
  properties: [
    {
      name: 'name',
      displayName: 'Server Name',
      type: 'string',
      description: 'The name of the SQL Server (must be globally unique)',
      placeholder: 'sqlserver-myapp-001',
      validation: [
        { type: 'required', message: 'Server name is required' },
        { type: 'minLength', value: 1, message: 'Name must be at least 1 character' },
        { type: 'maxLength', value: 63, message: 'Name must be less than 63 characters' },
        { type: 'pattern', value: '^[a-z0-9-]+$', message: 'Name can only contain lowercase letters, numbers, and hyphens' }
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'resource_group_name',
      displayName: 'Resource Group',
      type: 'string',
      description: 'The resource group where the SQL Server will be created',
      reference: {
        resourceType: 'azurerm_resource_group',
        property: 'name'
      },
      validation: [
        { type: 'required', message: 'Resource group is required' }
      ],
      ui: { width: 'full', order: 2 }
    },
    {
      name: 'location',
      displayName: 'Region',
      type: 'string',
      description: 'The Azure region for the SQL Server',
      enum: AZURE_REGIONS.map(r => ({ value: r.value, label: r.label })),
      defaultValue: 'eastus',
      validation: [
        { type: 'required', message: 'Location is required' }
      ],
      ui: { width: 'half', order: 3 }
    },
    {
      name: 'version',
      displayName: 'Server Version',
      type: 'string',
      description: 'The version of the SQL Server',
      enum: [
        { value: '12.0', label: '12.0 (Latest)' },
      ],
      defaultValue: '12.0',
      validation: [
        { type: 'required', message: 'Version is required' }
      ],
      ui: { width: 'half', order: 4 }
    },
    {
      name: 'administrator_login',
      displayName: 'Admin Username',
      type: 'string',
      description: 'The administrator login for the SQL Server',
      placeholder: 'sqladmin',
      validation: [
        { type: 'required', message: 'Admin username is required' },
      ],
      ui: { width: 'half', order: 5 }
    },
    {
      name: 'administrator_login_password',
      displayName: 'Admin Password',
      type: 'string',
      description: 'The administrator password (use a variable for security)',
      placeholder: 'var.sql_admin_password',
      validation: [
        { type: 'required', message: 'Admin password is required' },
      ],
      ui: { width: 'half', order: 6 }
    },
    {
      name: 'minimum_tls_version',
      displayName: 'Minimum TLS Version',
      type: 'string',
      description: 'The minimum TLS version for connections',
      enum: [
        { value: '1.0', label: 'TLS 1.0' },
        { value: '1.1', label: 'TLS 1.1' },
        { value: '1.2', label: 'TLS 1.2' },
      ],
      defaultValue: '1.2',
      ui: { width: 'half', order: 7, advanced: true }
    },
    {
      name: 'tags',
      displayName: 'Tags',
      type: 'map',
      description: 'A mapping of tags to assign to the resource',
      ui: { width: 'full', order: 8, advanced: true }
    }
  ],
  required: ['name', 'resource_group_name', 'location', 'version', 'administrator_login', 'administrator_login_password'],
  dependencies: [
    {
      type: 'required',
      resourceType: 'azurerm_resource_group',
      property: 'name'
    }
  ],
  outputs: [
    {
      name: 'mssql_server_id',
      type: 'string',
      description: 'The ID of the SQL Server',
      value: 'azurerm_mssql_server.main.id'
    },
    {
      name: 'fully_qualified_domain_name',
      type: 'string',
      description: 'The FQDN of the SQL Server',
      value: 'azurerm_mssql_server.main.fully_qualified_domain_name'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_mssql_server',
    nameProperty: 'name'
  }
};
