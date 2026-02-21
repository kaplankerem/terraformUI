import type { AzureResourceSchema } from '@ianc/shared';
import { AZURE_REGIONS } from '@ianc/shared';

export const publicIpSchema: AzureResourceSchema = {
  type: 'azurerm_public_ip',
  displayName: 'Public IP Address',
  category: 'networking',
  icon: 'public-ip',
  version: '1.0.0',
  description: 'A public IP address',
  properties: [
    {
      name: 'name',
      displayName: 'Public IP Name',
      type: 'string',
      description: 'The name of the public IP address',
      placeholder: 'my-public-ip',
      validation: [
        { type: 'required', message: 'Public IP name is required' },
        { type: 'maxLength', value: 80, message: 'Name must be less than 80 characters' }
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'resource_group_name',
      displayName: 'Resource Group',
      type: 'string',
      description: 'The resource group where the public IP will be created',
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
      description: 'The Azure region for the public IP',
      enum: AZURE_REGIONS.map(r => ({ value: r.value, label: r.label })),
      defaultValue: 'eastus',
      validation: [
        { type: 'required', message: 'Location is required' }
      ],
      ui: { width: 'half', order: 3 }
    },
    {
      name: 'allocation_method',
      displayName: 'Allocation Method',
      type: 'string',
      description: 'The allocation method for the public IP',
      enum: [
        { value: 'Static', label: 'Static', description: 'IP address is fixed' },
        { value: 'Dynamic', label: 'Dynamic', description: 'IP address can change' }
      ],
      defaultValue: 'Static',
      validation: [
        { type: 'required', message: 'Allocation method is required' }
      ],
      ui: { width: 'half', order: 4 }
    },
    {
      name: 'sku',
      displayName: 'SKU',
      type: 'string',
      description: 'The SKU of the public IP',
      enum: [
        { value: 'Basic', label: 'Basic' },
        { value: 'Standard', label: 'Standard' }
      ],
      defaultValue: 'Standard',
      validation: [
        { type: 'required', message: 'SKU is required' }
      ],
      ui: { width: 'half', order: 5 }
    },
    {
      name: 'sku_tier',
      displayName: 'SKU Tier',
      type: 'string',
      description: 'The tier of the public IP SKU',
      enum: [
        { value: 'Regional', label: 'Regional' },
        { value: 'Global', label: 'Global' }
      ],
      defaultValue: 'Regional',
      ui: { width: 'half', order: 6, advanced: true }
    },
    {
      name: 'tags',
      displayName: 'Tags',
      type: 'map',
      description: 'A mapping of tags to assign to the resource',
      ui: { width: 'full', order: 7, advanced: true }
    }
  ],
  required: ['name', 'resource_group_name', 'location', 'allocation_method', 'sku'],
  dependencies: [
    {
      type: 'required',
      resourceType: 'azurerm_resource_group',
      property: 'name'
    }
  ],
  outputs: [
    {
      name: 'public_ip_id',
      type: 'string',
      description: 'The ID of the public IP',
      value: 'azurerm_public_ip.main.id'
    },
    {
      name: 'public_ip_address',
      type: 'string',
      description: 'The IP address',
      value: 'azurerm_public_ip.main.ip_address'
    },
    {
      name: 'public_ip_fqdn',
      type: 'string',
      description: 'The FQDN of the public IP',
      value: 'azurerm_public_ip.main.fqdn'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_public_ip',
    nameProperty: 'name'
  }
};
