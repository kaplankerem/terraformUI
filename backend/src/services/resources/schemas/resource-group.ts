import type { AzureResourceSchema } from '@ianc/shared';
import { AZURE_REGIONS } from '@ianc/shared';

export const resourceGroupSchema: AzureResourceSchema = {
  type: 'azurerm_resource_group',
  displayName: 'Resource Group',
  category: 'core',
  icon: 'resource-group',
  version: '1.0.0',
  description: 'A container that holds related resources for an Azure solution',
  properties: [
    {
      name: 'name',
      displayName: 'Resource Group Name',
      type: 'string',
      description: 'The name of the resource group',
      placeholder: 'my-resource-group',
      validation: [
        { type: 'required', message: 'Resource group name is required' },
        { type: 'minLength', value: 1, message: 'Name must be at least 1 character' },
        { type: 'maxLength', value: 90, message: 'Name must be less than 90 characters' },
        { type: 'pattern', value: '^[a-zA-Z0-9._()-]+$', message: 'Name can only contain alphanumeric characters, periods, underscores, hyphens, and parentheses' }
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'location',
      displayName: 'Region',
      type: 'string',
      description: 'The Azure region where the resource group will be created',
      enum: AZURE_REGIONS.map(r => ({ value: r.value, label: r.label })),
      defaultValue: 'eastus',
      validation: [
        { type: 'required', message: 'Location is required' }
      ],
      ui: { width: 'half', order: 2 }
    },
    {
      name: 'tags',
      displayName: 'Tags',
      type: 'map',
      description: 'A mapping of tags to assign to the resource',
      ui: { width: 'full', order: 3, advanced: true }
    }
  ],
  required: ['name', 'location'],
  outputs: [
    {
      name: 'resource_group_id',
      type: 'string',
      description: 'The ID of the resource group',
      value: 'azurerm_resource_group.main.id'
    },
    {
      name: 'resource_group_name',
      type: 'string',
      description: 'The name of the resource group',
      value: 'azurerm_resource_group.main.name'
    },
    {
      name: 'resource_group_location',
      type: 'string',
      description: 'The location of the resource group',
      value: 'azurerm_resource_group.main.location'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_resource_group',
    nameProperty: 'name'
  }
};
