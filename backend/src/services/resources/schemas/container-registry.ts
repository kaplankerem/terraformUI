import type { AzureResourceSchema } from '@ianc/shared';
import { AZURE_REGIONS } from '@ianc/shared';

export const containerRegistrySchema: AzureResourceSchema = {
  type: 'azurerm_container_registry',
  displayName: 'Container Registry',
  category: 'container',
  icon: 'container-registry',
  version: '1.0.0',
  description: 'An Azure Container Registry for storing and managing container images',
  properties: [
    {
      name: 'name',
      displayName: 'Registry Name',
      type: 'string',
      description: 'The name of the Container Registry (must be globally unique, alphanumeric only)',
      placeholder: 'myacr001',
      validation: [
        { type: 'required', message: 'Registry name is required' },
        { type: 'minLength', value: 5, message: 'Name must be at least 5 characters' },
        { type: 'maxLength', value: 50, message: 'Name must be less than 50 characters' },
        { type: 'pattern', value: '^[a-zA-Z0-9]*$', message: 'Name can only contain alphanumeric characters' }
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'location',
      displayName: 'Region',
      type: 'string',
      description: 'The Azure region for the Container Registry',
      enum: AZURE_REGIONS.map(r => ({ value: r.value, label: r.label })),
      defaultValue: 'eastus',
      validation: [
        { type: 'required', message: 'Location is required' }
      ],
      ui: { width: 'half', order: 2 }
    },
    {
      name: 'resource_group_name',
      displayName: 'Resource Group',
      type: 'string',
      description: 'The resource group where the Container Registry will be created',
      reference: {
        resourceType: 'azurerm_resource_group',
        property: 'name'
      },
      validation: [
        { type: 'required', message: 'Resource group is required' }
      ],
      ui: { width: 'full', order: 3 }
    },
    {
      name: 'sku',
      displayName: 'SKU',
      type: 'string',
      description: 'The SKU tier of the Container Registry',
      enum: [
        { value: 'Basic', label: 'Basic', description: 'Cost-optimized for lower throughput scenarios' },
        { value: 'Standard', label: 'Standard', description: 'Balanced throughput and storage for most production scenarios' },
        { value: 'Premium', label: 'Premium', description: 'Highest storage and throughput with geo-replication' },
      ],
      defaultValue: 'Standard',
      validation: [
        { type: 'required', message: 'SKU is required' }
      ],
      ui: { width: 'half', order: 4 }
    },
    {
      name: 'admin_enabled',
      displayName: 'Admin User',
      type: 'boolean',
      description: 'Enable the admin user for the registry',
      defaultValue: false,
      ui: { width: 'half', order: 5 }
    },
    {
      name: 'public_network_access_enabled',
      displayName: 'Public Network Access',
      type: 'boolean',
      description: 'Allow public network access to the registry',
      defaultValue: true,
      ui: { width: 'half', order: 6 }
    },
    {
      name: 'zone_redundancy_enabled',
      displayName: 'Zone Redundancy',
      type: 'boolean',
      description: 'Enable zone redundancy for high availability',
      defaultValue: false,
      ui: { width: 'half', order: 7, advanced: true }
    },
    {
      name: 'tags',
      displayName: 'Tags',
      type: 'map',
      description: 'A mapping of tags to assign to the resource',
      ui: { width: 'full', order: 8, advanced: true }
    }
  ],
  required: ['name', 'location', 'resource_group_name', 'sku'],
  dependencies: [
    {
      type: 'required',
      resourceType: 'azurerm_resource_group',
      property: 'name'
    }
  ],
  outputs: [
    {
      name: 'acr_id',
      type: 'string',
      description: 'The ID of the Container Registry',
      value: 'azurerm_container_registry.main.id'
    },
    {
      name: 'acr_login_server',
      type: 'string',
      description: 'The login server URL of the Container Registry',
      value: 'azurerm_container_registry.main.login_server'
    },
    {
      name: 'acr_admin_username',
      type: 'string',
      description: 'The admin username of the Container Registry',
      value: 'azurerm_container_registry.main.admin_username'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_container_registry',
    nameProperty: 'name'
  }
};
