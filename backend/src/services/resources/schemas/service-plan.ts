import type { AzureResourceSchema } from '@ianc/shared';
import { AZURE_REGIONS } from '@ianc/shared';

export const servicePlanSchema: AzureResourceSchema = {
  type: 'azurerm_service_plan',
  displayName: 'App Service Plan',
  category: 'compute',
  icon: 'service-plan',
  version: '1.0.0',
  description: 'An App Service Plan defines compute resources for a web app to run on',
  properties: [
    {
      name: 'name',
      displayName: 'Plan Name',
      type: 'string',
      description: 'The name of the App Service Plan',
      placeholder: 'asp-myapp-001',
      validation: [
        { type: 'required', message: 'Plan name is required' },
        { type: 'minLength', value: 1, message: 'Name must be at least 1 character' },
        { type: 'maxLength', value: 60, message: 'Name must be less than 60 characters' },
      ],
      ui: { width: 'full', order: 1 }
    },
    {
      name: 'resource_group_name',
      displayName: 'Resource Group',
      type: 'string',
      description: 'The resource group where the plan will be created',
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
      description: 'The Azure region for the plan',
      enum: AZURE_REGIONS.map(r => ({ value: r.value, label: r.label })),
      defaultValue: 'eastus',
      validation: [
        { type: 'required', message: 'Location is required' }
      ],
      ui: { width: 'half', order: 3 }
    },
    {
      name: 'os_type',
      displayName: 'Operating System',
      type: 'string',
      description: 'The operating system type for the plan',
      enum: [
        { value: 'Linux', label: 'Linux' },
        { value: 'Windows', label: 'Windows' },
      ],
      defaultValue: 'Linux',
      validation: [
        { type: 'required', message: 'OS type is required' }
      ],
      ui: { width: 'half', order: 4 }
    },
    {
      name: 'sku_name',
      displayName: 'Pricing Tier',
      type: 'string',
      description: 'The SKU for the plan (e.g., F1=Free, B1=Basic, S1=Standard, P1v3=Premium)',
      enum: [
        { value: 'F1', label: 'Free (F1)', description: 'Free tier, shared infrastructure' },
        { value: 'B1', label: 'Basic (B1)', description: '1 core, 1.75 GB RAM' },
        { value: 'B2', label: 'Basic (B2)', description: '2 cores, 3.5 GB RAM' },
        { value: 'S1', label: 'Standard (S1)', description: '1 core, 1.75 GB RAM, autoscale' },
        { value: 'S2', label: 'Standard (S2)', description: '2 cores, 3.5 GB RAM, autoscale' },
        { value: 'P1v3', label: 'Premium v3 (P1v3)', description: '2 cores, 8 GB RAM' },
        { value: 'P2v3', label: 'Premium v3 (P2v3)', description: '4 cores, 16 GB RAM' },
      ],
      defaultValue: 'B1',
      validation: [
        { type: 'required', message: 'SKU is required' }
      ],
      ui: { width: 'full', order: 5 }
    },
    {
      name: 'tags',
      displayName: 'Tags',
      type: 'map',
      description: 'A mapping of tags to assign to the resource',
      ui: { width: 'full', order: 6, advanced: true }
    }
  ],
  required: ['name', 'resource_group_name', 'location', 'os_type', 'sku_name'],
  dependencies: [
    {
      type: 'required',
      resourceType: 'azurerm_resource_group',
      property: 'name'
    }
  ],
  outputs: [
    {
      name: 'service_plan_id',
      type: 'string',
      description: 'The ID of the App Service Plan',
      value: 'azurerm_service_plan.main.id'
    }
  ],
  terraformConfig: {
    resourceType: 'azurerm_service_plan',
    nameProperty: 'name'
  }
};
