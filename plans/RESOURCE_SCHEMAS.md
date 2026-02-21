# TerraformUI - Azure Resource Schema Definitions

## Overview

Resource schemas are the core of TerraformUI's dynamic form generation. Each Azure resource type has a JSON schema that defines:
- Available properties and their types
- Validation rules
- Default values
- UI rendering hints
- Dependencies and references

---

## Schema Structure

### Base Schema Interface

```typescript
// shared/types/resource-schema.ts

interface AzureResourceSchema {
  // Unique identifier for the resource type
  type: string;
  
  // Human-readable display name
  displayName: string;
  
  // Category for organization
  category: ResourceCategory;
  
  // Icon identifier for UI
  icon: string;
  
  // Schema version for migration support
  version: string;
  
  // Description shown in UI
  description: string;
  
  // Terraform provider version requirement
  providerVersion?: string;
  
  // Property definitions
  properties: PropertyDefinition[];
  
  // Names of required properties
  required: string[];
  
  // Output definitions
  outputs: OutputDefinition[];
  
  // Resource dependencies
  dependencies?: DependencyDefinition[];
  
  // Terraform-specific configuration
  terraformConfig: TerraformConfig;
}

type ResourceCategory = 
  | 'compute'
  | 'storage'
  | 'networking'
  | 'database'
  | 'container'
  | 'security'
  | 'monitoring'
  | 'integration';

interface PropertyDefinition {
  name: string;
  displayName: string;
  type: PropertyType;
  description?: string;
  defaultValue?: any;
  placeholder?: string;
  validation?: ValidationRule[];
  enum?: EnumOption[];
  conditional?: ConditionalRule;
  reference?: ReferenceDefinition;
  subProperties?: PropertyDefinition[];  // For nested objects
  itemProperties?: PropertyDefinition[]; // For arrays
  ui?: UIHints;
}

type PropertyType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'map';

interface ValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
}

type ValidationType = 
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'min'
  | 'max'
  | 'custom';

interface EnumOption {
  value: string;
  label: string;
  description?: string;
}

interface ConditionalRule {
  dependsOn: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'exists';
  value: any;
}

interface ReferenceDefinition {
  resourceType: string;
  property: string;
  displayProperty?: string;
}

interface OutputDefinition {
  name: string;
  type: string;
  description: string;
  value: string;  // Terraform expression
}

interface DependencyDefinition {
  type: 'required' | 'optional';
  resourceType: string;
  property: string;
}

interface UIHints {
  width?: 'full' | 'half' | 'third';
  order?: number;
  group?: string;
  advanced?: boolean;
  hidden?: boolean;
  tooltip?: string;
}

interface TerraformConfig {
  resourceType: string;
  namePrefix?: string;
  nameProperty: string;
}
```

---

## Core Resource Schemas

### 1. Resource Group

```json
{
  "type": "azurerm_resource_group",
  "displayName": "Resource Group",
  "category": "core",
  "icon": "resource-group",
  "version": "1.0.0",
  "description": "A container that holds related resources for an Azure solution",
  "properties": [
    {
      "name": "name",
      "displayName": "Resource Group Name",
      "type": "string",
      "description": "The name of the resource group",
      "placeholder": "my-resource-group",
      "validation": [
        { "type": "required", "message": "Resource group name is required" },
        { "type": "minLength", "value": 1, "message": "Name must be at least 1 character" },
        { "type": "maxLength", "value": 90, "message": "Name must be less than 90 characters" },
        { "type": "pattern", "value": "^[a-zA-Z0-9._-]+$", "message": "Name can only contain alphanumeric characters, periods, underscores, and hyphens" }
      ],
      "ui": { "width": "full", "order": 1 }
    },
    {
      "name": "location",
      "displayName": "Region",
      "type": "string",
      "description": "The Azure region where the resource group will be created",
      "enum": [
        { "value": "eastus", "label": "East US" },
        { "value": "eastus2", "label": "East US 2" },
        { "value": "westus", "label": "West US" },
        { "value": "westus2", "label": "West US 2" },
        { "value": "centralus", "label": "Central US" },
        { "value": "northeurope", "label": "North Europe" },
        { "value": "westeurope", "label": "West Europe" },
        { "value": "uksouth", "label": "UK South" },
        { "value": "ukwest", "label": "UK West" },
        { "value": "southeastasia", "label": "Southeast Asia" },
        { "value": "eastasia", "label": "East Asia" }
      ],
      "defaultValue": "eastus",
      "ui": { "width": "half", "order": 2 }
    },
    {
      "name": "tags",
      "displayName": "Tags",
      "type": "map",
      "description": "A mapping of tags to assign to the resource",
      "ui": { "width": "full", "order": 3, "advanced": true }
    }
  ],
  "required": ["name", "location"],
  "outputs": [
    {
      "name": "resource_group_id",
      "type": "string",
      "description": "The ID of the resource group",
      "value": "azurerm_resource_group.main.id"
    },
    {
      "name": "resource_group_name",
      "type": "string",
      "description": "The name of the resource group",
      "value": "azurerm_resource_group.main.name"
    }
  ],
  "terraformConfig": {
    "resourceType": "azurerm_resource_group",
    "nameProperty": "name"
  }
}
```

### 2. Virtual Network

```json
{
  "type": "azurerm_virtual_network",
  "displayName": "Virtual Network",
  "category": "networking",
  "icon": "virtual-network",
  "version": "1.0.0",
  "description": "A virtual network in Azure",
  "properties": [
    {
      "name": "name",
      "displayName": "Virtual Network Name",
      "type": "string",
      "description": "The name of the virtual network",
      "placeholder": "my-vnet",
      "validation": [
        { "type": "required", "message": "Virtual network name is required" },
        { "type": "maxLength", "value": 64, "message": "Name must be less than 64 characters" },
        { "type": "pattern", "value": "^[a-zA-Z0-9._-]+$", "message": "Name can only contain alphanumeric characters, periods, underscores, and hyphens" }
      ],
      "ui": { "width": "full", "order": 1 }
    },
    {
      "name": "resource_group_name",
      "displayName": "Resource Group",
      "type": "string",
      "description": "The resource group where the virtual network will be created",
      "reference": {
        "resourceType": "azurerm_resource_group",
        "property": "name"
      },
      "validation": [
        { "type": "required", "message": "Resource group is required" }
      ],
      "ui": { "width": "full", "order": 2 }
    },
    {
      "name": "location",
      "displayName": "Region",
      "type": "string",
      "description": "The Azure region for the virtual network",
      "reference": {
        "resourceType": "azurerm_resource_group",
        "property": "location"
      },
      "validation": [
        { "type": "required", "message": "Location is required" }
      ],
      "ui": { "width": "half", "order": 3 }
    },
    {
      "name": "address_space",
      "displayName": "Address Space",
      "type": "array",
      "description": "The address space for the virtual network",
      "itemProperties": [
        {
          "name": "cidr",
          "displayName": "CIDR Block",
          "type": "string",
          "placeholder": "10.0.0.0/16",
          "validation": [
            { "type": "pattern", "value": "^[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}/[0-9]{1,2}$", "message": "Must be a valid CIDR notation" }
          ]
        }
      ],
      "defaultValue": ["10.0.0.0/16"],
      "validation": [
        { "type": "required", "message": "At least one address space is required" }
      ],
      "ui": { "width": "full", "order": 4 }
    },
    {
      "name": "dns_servers",
      "displayName": "DNS Servers",
      "type": "array",
      "description": "List of DNS servers IP addresses",
      "itemProperties": [
        {
          "name": "ip",
          "displayName": "IP Address",
          "type": "string",
          "placeholder": "8.8.8.8"
        }
      ],
      "ui": { "width": "full", "order": 5, "advanced": true }
    },
    {
      "name": "tags",
      "displayName": "Tags",
      "type": "map",
      "description": "A mapping of tags to assign to the resource",
      "ui": { "width": "full", "order": 6, "advanced": true }
    }
  ],
  "required": ["name", "resource_group_name", "location", "address_space"],
  "dependencies": [
    {
      "type": "required",
      "resourceType": "azurerm_resource_group",
      "property": "name"
    }
  ],
  "outputs": [
    {
      "name": "vnet_id",
      "type": "string",
      "description": "The ID of the virtual network",
      "value": "azurerm_virtual_network.main.id"
    },
    {
      "name": "vnet_name",
      "type": "string",
      "description": "The name of the virtual network",
      "value": "azurerm_virtual_network.main.name"
    }
  ],
  "terraformConfig": {
    "resourceType": "azurerm_virtual_network",
    "nameProperty": "name"
  }
}
```

### 3. Subnet

```json
{
  "type": "azurerm_subnet",
  "displayName": "Subnet",
  "category": "networking",
  "icon": "subnet",
  "version": "1.0.0",
  "description": "A subnet within a virtual network",
  "properties": [
    {
      "name": "name",
      "displayName": "Subnet Name",
      "type": "string",
      "description": "The name of the subnet",
      "placeholder": "my-subnet",
      "validation": [
        { "type": "required", "message": "Subnet name is required" },
        { "type": "maxLength", "value": 80, "message": "Name must be less than 80 characters" }
      ],
      "ui": { "width": "full", "order": 1 }
    },
    {
      "name": "resource_group_name",
      "displayName": "Resource Group",
      "type": "string",
      "description": "The resource group where the subnet will be created",
      "reference": {
        "resourceType": "azurerm_resource_group",
        "property": "name"
      },
      "validation": [
        { "type": "required", "message": "Resource group is required" }
      ],
      "ui": { "width": "full", "order": 2 }
    },
    {
      "name": "virtual_network_name",
      "displayName": "Virtual Network",
      "type": "string",
      "description": "The virtual network where the subnet will be created",
      "reference": {
        "resourceType": "azurerm_virtual_network",
        "property": "name"
      },
      "validation": [
        { "type": "required", "message": "Virtual network is required" }
      ],
      "ui": { "width": "full", "order": 3 }
    },
    {
      "name": "address_prefixes",
      "displayName": "Address Prefixes",
      "type": "array",
      "description": "The address prefixes for the subnet",
      "itemProperties": [
        {
          "name": "cidr",
          "displayName": "CIDR Block",
          "type": "string",
          "placeholder": "10.0.1.0/24"
        }
      ],
      "defaultValue": ["10.0.1.0/24"],
      "validation": [
        { "type": "required", "message": "At least one address prefix is required" }
      ],
      "ui": { "width": "full", "order": 4 }
    },
    {
      "name": "service_endpoints",
      "displayName": "Service Endpoints",
      "type": "array",
      "description": "The list of service endpoints to enable",
      "enum": [
        { "value": "Microsoft.Storage", "label": "Microsoft Storage" },
        { "value": "Microsoft.Sql", "label": "Microsoft SQL" },
        { "value": "Microsoft.KeyVault", "label": "Microsoft Key Vault" },
        { "value": "Microsoft.ServiceBus", "label": "Microsoft Service Bus" },
        { "value": "Microsoft.EventHub", "label": "Microsoft Event Hub" }
      ],
      "ui": { "width": "full", "order": 5, "advanced": true }
    }
  ],
  "required": ["name", "resource_group_name", "virtual_network_name", "address_prefixes"],
  "dependencies": [
    {
      "type": "required",
      "resourceType": "azurerm_virtual_network",
      "property": "name"
    }
  ],
  "outputs": [
    {
      "name": "subnet_id",
      "type": "string",
      "description": "The ID of the subnet",
      "value": "azurerm_subnet.main.id"
    }
  ],
  "terraformConfig": {
    "resourceType": "azurerm_subnet",
    "nameProperty": "name"
  }
}
```

### 4. Storage Account

```json
{
  "type": "azurerm_storage_account",
  "displayName": "Storage Account",
  "category": "storage",
  "icon": "storage-account",
  "version": "1.0.0",
  "description": "An Azure storage account",
  "properties": [
    {
      "name": "name",
      "displayName": "Storage Account Name",
      "type": "string",
      "description": "The name of the storage account (must be globally unique)",
      "placeholder": "mystorageaccount123",
      "validation": [
        { "type": "required", "message": "Storage account name is required" },
        { "type": "minLength", "value": 3, "message": "Name must be at least 3 characters" },
        { "type": "maxLength", "value": 24, "message": "Name must be less than 24 characters" },
        { "type": "pattern", "value": "^[a-z0-9]+$", "message": "Name can only contain lowercase letters and numbers" }
      ],
      "ui": { "width": "full", "order": 1 }
    },
    {
      "name": "resource_group_name",
      "displayName": "Resource Group",
      "type": "string",
      "description": "The resource group where the storage account will be created",
      "reference": {
        "resourceType": "azurerm_resource_group",
        "property": "name"
      },
      "validation": [
        { "type": "required", "message": "Resource group is required" }
      ],
      "ui": { "width": "full", "order": 2 }
    },
    {
      "name": "location",
      "displayName": "Region",
      "type": "string",
      "description": "The Azure region for the storage account",
      "reference": {
        "resourceType": "azurerm_resource_group",
        "property": "location"
      },
      "validation": [
        { "type": "required", "message": "Location is required" }
      ],
      "ui": { "width": "half", "order": 3 }
    },
    {
      "name": "account_tier",
      "displayName": "Performance Tier",
      "type": "string",
      "description": "The performance tier of the storage account",
      "enum": [
        { "value": "Standard", "label": "Standard", "description": "General-purpose v2 account with standard performance" },
        { "value": "Premium", "label": "Premium", "description": "High-performance storage for demanding workloads" }
      ],
      "defaultValue": "Standard",
      "ui": { "width": "half", "order": 4 }
    },
    {
      "name": "account_replication_type",
      "displayName": "Replication Type",
      "type": "string",
      "description": "The replication type for the storage account",
      "enum": [
        { "value": "LRS", "label": "Locally-redundant storage (LRS)", "description": "Lowest cost, multiple copies in one datacenter" },
        { "value": "GRS", "label": "Geo-redundant storage (GRS)", "description": "Multiple copies across two regions" },
        { "value": "RAGRS", "label": "Read-access geo-redundant storage (RA-GRS)", "description": "GRS with read access to secondary region" },
        { "value": "ZRS", "label": "Zone-redundant storage (ZRS)", "description": "Multiple copies across availability zones" },
        { "value": "GZRS", "label": "Geo-zone-redundant storage (GZRS)", "description": "ZRS with geo-replication" }
      ],
      "defaultValue": "LRS",
      "ui": { "width": "full", "order": 5 }
    },
    {
      "name": "access_tier",
      "displayName": "Access Tier",
      "type": "string",
      "description": "The access tier for the storage account",
      "enum": [
        { "value": "Hot", "label": "Hot", "description": "Optimized for frequent access" },
        { "value": "Cool", "label": "Cool", "description": "Optimized for infrequent access" }
      ],
      "defaultValue": "Hot",
      "conditional": {
        "dependsOn": "account_tier",
        "condition": "equals",
        "value": "Standard"
      },
      "ui": { "width": "half", "order": 6 }
    },
    {
      "name": "min_tls_version",
      "displayName": "Minimum TLS Version",
      "type": "string",
      "description": "The minimum TLS version for the storage account",
      "enum": [
        { "value": "TLS1_0", "label": "TLS 1.0" },
        { "value": "TLS1_1", "label": "TLS 1.1" },
        { "value": "TLS1_2", "label": "TLS 1.2" }
      ],
      "defaultValue": "TLS1_2",
      "ui": { "width": "half", "order": 7, "advanced": true }
    },
    {
      "name": "enable_https_traffic_only",
      "displayName": "Enable HTTPS Traffic Only",
      "type": "boolean",
      "description": "Enable HTTPS traffic only to the storage account",
      "defaultValue": true,
      "ui": { "width": "half", "order": 8 }
    },
    {
      "name": "tags",
      "displayName": "Tags",
      "type": "map",
      "description": "A mapping of tags to assign to the resource",
      "ui": { "width": "full", "order": 9, "advanced": true }
    }
  ],
  "required": ["name", "resource_group_name", "location", "account_tier", "account_replication_type"],
  "dependencies": [
    {
      "type": "required",
      "resourceType": "azurerm_resource_group",
      "property": "name"
    }
  ],
  "outputs": [
    {
      "name": "storage_account_id",
      "type": "string",
      "description": "The ID of the storage account",
      "value": "azurerm_storage_account.main.id"
    },
    {
      "name": "primary_blob_endpoint",
      "type": "string",
      "description": "The primary blob endpoint",
      "value": "azurerm_storage_account.main.primary_blob_endpoint"
    }
  ],
  "terraformConfig": {
    "resourceType": "azurerm_storage_account",
    "nameProperty": "name"
  }
}
```

### 5. Virtual Machine

```json
{
  "type": "azurerm_windows_virtual_machine",
  "displayName": "Windows Virtual Machine",
  "category": "compute",
  "icon": "virtual-machine",
  "version": "1.0.0",
  "description": "A Windows virtual machine in Azure",
  "properties": [
    {
      "name": "name",
      "displayName": "Virtual Machine Name",
      "type": "string",
      "description": "The name of the virtual machine",
      "placeholder": "my-vm",
      "validation": [
        { "type": "required", "message": "Virtual machine name is required" },
        { "type": "maxLength", "value": 15, "message": "Name must be less than 15 characters for Windows" },
        { "type": "pattern", "value": "^[a-zA-Z][a-zA-Z0-9-]*$", "message": "Name must start with a letter and contain only alphanumeric characters and hyphens" }
      ],
      "ui": { "width": "full", "order": 1 }
    },
    {
      "name": "resource_group_name",
      "displayName": "Resource Group",
      "type": "string",
      "description": "The resource group where the VM will be created",
      "reference": {
        "resourceType": "azurerm_resource_group",
        "property": "name"
      },
      "validation": [
        { "type": "required", "message": "Resource group is required" }
      ],
      "ui": { "width": "full", "order": 2 }
    },
    {
      "name": "location",
      "displayName": "Region",
      "type": "string",
      "description": "The Azure region for the virtual machine",
      "reference": {
        "resourceType": "azurerm_resource_group",
        "property": "location"
      },
      "validation": [
        { "type": "required", "message": "Location is required" }
      ],
      "ui": { "width": "half", "order": 3 }
    },
    {
      "name": "size",
      "displayName": "VM Size",
      "type": "string",
      "description": "The size of the virtual machine",
      "enum": [
        { "value": "Standard_B1s", "label": "Standard B1s (1 vCPU, 1GB RAM)", "description": "Entry-level for testing" },
        { "value": "Standard_B2s", "label": "Standard B2s (2 vCPU, 4GB RAM)", "description": "Small workloads" },
        { "value": "Standard_D2s_v3", "label": "Standard D2s v3 (2 vCPU, 8GB RAM)", "description": "General purpose" },
        { "value": "Standard_D4s_v3", "label": "Standard D4s v3 (4 vCPU, 16GB RAM)", "description": "Medium workloads" },
        { "value": "Standard_D8s_v3", "label": "Standard D8s v3 (8 vCPU, 32GB RAM)", "description": "Large workloads" }
      ],
      "defaultValue": "Standard_B2s",
      "ui": { "width": "full", "order": 4 }
    },
    {
      "name": "admin_username",
      "displayName": "Admin Username",
      "type": "string",
      "description": "The administrator username for the VM",
      "defaultValue": "azureadmin",
      "validation": [
        { "type": "required", "message": "Admin username is required" }
      ],
      "ui": { "width": "half", "order": 5 }
    },
    {
      "name": "admin_password",
      "displayName": "Admin Password",
      "type": "string",
      "description": "The administrator password for the VM",
      "validation": [
        { "type": "required", "message": "Admin password is required" },
        { "type": "minLength", "value": 8, "message": "Password must be at least 8 characters" }
      ],
      "ui": { "width": "half", "order": 6, "tooltip": "Password will be stored as a Terraform variable" }
    },
    {
      "name": "network_interface_ids",
      "displayName": "Network Interface",
      "type": "array",
      "description": "The network interface to attach to the VM",
      "reference": {
        "resourceType": "azurerm_network_interface",
        "property": "id"
      },
      "validation": [
        { "type": "required", "message": "At least one network interface is required" }
      ],
      "ui": { "width": "full", "order": 7 }
    },
    {
      "name": "os_disk",
      "displayName": "OS Disk Configuration",
      "type": "object",
      "description": "The OS disk configuration",
      "subProperties": [
        {
          "name": "caching",
          "displayName": "Caching",
          "type": "string",
          "enum": [
            { "value": "None", "label": "None" },
            { "value": "ReadOnly", "label": "Read Only" },
            { "value": "ReadWrite", "label": "Read Write" }
          ],
          "defaultValue": "ReadWrite"
        },
        {
          "name": "storage_account_type",
          "displayName": "Storage Type",
          "type": "string",
          "enum": [
            { "value": "Standard_LRS", "label": "Standard HDD" },
            { "value": "StandardSSD_LRS", "label": "Standard SSD" },
            { "value": "Premium_LRS", "label": "Premium SSD" }
          ],
          "defaultValue": "StandardSSD_LRS"
        },
        {
          "name": "disk_size_gb",
          "displayName": "Disk Size (GB)",
          "type": "number",
          "defaultValue": 127,
          "validation": [
            { "type": "min", "value": 30, "message": "Minimum disk size is 30 GB" }
          ]
        }
      ],
      "ui": { "width": "full", "order": 8, "group": "OS Disk" }
    },
    {
      "name": "source_image_reference",
      "displayName": "Source Image",
      "type": "object",
      "description": "The source image reference",
      "subProperties": [
        {
          "name": "publisher",
          "displayName": "Publisher",
          "type": "string",
          "defaultValue": "MicrosoftWindowsServer"
        },
        {
          "name": "offer",
          "displayName": "Offer",
          "type": "string",
          "defaultValue": "WindowsServer"
        },
        {
          "name": "sku",
          "displayName": "SKU",
          "type": "string",
          "enum": [
            { "value": "2019-Datacenter", "label": "Windows Server 2019 Datacenter" },
            { "value": "2022-Datacenter", "label": "Windows Server 2022 Datacenter" }
          ],
          "defaultValue": "2022-Datacenter"
        },
        {
          "name": "version",
          "displayName": "Version",
          "type": "string",
          "defaultValue": "latest"
        }
      ],
      "ui": { "width": "full", "order": 9, "group": "Source Image" }
    },
    {
      "name": "tags",
      "displayName": "Tags",
      "type": "map",
      "description": "A mapping of tags to assign to the resource",
      "ui": { "width": "full", "order": 10, "advanced": true }
    }
  ],
  "required": ["name", "resource_group_name", "location", "size", "admin_username", "admin_password", "network_interface_ids"],
  "dependencies": [
    {
      "type": "required",
      "resourceType": "azurerm_resource_group",
      "property": "name"
    },
    {
      "type": "required",
      "resourceType": "azurerm_network_interface",
      "property": "id"
    }
  ],
  "outputs": [
    {
      "name": "vm_id",
      "type": "string",
      "description": "The ID of the virtual machine",
      "value": "azurerm_windows_virtual_machine.main.id"
    },
    {
      "name": "vm_private_ip",
      "type": "string",
      "description": "The private IP address of the virtual machine",
      "value": "azurerm_network_interface.main.private_ip_address"
    }
  ],
  "terraformConfig": {
    "resourceType": "azurerm_windows_virtual_machine",
    "nameProperty": "name"
  }
}
```

---

## Schema Storage and Management

### File Structure

```
backend/src/services/resources/schemas/
├── core/
│   └── resource-group.schema.json
├── compute/
│   ├── windows-virtual-machine.schema.json
│   ├── linux-virtual-machine.schema.json
│   └── availability-set.schema.json
├── storage/
│   ├── storage-account.schema.json
│   └── storage-container.schema.json
├── networking/
│   ├── virtual-network.schema.json
│   ├── subnet.schema.json
│   ├── network-security-group.schema.json
│   ├── public-ip.schema.json
│   └── network-interface.schema.json
├── database/
│   ├── sql-server.schema.json
│   └── sql-database.schema.json
└── index.ts                    # Schema registry
```

### Schema Registry Service

```typescript
// backend/src/services/resources/schema-registry.ts

import { AzureResourceSchema } from '@shared/types/resource-schema';

class SchemaRegistry {
  private schemas: Map<string, AzureResourceSchema> = new Map();
  
  async loadSchemas(): Promise<void> {
    // Load all schema files from disk
    // Validate schema structure
    // Register in map
  }
  
  getSchema(type: string): AzureResourceSchema | undefined {
    return this.schemas.get(type);
  }
  
  getAllSchemas(): AzureResourceSchema[] {
    return Array.from(this.schemas.values());
  }
  
  getSchemasByCategory(category: string): AzureResourceSchema[] {
    return this.getAllSchemas().filter(s => s.category === category);
  }
  
  validateConfiguration(type: string, config: Record<string, any>): ValidationResult {
    const schema = this.getSchema(type);
    if (!schema) {
      return { valid: false, errors: ['Unknown resource type'] };
    }
    // Validate against schema
    return this.validateAgainstSchema(schema, config);
  }
}

export const schemaRegistry = new SchemaRegistry();
```

---

## Future Resource Expansion

### Phase 2 Resources

| Category | Resources |
|----------|-----------|
| **Compute** | Linux Virtual Machine, VM Scale Set, Availability Set |
| **Database** | Azure SQL Server, SQL Database, PostgreSQL Server, MySQL Server |
| **Container** | Container Registry, Azure Kubernetes Service |
| **Security** | Key Vault, Application Gateway |

### Phase 3 Resources

| Category | Resources |
|----------|-----------|
| **Monitoring** | Application Insights, Log Analytics Workspace |
| **Integration** | Event Hub, Service Bus, Storage Queue |
| **Identity** | Managed Identity, Azure AD Application |
| **Web** | App Service Plan, Web App, Function App |

---

*Document Version: 1.0*
*Last Updated: 2026-02-21*
