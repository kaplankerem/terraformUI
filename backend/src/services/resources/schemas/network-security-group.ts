import type { AzureResourceSchema } from '@ianc/shared';
import { AZURE_REGIONS } from '@ianc/shared';

export const networkSecurityGroupSchema: AzureResourceSchema = {
  type: 'azurerm_network_security_group',
  displayName: 'Network Security Group',
  category: 'networking',
  icon: 'nsg',
  version: '1.0.0',
  description: 'A network security group to filter network traffic',
  properties: [
    {
      name: 'name',
      displayName: 'NSG Name',
      type: 'string',
      description: 'The name of the network security group',
      placeholder: 'my-nsg',
      validation: [
        { type: 'required', message: 'NSG name is required' },
        { type: 'maxLength', value: 80, message: 'Name must be less than 80 characters' }
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'resource_group_name',
      displayName: 'Resource Group',
      type: 'string',
      description: 'The resource group where the NSG will be created',
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
      description: 'The Azure region for the NSG',
      enum: AZURE_REGIONS.map(r => ({ value: r.value, label: r.label })),
      defaultValue: 'eastus',
      validation: [
        { type: 'required', message: 'Location is required' }
      ],
      ui: { width: 'half', order: 3 }
    },
    {
      name: 'tags',
      displayName: 'Tags',
      type: 'map',
      description: 'A mapping of tags to assign to the resource',
      ui: { width: 'full', order: 4, advanced: true }
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
      name: 'nsg_id',
      type: 'string',
      description: 'The ID of the network security group',
      value: 'azurerm_network_security_group.main.id'
    },
    {
      name: 'nsg_name',
      type: 'string',
      description: 'The name of the network security group',
      value: 'azurerm_network_security_group.main.name'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_network_security_group',
    nameProperty: 'name'
  }
};
