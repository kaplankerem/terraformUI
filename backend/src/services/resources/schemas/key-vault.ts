import type { AzureResourceSchema } from '@ianc/shared';
import { AZURE_REGIONS } from '@ianc/shared';

export const keyVaultSchema: AzureResourceSchema = {
  type: 'azurerm_key_vault',
  displayName: 'Key Vault',
  category: 'security',
  icon: 'key-vault',
  version: '1.0.0',
  description: 'An Azure Key Vault for managing secrets, keys, and certificates',
  properties: [
    {
      name: 'name',
      displayName: 'Key Vault Name',
      type: 'string',
      description: 'The name of the Key Vault (must be globally unique, 3-24 characters)',
      placeholder: 'kv-myapp-001',
      validation: [
        { type: 'required', message: 'Key Vault name is required' },
        { type: 'minLength', value: 3, message: 'Name must be at least 3 characters' },
        { type: 'maxLength', value: 24, message: 'Name must be less than 24 characters' },
        { type: 'pattern', value: '^[a-zA-Z][a-zA-Z0-9-]*$', message: 'Name must start with a letter and can only contain alphanumeric characters and hyphens' }
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'location',
      displayName: 'Region',
      type: 'string',
      description: 'The Azure region for the Key Vault',
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
      description: 'The resource group where the Key Vault will be created',
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
      name: 'sku_name',
      displayName: 'SKU',
      type: 'string',
      description: 'The pricing tier of the Key Vault',
      enum: [
        { value: 'standard', label: 'Standard', description: 'Standard tier for most workloads' },
        { value: 'premium', label: 'Premium', description: 'Premium tier with HSM-backed keys' },
      ],
      defaultValue: 'standard',
      validation: [
        { type: 'required', message: 'SKU is required' }
      ],
      ui: { width: 'half', order: 4 }
    },
    {
      name: 'tenant_id',
      displayName: 'Tenant ID',
      type: 'string',
      description: 'The Azure Active Directory tenant ID for authenticating requests',
      placeholder: '00000000-0000-0000-0000-000000000000',
      validation: [
        { type: 'required', message: 'Tenant ID is required' }
      ],
      ui: { width: 'full', order: 5 }
    },
    {
      name: 'soft_delete_retention_days',
      displayName: 'Soft Delete Retention Days',
      type: 'number',
      description: 'The number of days to retain soft-deleted items (7-90)',
      defaultValue: 90,
      validation: [
        { type: 'min', value: 7, message: 'Retention must be at least 7 days' },
        { type: 'max', value: 90, message: 'Retention must be at most 90 days' },
      ],
      ui: { width: 'half', order: 6 }
    },
    {
      name: 'purge_protection_enabled',
      displayName: 'Purge Protection',
      type: 'boolean',
      description: 'Enable purge protection to prevent permanent deletion during retention period',
      defaultValue: false,
      ui: { width: 'half', order: 7 }
    },
    {
      name: 'enabled_for_deployment',
      displayName: 'Enabled for Deployment',
      type: 'boolean',
      description: 'Allow Azure VMs to retrieve certificates stored as secrets',
      defaultValue: false,
      ui: { width: 'half', order: 8 }
    },
    {
      name: 'enabled_for_disk_encryption',
      displayName: 'Enabled for Disk Encryption',
      type: 'boolean',
      description: 'Allow Azure Disk Encryption to retrieve secrets and unwrap keys',
      defaultValue: false,
      ui: { width: 'half', order: 9 }
    },
    {
      name: 'enabled_for_template_deployment',
      displayName: 'Enabled for Template Deployment',
      type: 'boolean',
      description: 'Allow Azure Resource Manager to retrieve secrets',
      defaultValue: false,
      ui: { width: 'half', order: 10 }
    },
    {
      name: 'tags',
      displayName: 'Tags',
      type: 'map',
      description: 'A mapping of tags to assign to the resource',
      ui: { width: 'full', order: 11, advanced: true }
    }
  ],
  required: ['name', 'location', 'resource_group_name', 'sku_name', 'tenant_id'],
  dependencies: [
    {
      type: 'required',
      resourceType: 'azurerm_resource_group',
      property: 'name'
    }
  ],
  outputs: [
    {
      name: 'key_vault_id',
      type: 'string',
      description: 'The ID of the Key Vault',
      value: 'azurerm_key_vault.main.id'
    },
    {
      name: 'key_vault_uri',
      type: 'string',
      description: 'The URI of the Key Vault',
      value: 'azurerm_key_vault.main.vault_uri'
    },
    {
      name: 'key_vault_name',
      type: 'string',
      description: 'The name of the Key Vault',
      value: 'azurerm_key_vault.main.name'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_key_vault',
    nameProperty: 'name'
  }
};
