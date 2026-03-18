import type { AzureResourceSchema } from '@ianc/shared';
import { AZURE_REGIONS } from '@ianc/shared';

export const windowsVirtualMachineSchema: AzureResourceSchema = {
  type: 'azurerm_windows_virtual_machine',
  displayName: 'Windows Virtual Machine',
  category: 'compute',
  icon: 'windows-vm',
  version: '1.0.0',
  description: 'An Azure Windows Virtual Machine',
  properties: [
    {
      name: 'name',
      displayName: 'VM Name',
      type: 'string',
      description: 'The name of the Windows virtual machine (max 15 characters)',
      placeholder: 'win-vm-001',
      validation: [
        { type: 'required', message: 'VM name is required' },
        { type: 'minLength', value: 1, message: 'Name must be at least 1 character' },
        { type: 'maxLength', value: 15, message: 'Name must be less than 15 characters for Windows' },
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'location',
      displayName: 'Region',
      type: 'string',
      description: 'The Azure region for the virtual machine',
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
      description: 'The resource group where the VM will be created',
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
      name: 'size',
      displayName: 'VM Size',
      type: 'string',
      description: 'The SKU size of the virtual machine',
      enum: [
        { value: 'Standard_B1s', label: 'Standard_B1s', description: 'Burstable 1 vCPU, 1 GiB RAM' },
        { value: 'Standard_B2s', label: 'Standard_B2s', description: 'Burstable 2 vCPUs, 4 GiB RAM' },
        { value: 'Standard_D2s_v3', label: 'Standard_D2s_v3', description: 'General purpose 2 vCPUs, 8 GiB RAM' },
        { value: 'Standard_D4s_v3', label: 'Standard_D4s_v3', description: 'General purpose 4 vCPUs, 16 GiB RAM' },
        { value: 'Standard_D8s_v3', label: 'Standard_D8s_v3', description: 'General purpose 8 vCPUs, 32 GiB RAM' },
        { value: 'Standard_E2s_v3', label: 'Standard_E2s_v3', description: 'Memory optimized 2 vCPUs, 16 GiB RAM' },
        { value: 'Standard_F2s_v2', label: 'Standard_F2s_v2', description: 'Compute optimized 2 vCPUs, 4 GiB RAM' },
        { value: 'Standard_DS1_v2', label: 'Standard_DS1_v2', description: 'General purpose 1 vCPU, 3.5 GiB RAM' },
      ],
      defaultValue: 'Standard_B2s',
      validation: [
        { type: 'required', message: 'VM size is required' }
      ],
      ui: { width: 'half', order: 4 }
    },
    {
      name: 'admin_username',
      displayName: 'Admin Username',
      type: 'string',
      description: 'The administrator username for the VM',
      placeholder: 'adminuser',
      validation: [
        { type: 'required', message: 'Admin username is required' },
        { type: 'minLength', value: 1, message: 'Username must be at least 1 character' },
        { type: 'maxLength', value: 20, message: 'Username must be less than 20 characters' },
      ],
      ui: { width: 'half', order: 5 }
    },
    {
      name: 'admin_password',
      displayName: 'Admin Password',
      type: 'string',
      description: 'The administrator password (use a variable for security)',
      placeholder: 'var.admin_password',
      validation: [
        { type: 'required', message: 'Admin password is required' },
        { type: 'minLength', value: 12, message: 'Password must be at least 12 characters' },
      ],
      ui: { width: 'half', order: 6 }
    },
    {
      name: 'os_disk_caching',
      displayName: 'OS Disk Caching',
      type: 'string',
      description: 'The caching type for the OS disk',
      enum: [
        { value: 'None', label: 'None' },
        { value: 'ReadOnly', label: 'Read Only' },
        { value: 'ReadWrite', label: 'Read/Write' },
      ],
      defaultValue: 'ReadWrite',
      validation: [
        { type: 'required', message: 'OS disk caching is required' }
      ],
      ui: { width: 'half', order: 7 }
    },
    {
      name: 'os_disk_storage_account_type',
      displayName: 'OS Disk Storage Type',
      type: 'string',
      description: 'The storage account type for the OS disk',
      enum: [
        { value: 'Standard_LRS', label: 'Standard HDD (LRS)' },
        { value: 'StandardSSD_LRS', label: 'Standard SSD (LRS)' },
        { value: 'Premium_LRS', label: 'Premium SSD (LRS)' },
      ],
      defaultValue: 'StandardSSD_LRS',
      validation: [
        { type: 'required', message: 'OS disk storage type is required' }
      ],
      ui: { width: 'half', order: 8 }
    },
    {
      name: 'source_image_publisher',
      displayName: 'Image Publisher',
      type: 'string',
      description: 'The publisher of the source image',
      defaultValue: 'MicrosoftWindowsServer',
      validation: [
        { type: 'required', message: 'Image publisher is required' }
      ],
      ui: { width: 'half', order: 9 }
    },
    {
      name: 'source_image_offer',
      displayName: 'Image Offer',
      type: 'string',
      description: 'The offer of the source image',
      defaultValue: 'WindowsServer',
      validation: [
        { type: 'required', message: 'Image offer is required' }
      ],
      ui: { width: 'half', order: 10 }
    },
    {
      name: 'source_image_sku',
      displayName: 'Image SKU',
      type: 'string',
      description: 'The SKU of the source image',
      enum: [
        { value: '2019-Datacenter', label: 'Windows Server 2019 Datacenter' },
        { value: '2022-Datacenter', label: 'Windows Server 2022 Datacenter' },
        { value: '2022-datacenter-azure-edition', label: 'Windows Server 2022 Azure Edition' },
      ],
      defaultValue: '2022-Datacenter',
      validation: [
        { type: 'required', message: 'Image SKU is required' }
      ],
      ui: { width: 'half', order: 11 }
    },
    {
      name: 'source_image_version',
      displayName: 'Image Version',
      type: 'string',
      description: 'The version of the source image',
      defaultValue: 'latest',
      ui: { width: 'half', order: 12 }
    },
    {
      name: 'network_interface_ids',
      displayName: 'Network Interfaces',
      type: 'array',
      description: 'List of network interface IDs to attach to the VM',
      reference: {
        resourceType: 'azurerm_network_interface',
        property: 'id'
      },
      validation: [
        { type: 'required', message: 'At least one network interface is required' }
      ],
      ui: { width: 'full', order: 13 }
    },
    {
      name: 'tags',
      displayName: 'Tags',
      type: 'map',
      description: 'A mapping of tags to assign to the resource',
      ui: { width: 'full', order: 14, advanced: true }
    }
  ],
  required: [
    'name', 'location', 'resource_group_name', 'size',
    'admin_username', 'admin_password',
    'os_disk_caching', 'os_disk_storage_account_type',
    'source_image_publisher', 'source_image_offer', 'source_image_sku',
    'network_interface_ids'
  ],
  dependencies: [
    {
      type: 'required',
      resourceType: 'azurerm_resource_group',
      property: 'name'
    },
    {
      type: 'required',
      resourceType: 'azurerm_network_interface',
      property: 'id'
    }
  ],
  outputs: [
    {
      name: 'vm_id',
      type: 'string',
      description: 'The ID of the virtual machine',
      value: 'azurerm_windows_virtual_machine.main.id'
    },
    {
      name: 'vm_private_ip',
      type: 'string',
      description: 'The private IP address of the virtual machine',
      value: 'azurerm_windows_virtual_machine.main.private_ip_address'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_windows_virtual_machine',
    nameProperty: 'name'
  }
};
