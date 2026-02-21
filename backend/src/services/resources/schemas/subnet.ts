import type { AzureResourceSchema } from '@ianc/shared';

export const subnetSchema: AzureResourceSchema = {
  type: 'azurerm_subnet',
  displayName: 'Subnet',
  category: 'networking',
  icon: 'subnet',
  version: '1.0.0',
  description: 'A subnet within a virtual network',
  properties: [
    {
      name: 'name',
      displayName: 'Subnet Name',
      type: 'string',
      description: 'The name of the subnet',
      placeholder: 'my-subnet',
      validation: [
        { type: 'required', message: 'Subnet name is required' },
        { type: 'maxLength', value: 80, message: 'Name must be less than 80 characters' }
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'resource_group_name',
      displayName: 'Resource Group',
      type: 'string',
      description: 'The resource group where the subnet will be created',
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
      name: 'virtual_network_name',
      displayName: 'Virtual Network',
      type: 'string',
      description: 'The virtual network where the subnet will be created',
      reference: {
        resourceType: 'azurerm_virtual_network',
        property: 'name'
      },
      validation: [
        { type: 'required', message: 'Virtual network is required' }
      ],
      ui: { width: 'full', order: 3 }
    },
    {
      name: 'address_prefixes',
      displayName: 'Address Prefixes',
      type: 'array',
      description: 'The address prefixes for the subnet (CIDR notation)',
      placeholder: '10.0.1.0/24',
      validation: [
        { type: 'required', message: 'At least one address prefix is required' }
      ],
      ui: { width: 'full', order: 4 }
    },
    {
      name: 'service_endpoints',
      displayName: 'Service Endpoints',
      type: 'array',
      description: 'The list of service endpoints to enable',
      enum: [
        { value: 'Microsoft.Storage', label: 'Microsoft Storage' },
        { value: 'Microsoft.Sql', label: 'Microsoft SQL' },
        { value: 'Microsoft.KeyVault', label: 'Microsoft Key Vault' },
        { value: 'Microsoft.ServiceBus', label: 'Microsoft Service Bus' },
        { value: 'Microsoft.EventHub', label: 'Microsoft Event Hub' },
        { value: 'Microsoft.ContainerRegistry', label: 'Microsoft Container Registry' }
      ],
      ui: { width: 'full', order: 5, advanced: true }
    }
  ],
  required: ['name', 'resource_group_name', 'virtual_network_name', 'address_prefixes'],
  dependencies: [
    {
      type: 'required',
      resourceType: 'azurerm_virtual_network',
      property: 'name'
    }
  ],
  outputs: [
    {
      name: 'subnet_id',
      type: 'string',
      description: 'The ID of the subnet',
      value: 'azurerm_subnet.main.id'
    },
    {
      name: 'subnet_address_prefixes',
      type: 'list(string)',
      description: 'The address prefixes of the subnet',
      value: 'azurerm_subnet.main.address_prefixes'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_subnet',
    nameProperty: 'name'
  }
};
