// Types
export * from './types/resource-schema';
export * from './types/api';

// Constants
export const AZURE_REGIONS = [
  { value: 'eastus', label: 'East US' },
  { value: 'eastus2', label: 'East US 2' },
  { value: 'westus', label: 'West US' },
  { value: 'westus2', label: 'West US 2' },
  { value: 'centralus', label: 'Central US' },
  { value: 'northcentralus', label: 'North Central US' },
  { value: 'southcentralus', label: 'South Central US' },
  { value: 'westcentralus', label: 'West Central US' },
  { value: 'canadacentral', label: 'Canada Central' },
  { value: 'canadaeast', label: 'Canada East' },
  { value: 'brazilsouth', label: 'Brazil South' },
  { value: 'northeurope', label: 'North Europe' },
  { value: 'westeurope', label: 'West Europe' },
  { value: 'uksouth', label: 'UK South' },
  { value: 'ukwest', label: 'UK West' },
  { value: 'francecentral', label: 'France Central' },
  { value: 'francesouth', label: 'France South' },
  { value: 'switzerlandnorth', label: 'Switzerland North' },
  { value: 'switzerlandwest', label: 'Switzerland West' },
  { value: 'germanywestcentral', label: 'Germany West Central' },
  { value: 'germanynorth', label: 'Germany North' },
  { value: 'norwayeast', label: 'Norway East' },
  { value: 'norwaywest', label: 'Norway West' },
  { value: 'swedencentral', label: 'Sweden Central' },
  { value: 'southeastasia', label: 'Southeast Asia' },
  { value: 'eastasia', label: 'East Asia' },
  { value: 'japaneast', label: 'Japan East' },
  { value: 'japanwest', label: 'Japan West' },
  { value: 'koreacentral', label: 'Korea Central' },
  { value: 'koreasouth', label: 'Korea South' },
  { value: 'australiaeast', label: 'Australia East' },
  { value: 'australiasoutheast', label: 'Australia Southeast' },
  { value: 'australiacentral', label: 'Australia Central' },
  { value: 'australiacentral2', label: 'Australia Central 2' },
  { value: 'centralindia', label: 'Central India' },
  { value: 'southindia', label: 'South India' },
  { value: 'westindia', label: 'West India' },
  { value: 'jioindiawest', label: 'Jio India West' },
  { value: 'jioindiacentral', label: 'Jio India Central' },
  { value: 'uaenorth', label: 'UAE North' },
  { value: 'uaecentral', label: 'UAE Central' },
  { value: 'qatarcentral', label: 'Qatar Central' },
  { value: 'southafricanorth', label: 'South Africa North' },
  { value: 'southafricawest', label: 'South Africa West' },
] as const;

export const RESOURCE_CATEGORIES = [
  { value: 'core', label: 'Core', icon: 'resource-group' },
  { value: 'compute', label: 'Compute', icon: 'virtual-machine' },
  { value: 'storage', label: 'Storage', icon: 'storage-account' },
  { value: 'networking', label: 'Networking', icon: 'virtual-network' },
  { value: 'database', label: 'Database', icon: 'database' },
  { value: 'container', label: 'Container', icon: 'container' },
  { value: 'security', label: 'Security', icon: 'key-vault' },
  { value: 'monitoring', label: 'Monitoring', icon: 'monitor' },
  { value: 'integration', label: 'Integration', icon: 'integration' },
] as const;

// Utility functions
export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatResourceName(type: string): string {
  const parts = type.replace('azurerm_', '').split('_');
  return parts.map(capitalizeFirst).join(' ');
}
