import type { AzureResourceSchema } from '@ianc/shared';
import { AZURE_REGIONS } from '@ianc/shared';

export const linuxWebAppSchema: AzureResourceSchema = {
  type: 'azurerm_linux_web_app',
  displayName: 'Linux Web App',
  category: 'compute',
  icon: 'web-app',
  version: '1.0.0',
  description: 'An Azure Linux Web App hosted on App Service',
  properties: [
    {
      name: 'name',
      displayName: 'Web App Name',
      type: 'string',
      description: 'The name of the web app (must be globally unique)',
      placeholder: 'mywebapp-001',
      validation: [
        { type: 'required', message: 'Web app name is required' },
        { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
        { type: 'maxLength', value: 60, message: 'Name must be less than 60 characters' },
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'resource_group_name',
      displayName: 'Resource Group',
      type: 'string',
      description: 'The resource group where the web app will be created',
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
      description: 'The Azure region for the web app',
      enum: AZURE_REGIONS.map(r => ({ value: r.value, label: r.label })),
      defaultValue: 'eastus',
      validation: [
        { type: 'required', message: 'Location is required' }
      ],
      ui: { width: 'half', order: 3 }
    },
    {
      name: 'service_plan_id',
      displayName: 'App Service Plan ID',
      type: 'string',
      description: 'The ID of the App Service Plan to host this web app',
      placeholder: 'azurerm_service_plan.main.id',
      reference: {
        resourceType: 'azurerm_service_plan',
        property: 'id'
      },
      validation: [
        { type: 'required', message: 'Service plan is required' }
      ],
      ui: { width: 'full', order: 4 }
    },
    {
      name: 'https_only',
      displayName: 'HTTPS Only',
      type: 'boolean',
      description: 'Force HTTPS connections to the web app',
      defaultValue: true,
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
  required: ['name', 'resource_group_name', 'location', 'service_plan_id'],
  dependencies: [
    {
      type: 'required',
      resourceType: 'azurerm_resource_group',
      property: 'name'
    },
    {
      type: 'required',
      resourceType: 'azurerm_service_plan',
      property: 'id'
    }
  ],
  outputs: [
    {
      name: 'web_app_id',
      type: 'string',
      description: 'The ID of the Web App',
      value: 'azurerm_linux_web_app.main.id'
    },
    {
      name: 'default_hostname',
      type: 'string',
      description: 'The default hostname of the Web App',
      value: 'azurerm_linux_web_app.main.default_hostname'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_linux_web_app',
    nameProperty: 'name'
  }
};
