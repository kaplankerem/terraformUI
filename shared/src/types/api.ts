// API Types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface ResourceTypeSummary {
  type: string;
  displayName: string;
  category: string;
  icon: string;
  description: string;
}

// Request/Response types for Resources API
export interface ValidateResourceRequest {
  type: string;
  configuration: Record<string, unknown>;
}

export interface ValidateResourceResponse {
  valid: boolean;
  errors: Array<{
    property: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    property: string;
    message: string;
    code: string;
  }>;
}

export interface GenerateResourceRequest {
  type: string;
  name: string;
  configuration: Record<string, unknown>;
  options?: {
    extractVariables?: boolean;
    includeProvider?: boolean;
  };
}

export interface GenerateResourceResponse {
  files: Record<string, string>;
  variables: Array<{
    name: string;
    type: string;
    defaultValue?: unknown;
  }>;
}

// Request/Response types for Projects API
export interface CreateProjectRequest {
  name: string;
  description?: string;
  environment?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  environment?: string;
  metadata?: Record<string, unknown>;
}

export interface AddResourceRequest {
  type: string;
  name: string;
  configuration: Record<string, unknown>;
  dependencies?: string[];
}

export interface GenerateProjectRequest {
  options?: {
    format?: 'hcl' | 'json';
    includeProvider?: boolean;
    includeBackend?: boolean;
    backendConfig?: Record<string, unknown>;
  };
}

export interface GenerateProjectResponse {
  files: Record<string, string>;
  resourceCount: number;
  variableCount: number;
  outputCount: number;
}

// Request/Response types for Templates API
export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category: string;
  sourceProjectId?: string;
  variables?: Array<{
    name: string;
    type: string;
    defaultValue?: unknown;
    description?: string;
  }>;
}

export interface InstantiateTemplateRequest {
  projectName: string;
  description?: string;
  environment?: string;
  variableOverrides?: Record<string, unknown>;
}
