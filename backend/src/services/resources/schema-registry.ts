import type { AzureResourceSchema, PropertyDefinition, ValidationRule } from '@ianc/shared';
import { resourceGroupSchema } from './schemas/resource-group';
import { virtualNetworkSchema } from './schemas/virtual-network';
import { subnetSchema } from './schemas/subnet';
import { storageAccountSchema } from './schemas/storage-account';
import { networkSecurityGroupSchema } from './schemas/network-security-group';
import { publicIpSchema } from './schemas/public-ip';
import { networkInterfaceSchema } from './schemas/network-interface';
import { servicePlanSchema } from './schemas/service-plan';
import { linuxWebAppSchema } from './schemas/linux-web-app';
import { mssqlServerSchema } from './schemas/mssql-server';
import { mssqlDatabaseSchema } from './schemas/mssql-database';
import { applicationInsightsSchema } from './schemas/application-insights';
import { logAnalyticsWorkspaceSchema } from './schemas/log-analytics-workspace';
import { windowsVirtualMachineSchema } from './schemas/windows-virtual-machine';
import { keyVaultSchema } from './schemas/key-vault';
import { containerRegistrySchema } from './schemas/container-registry';

class SchemaRegistry {
  private schemas: Map<string, AzureResourceSchema> = new Map();

  constructor() {
    // Register built-in schemas
    this.register(resourceGroupSchema);
    this.register(virtualNetworkSchema);
    this.register(subnetSchema);
    this.register(storageAccountSchema);
    this.register(networkSecurityGroupSchema);
    this.register(publicIpSchema);
    this.register(networkInterfaceSchema);
    this.register(servicePlanSchema);
    this.register(linuxWebAppSchema);
    this.register(mssqlServerSchema);
    this.register(mssqlDatabaseSchema);
    this.register(applicationInsightsSchema);
    this.register(logAnalyticsWorkspaceSchema);
    this.register(windowsVirtualMachineSchema);
    this.register(keyVaultSchema);
    this.register(containerRegistrySchema);
  }

  register(schema: AzureResourceSchema): void {
    this.schemas.set(schema.type, schema);
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

  validateConfiguration(
    type: string,
    config: Record<string, unknown>
  ): { valid: boolean; errors: Array<{ property: string; message: string; code: string }>; warnings: Array<{ property: string; message: string; code: string }> } {
    const schema = this.getSchema(type);
    
    if (!schema) {
      return {
        valid: false,
        errors: [{ property: 'type', message: `Unknown resource type: ${type}`, code: 'UNKNOWN_TYPE' }],
        warnings: []
      };
    }

    const errors: Array<{ property: string; message: string; code: string }> = [];
    const warnings: Array<{ property: string; message: string; code: string }> = [];

    // Check required properties
    for (const requiredProp of schema.required) {
      if (!(requiredProp in config) || config[requiredProp] === undefined || config[requiredProp] === '') {
        errors.push({
          property: requiredProp,
          message: `${requiredProp} is required`,
          code: 'REQUIRED'
        });
      }
    }

    // Validate each property
    for (const [key, value] of Object.entries(config)) {
      const propDef = schema.properties.find(p => p.name === key);
      
      if (!propDef) {
        warnings.push({
          property: key,
          message: `Unknown property: ${key}`,
          code: 'UNKNOWN_PROPERTY'
        });
        continue;
      }

      const propErrors = this.validateProperty(key, value, propDef);
      errors.push(...propErrors);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateProperty(
    name: string,
    value: unknown,
    propDef: PropertyDefinition
  ): Array<{ property: string; message: string; code: string }> {
    const errors: Array<{ property: string; message: string; code: string }> = [];

    if (!propDef.validation) {
      return errors;
    }

    for (const rule of propDef.validation) {
      if (!this.checkValidationRule(value, rule)) {
        errors.push({
          property: name,
          message: rule.message,
          code: rule.type
        });
      }
    }

    return errors;
  }

  private checkValidationRule(value: unknown, rule: ValidationRule): boolean {
    switch (rule.type) {
      case 'required':
        return value !== undefined && value !== null && value !== '';
      case 'minLength':
        return typeof value === 'string' && value.length >= (rule.value as number);
      case 'maxLength':
        return typeof value === 'string' && value.length <= (rule.value as number);
      case 'pattern':
        return typeof value === 'string' && new RegExp(rule.value as string).test(value);
      case 'min':
        return typeof value === 'number' && value >= (rule.value as number);
      case 'max':
        return typeof value === 'number' && value <= (rule.value as number);
      default:
        return true;
    }
  }
}

export const schemaRegistry = new SchemaRegistry();
