// Resource Schema Types

export type ResourceCategory =
  | 'core'
  | 'compute'
  | 'storage'
  | 'networking'
  | 'database'
  | 'container'
  | 'security'
  | 'monitoring'
  | 'integration';

export type PropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'map';

export type ValidationType =
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'min'
  | 'max'
  | 'custom';

export interface ValidationRule {
  type: ValidationType;
  value?: string | number;
  message: string;
}

export interface EnumOption {
  value: string;
  label: string;
  description?: string;
}

export interface ConditionalRule {
  dependsOn: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'exists';
  value: unknown;
}

export interface ReferenceDefinition {
  resourceType: string;
  property: string;
  displayProperty?: string;
}

export interface UIHints {
  width?: 'full' | 'half' | 'third';
  order?: number;
  group?: string;
  advanced?: boolean;
  hidden?: boolean;
  tooltip?: string;
}

export interface PropertyDefinition {
  name: string;
  displayName: string;
  type: PropertyType;
  description?: string;
  defaultValue?: unknown;
  placeholder?: string;
  validation?: ValidationRule[];
  enum?: EnumOption[];
  conditional?: ConditionalRule;
  reference?: ReferenceDefinition;
  subProperties?: PropertyDefinition[];
  itemProperties?: PropertyDefinition[];
  ui?: UIHints;
}

export interface OutputDefinition {
  name: string;
  type: string;
  description: string;
  value: string;
}

export interface DependencyDefinition {
  type: 'required' | 'optional';
  resourceType: string;
  property: string;
}

export interface TerraformConfig {
  resourceType: string;
  namePrefix?: string;
  nameProperty: string;
}

export interface AzureResourceSchema {
  type: string;
  displayName: string;
  category: ResourceCategory;
  icon: string;
  version: string;
  description: string;
  providerVersion?: string;
  properties: PropertyDefinition[];
  required: string[];
  outputs: OutputDefinition[];
  dependencies?: DependencyDefinition[];
  terraformConfig: TerraformConfig;
}

// Resource instance types
export interface Resource {
  id: string;
  type: string;
  name: string;
  configuration: Record<string, unknown>;
  dependencies?: string[];
  position?: { x: number; y: number };
}

// Variable types
export interface Variable {
  id: string;
  name: string;
  type: string;
  defaultValue?: unknown;
  description?: string;
  isSensitive?: boolean;
  mappedProperty?: string;
}

// Output types
export interface Output {
  id: string;
  name: string;
  value: string;
  description?: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  environment?: string;
  resources: Resource[];
  variables: Variable[];
  outputs: Output[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Template types
export interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  author?: string;
  version: string;
  resources: Omit<Resource, 'id'>[];
  variables: Omit<Variable, 'id'>[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
