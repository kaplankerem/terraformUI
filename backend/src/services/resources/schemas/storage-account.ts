import type { AzureResourceSchema } from '@ianc/shared';
import { AZURE_REGIONS } from '@ianc/shared';

export const storageAccountSchema: AzureResourceSchema = {
  type: 'azurerm_storage_account',
  displayName: 'Storage Account',
  category: 'storage',
  icon: 'storage-account',
  version: '1.0.0',
  description: 'An Azure storage account',
  properties: [
    {
      name: 'name',
      displayName: 'Storage Account Name',
      type: 'string',
      description: 'The name of the storage account (must be globally unique, 3-24 lowercase alphanumeric)',
      placeholder: 'mystorageaccount123',
      validation: [
        { type: 'required', message: 'Storage account name is required' },
        { type: 'minLength', value: 3, message: 'Name must be at least 3 characters' },
        { type: 'maxLength', value: 24, message: 'Name must be less than 24 characters' },
        { type: 'pattern', value: '^[a-z0-9]+$', message: 'Name can only contain lowercase letters and numbers' }
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'resource_group_name',
      displayName: 'Resource Group',
      type: 'string',
      description: 'The resource group where the storage account will be created',
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
      description: 'The Azure region for the storage account',
      enum: AZURE_REGIONS.map(r => ({ value: r.value, label: r.label })),
      defaultValue: 'eastus',
      validation: [
        { type: 'required', message: 'Location is required' }
      ],
      ui: { width: 'half', order: 3 }
    },
    {
      name: 'account_tier',
      displayName: 'Performance Tier',
      type: 'string',
      description: 'The performance tier of the storage account',
      enum: [
        { value: 'Standard', label: 'Standard', description: 'General-purpose v2 account with standard performance' },
        { value: 'Premium', label: 'Premium', description: 'High-performance storage for demanding workloads' }
      ],
      defaultValue: 'Standard',
      validation: [
        { type: 'required', message: 'Account tier is required' }
      ],
      ui: { width: 'half', order: 4 }
    },
    {
      name: 'account_replication_type',
      displayName: 'Replication Type',
      type: 'string',
      description: 'The replication type for the storage account',
      enum: [
        { value: 'LRS', label: 'Locally-redundant (LRS)', description: 'Lowest cost, multiple copies in one datacenter' },
        { value: 'GRS', label: 'Geo-redundant (GRS)', description: 'Multiple copies across two regions' },
        { value: 'RAGRS', label: 'Read-access geo-redundant (RA-GRS)', description: 'GRS with read access to secondary region' },
        { value: 'ZRS', label: 'Zone-redundant (ZRS)', description: 'Multiple copies across availability zones' },
        { value: 'GZRS', label: 'Geo-zone-redundant (GZRS)', description: 'ZRS with geo-replication' }
      ],
      defaultValue: 'LRS',
      validation: [
        { type: 'required', message: 'Replication type is required' }
      ],
      ui: { width: 'full', order: 5 }
    },
    {
      name: 'access_tier',
      displayName: 'Access Tier',
      type: 'string',
      description: 'The access tier for the storage account',
      enum: [
        { value: 'Hot', label: 'Hot', description: 'Optimized for frequent access' },
        { value: 'Cool', label: 'Cool', description: 'Optimized for infrequent access' }
      ],
      defaultValue: 'Hot',
      ui: { width: 'half', order: 6 }
    },
    {
      name: 'min_tls_version',
      displayName: 'Minimum TLS Version',
      type: 'string',
      description: 'The minimum TLS version for the storage account',
      enum: [
        { value: 'TLS1_0', label: 'TLS 1.0' },
        { value: 'TLS1_1', label: 'TLS 1.1' },
        { value: 'TLS1_2', label: 'TLS 1.2' }
      ],
      defaultValue: 'TLS1_2',
      ui: { width: 'half', order: 7, advanced: true }
    },
    {
      name: 'enable_https_traffic_only',
      displayName: 'Enable HTTPS Traffic Only',
      type: 'boolean',
      description: 'Enable HTTPS traffic only to the storage account',
      defaultValue: true,
      ui: { width: 'half', order: 8 }
    },
    {
      name: 'allow_blob_public_access',
      displayName: 'Allow Blob Public Access',
      type: 'boolean',
      description: 'Allow public access to blobs',
      defaultValue: false,
      ui: { width: 'half', order: 9 }
    },
    {
      name: 'tags',
      displayName: 'Tags',
      type: 'map',
      description: 'A mapping of tags to assign to the resource',
      ui: { width: 'full', order: 10, advanced: true }
    }
  ],
  required: ['name', 'resource_group_name', 'location', 'account_tier', 'account_replication_type'],
  dependencies: [
    {
      type: 'required',
      resourceType: 'azurerm_resource_group',
      property: 'name'
    }
  ],
  outputs: [
    {
      name: 'storage_account_id',
      type: 'string',
      description: 'The ID of the storage account',
      value: 'azurerm_storage_account.main.id'
    },
    {
      name: 'primary_blob_endpoint',
      type: 'string',
      description: 'The primary blob endpoint',
      value: 'azurerm_storage_account.main.primary_blob_endpoint'
    },
    {
      name: 'primary_web_endpoint',
      type: 'string',
      description: 'The primary web endpoint',
      value: 'azurerm_storage_account.main.primary_web_endpoint'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_storage_account',
    nameProperty: 'name'
  }
};
