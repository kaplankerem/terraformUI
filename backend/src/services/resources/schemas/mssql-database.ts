import type { AzureResourceSchema } from '@ianc/shared';

export const mssqlDatabaseSchema: AzureResourceSchema = {
  type: 'azurerm_mssql_database',
  displayName: 'SQL Database',
  category: 'database',
  icon: 'sql-database',
  version: '1.0.0',
  description: 'An Azure SQL Database hosted on a SQL Server',
  properties: [
    {
      name: 'name',
      displayName: 'Database Name',
      type: 'string',
      description: 'The name of the SQL Database',
      placeholder: 'sqldb-myapp-001',
      validation: [
        { type: 'required', message: 'Database name is required' },
        { type: 'minLength', value: 1, message: 'Name must be at least 1 character' },
        { type: 'maxLength', value: 128, message: 'Name must be less than 128 characters' },
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'server_id',
      displayName: 'SQL Server ID',
      type: 'string',
      description: 'The ID of the SQL Server where the database will be created',
      placeholder: 'azurerm_mssql_server.main.id',
      reference: {
        resourceType: 'azurerm_mssql_server',
        property: 'id'
      },
      validation: [
        { type: 'required', message: 'SQL Server ID is required' }
      ],
      ui: { width: 'full', order: 2 }
    },
    {
      name: 'sku_name',
      displayName: 'Pricing Tier',
      type: 'string',
      description: 'The SKU for the database',
      enum: [
        { value: 'Basic', label: 'Basic', description: '5 DTU, 2 GB storage' },
        { value: 'S0', label: 'Standard S0', description: '10 DTU, 250 GB storage' },
        { value: 'S1', label: 'Standard S1', description: '20 DTU, 250 GB storage' },
        { value: 'S2', label: 'Standard S2', description: '50 DTU, 250 GB storage' },
        { value: 'P1', label: 'Premium P1', description: '125 DTU, 500 GB storage' },
        { value: 'GP_S_Gen5_1', label: 'General Purpose Serverless', description: 'Serverless, auto-scale vCores' },
      ],
      defaultValue: 'S0',
      ui: { width: 'full', order: 3 }
    },
    {
      name: 'max_size_gb',
      displayName: 'Max Size (GB)',
      type: 'number',
      description: 'The maximum size of the database in GB',
      defaultValue: 2,
      ui: { width: 'half', order: 4 }
    },
    {
      name: 'collation',
      displayName: 'Collation',
      type: 'string',
      description: 'The collation of the database',
      defaultValue: 'SQL_Latin1_General_CP1_CI_AS',
      ui: { width: 'half', order: 5, advanced: true }
    },
    {
      name: 'tags',
      displayName: 'Tags',
      type: 'map',
      description: 'A mapping of tags to assign to the resource',
      ui: { width: 'full', order: 6, advanced: true }
    }
  ],
  required: ['name', 'server_id'],
  dependencies: [
    {
      type: 'required',
      resourceType: 'azurerm_mssql_server',
      property: 'id'
    }
  ],
  outputs: [
    {
      name: 'database_id',
      type: 'string',
      description: 'The ID of the SQL Database',
      value: 'azurerm_mssql_database.main.id'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_mssql_database',
    nameProperty: 'name'
  }
};
