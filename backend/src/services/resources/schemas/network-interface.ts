import type { AzureResourceSchema } from '@ianc/shared';
import { AZURE_REGIONS } from '@ianc/shared';

export const networkInterfaceSchema: AzureResourceSchema = {
  type: 'azurerm_network_interface',
  displayName: 'Network Interface',
  category: 'networking',
  icon: 'nic',
  version: '1.0.0',
  description: 'A network interface for a virtual machine',
  properties: [
    {
      name: 'name',
      displayName: 'Network Interface Name',
      type: 'string',
      description: 'The name of the network interface',
      placeholder: 'my-nic',
      validation: [
        { type: 'required', message: 'Network interface name is required' },
        { type: 'maxLength', value: 80, message: 'Name must be less than 80 characters' }
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'resource_group_name',
      displayName: 'Resource Group',
      type: 'string',
      description: 'The resource group where the NIC will be created',
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
      description: 'The Azure region for the network interface',
      enum: AZURE_REGIONS.map(r => ({ value: r.value, label: r.label })),
      defaultValue: 'eastus',
      validation: [
        { type: 'required', message: 'Location is required' }
      ],
      ui: { width: 'half', order: 3 }
    },
    {
      name: 'subnet_id',
      displayName: 'Subnet',
      type: 'string',
      description: 'The subnet to connect to',
      reference: {
        resourceType: 'azurerm_subnet',
        property: 'id'
      },
      validation: [
        { type: 'required', message: 'Subnet is required' }
      ],
      ui: { width: 'full', order: 4 }
    },
    {
      name: 'private_ip_address_allocation',
      displayName: 'Private IP Allocation',
      type: 'string',
      description: 'The private IP address allocation method',
      enum: [
        { value: 'Dynamic', label: 'Dynamic' },
        { value: 'Static', label: 'Static' }
      ],
      defaultValue: 'Dynamic',
      validation: [
        { type: 'required', message: 'Allocation method is required' }
      ],
      ui: { width: 'half', order: 5 }
    },
    {
      name: 'enable_accelerated_networking',
      displayName: 'Accelerated Networking',
      type: 'boolean',
      description: 'Enable accelerated networking for better performance',
      defaultValue: false,
      ui: { width: 'half', order: 6 }
    },
    {
      name: 'tags',
      displayName: 'Tags',
      type: 'map',
      description: 'A mapping of tags to assign to the resource',
      ui: { width: 'full', order: 7, advanced: true }
    }
  ],
  required: ['name', 'resource_group_name', 'location', 'subnet_id'],
  dependencies: [
    {
      type: 'required',
      resourceType: 'azurerm_subnet',
      property: 'id'
    }
  ],
  outputs: [
    {
      name: 'nic_id',
      type: 'string',
      description: 'The ID of the network interface',
      value: 'azurerm_network_interface.main.id'
    },
    {
      name: 'nic_private_ip',
      type: 'string',
      description: 'The private IP address',
      value: 'azurerm_network_interface.main.private_ip_address'
    },
    {
      name: 'nic_mac_address',
      type: 'string',
      description: 'The MAC address',
      value: 'azurerm_network_interface.main.mac_address'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_network_interface',
    nameProperty: 'name'
  }
};
