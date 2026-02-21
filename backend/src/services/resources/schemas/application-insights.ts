import type { AzureResourceSchema } from '@ianc/shared';
import { AZURE_REGIONS } from '@ianc/shared';

export const applicationInsightsSchema: AzureResourceSchema = {
  type: 'azurerm_application_insights',
  displayName: 'Application Insights',
  category: 'monitoring',
  icon: 'app-insights',
  version: '1.0.0',
  description: 'Application performance monitoring and diagnostics for web apps',
  properties: [
    {
      name: 'name',
      displayName: 'Name',
      type: 'string',
      description: 'The name of the Application Insights resource',
      placeholder: 'appi-myapp-001',
      validation: [
        { type: 'required', message: 'Name is required' },
        { type: 'minLength', value: 1, message: 'Name must be at least 1 character' },
        { type: 'maxLength', value: 260, message: 'Name must be less than 260 characters' },
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'resource_group_name',
      displayName: 'Resource Group',
      type: 'string',
      description: 'The resource group where the resource will be created',
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
      name: 'application_type',
      displayName: 'Application Type',
      type: 'string',
      description: 'The type of application being monitored',
      enum: [
        { value: 'web', label: 'Web Application' },
        { value: 'java', label: 'Java Application' },
        { value: 'ios', label: 'iOS Application' },
        { value: 'other', label: 'Other' },
      ],
      defaultValue: 'web',
      validation: [
        { type: 'required', message: 'Application type is required' }
      ],
      ui: { width: 'half', order: 4 }
    },
    {
      name: 'retention_in_days',
      displayName: 'Data Retention (Days)',
      type: 'number',
      description: 'Number of days to retain data',
      defaultValue: 90,
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
  required: ['name', 'resource_group_name', 'location', 'application_type'],
  dependencies: [
    {
      type: 'required',
      resourceType: 'azurerm_resource_group',
      property: 'name'
    }
  ],
  outputs: [
    {
      name: 'app_insights_id',
      type: 'string',
      description: 'The ID of the Application Insights resource',
      value: 'azurerm_application_insights.main.id'
    },
    {
      name: 'instrumentation_key',
      type: 'string',
      description: 'The instrumentation key',
      value: 'azurerm_application_insights.main.instrumentation_key'
    },
    {
      name: 'connection_string',
      type: 'string',
      description: 'The connection string',
      value: 'azurerm_application_insights.main.connection_string'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_application_insights',
    nameProperty: 'name'
  }
};
