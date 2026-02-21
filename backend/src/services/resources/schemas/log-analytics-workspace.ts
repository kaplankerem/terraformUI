import type { AzureResourceSchema } from '@ianc/shared';
import { AZURE_REGIONS } from '@ianc/shared';

export const logAnalyticsWorkspaceSchema: AzureResourceSchema = {
  type: 'azurerm_log_analytics_workspace',
  displayName: 'Log Analytics Workspace',
  category: 'monitoring',
  icon: 'log-analytics',
  version: '1.0.0',
  description: 'A Log Analytics workspace for centralized logging and monitoring',
  properties: [
    {
      name: 'name',
      displayName: 'Workspace Name',
      type: 'string',
      description: 'The name of the Log Analytics Workspace',
      placeholder: 'log-myapp-001',
      validation: [
        { type: 'required', message: 'Workspace name is required' },
        { type: 'minLength', value: 4, message: 'Name must be at least 4 characters' },
        { type: 'maxLength', value: 63, message: 'Name must be less than 63 characters' },
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'resource_group_name',
      displayName: 'Resource Group',
      type: 'string',
      description: 'The resource group where the workspace will be created',
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
      description: 'The Azure region',
      enum: AZURE_REGIONS.map(r => ({ value: r.value, label: r.label })),
      defaultValue: 'eastus',
      validation: [
        { type: 'required', message: 'Location is required' }
      ],
      ui: { width: 'half', order: 3 }
    },
    {
      name: 'sku',
      displayName: 'Pricing Tier',
      type: 'string',
      description: 'The SKU of the Log Analytics Workspace',
      enum: [
        { value: 'PerGB2018', label: 'Pay-as-you-go (PerGB2018)' },
        { value: 'Free', label: 'Free' },
        { value: 'Standalone', label: 'Standalone' },
        { value: 'PerNode', label: 'Per Node' },
      ],
      defaultValue: 'PerGB2018',
      ui: { width: 'half', order: 4 }
    },
    {
      name: 'retention_in_days',
      displayName: 'Data Retention (Days)',
      type: 'number',
      description: 'Number of days to retain data (30-730)',
      defaultValue: 30,
      validation: [
        { type: 'min', value: 30, message: 'Retention must be at least 30 days' },
        { type: 'max', value: 730, message: 'Retention must be at most 730 days' },
      ],
      ui: { width: 'half', order: 5 }
    },
    {
      name: 'tags',
      displayName: 'Tags',
      type: 'map',
      description: 'A mapping of tags to assign to the resource',
      ui: { width: 'full', order: 6, advanced: true }
    }
  ],
  required: ['name', 'resource_group_name', 'location'],
  dependencies: [
    {
      type: 'required',
      resourceType: 'azurerm_resource_group',
      property: 'name'
    }
  ],
  outputs: [
    {
      name: 'workspace_id',
      type: 'string',
      description: 'The Workspace ID',
      value: 'azurerm_log_analytics_workspace.main.workspace_id'
    },
    {
      name: 'primary_shared_key',
      type: 'string',
      description: 'The Primary shared key',
      value: 'azurerm_log_analytics_workspace.main.primary_shared_key'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_log_analytics_workspace',
    nameProperty: 'name'
  }
};
