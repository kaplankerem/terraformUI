import type { AzureResourceSchema } from '@ianc/shared';
import { AZURE_REGIONS } from '@ianc/shared';

export const virtualNetworkSchema: AzureResourceSchema = {
  type: 'azurerm_virtual_network',
  displayName: 'Virtual Network',
  category: 'networking',
  icon: 'virtual-network',
  version: '1.0.0',
  description: 'A virtual network in Azure',
  properties: [
    {
      name: 'name',
      displayName: 'Virtual Network Name',
      type: 'string',
      description: 'The name of the virtual network',
      placeholder: 'my-vnet',
      validation: [
        { type: 'required', message: 'Virtual network name is required' },
        { type: 'maxLength', value: 64, message: 'Name must be less than 64 characters' },
        { type: 'pattern', value: '^[a-zA-Z0-9._-]+$', message: 'Name can only contain alphanumeric characters, periods, underscores, and hyphens' }
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'resource_group_name',
      displayName: 'Resource Group',
      type: 'string',
      description: 'The resource group where the virtual network will be created',
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
      description: 'The Azure region for the virtual network',
      enum: AZURE_REGIONS.map(r => ({ value: r.value, label: r.label })),
      defaultValue: 'eastus',
      validation: [
        { type: 'required', message: 'Location is required' }
      ],
      ui: { width: 'half', order: 3 }
    },
    {
      name: 'address_space',
      displayName: 'Address Space',
      type: 'array',
      description: 'The address space for the virtual network (CIDR notation)',
      placeholder: '10.0.0.0/16',
      validation: [
        { type: 'required', message: 'At least one address space is required' }
      ],
      ui: { width: 'full', order: 4 }
    },
    {
      name: 'dns_servers',
      displayName: 'DNS Servers',
      type: 'array',
      description: 'List of DNS servers IP addresses',
      placeholder: '8.8.8.8',
      ui: { width: 'full', order: 5, advanced: true }
    },
    {
      name: 'tags',
      displayName: 'Tags',
      type: 'map',
      description: 'A mapping of tags to assign to the resource',
      ui: { width: 'full', order: 6, advanced: true }
    }
  ],
  required: ['name', 'resource_group_name', 'location', 'address_space'],
  dependencies: [
    {
      type: 'required',
      resourceType: 'azurerm_resource_group',
      property: 'name'
    }
  ],
  outputs: [
    {
      name: 'vnet_id',
      type: 'string',
      description: 'The ID of the virtual network',
      value: 'azurerm_virtual_network.main.id'
    },
    {
      name: 'vnet_name',
      type: 'string',
      description: 'The name of the virtual network',
      value: 'azurerm_virtual_network.main.name'
    },
    {
      name: 'vnet_address_space',
      type: 'list(string)',
      description: 'The address space of the virtual network',
      value: 'azurerm_virtual_network.main.address_space'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_virtual_network',
    nameProperty: 'name'
  }
};
