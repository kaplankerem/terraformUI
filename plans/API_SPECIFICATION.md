# TerraformUI - API Specification

## Overview

TerraformUI provides a RESTful API for managing Azure resource configurations, projects, templates, and Terraform code generation.

**Base URL**: `/api/v1`

**Content Type**: `application/json`

---

## Authentication

All API endpoints require authentication via JWT Bearer token.

```
Authorization: Bearer <token>
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout and invalidate tokens |

---

## Resources API

### List Resource Types

Returns all available Azure resource types with their schemas.

```http
GET /api/v1/resources/types
```

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `search` | string | Search by name |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "type": "azurerm_resource_group",
      "displayName": "Resource Group",
      "category": "core",
      "icon": "resource-group",
      "description": "A container that holds related resources"
    },
    {
      "type": "azurerm_virtual_network",
      "displayName": "Virtual Network",
      "category": "networking",
      "icon": "virtual-network",
      "description": "A virtual network in Azure"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "perPage": 20
  }
}
```

---

### Get Resource Schema

Returns the full schema for a specific resource type.

```http
GET /api/v1/resources/types/:type/schema
```

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Resource type identifier |

**Response**:

```json
{
  "success": true,
  "data": {
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
        "validation": [
          { "type": "required", "message": "Virtual network name is required" }
        ],
        "ui": { "width": "full", "order": 1 }
      }
    ],
    "required": ["name", "resource_group_name", "location", "address_space"],
    "outputs": [...]
  }
}
```

---

### Validate Resource Configuration

Validates a resource configuration against its schema.

```http
POST /api/v1/resources/validate
```

**Request Body**:

```json
{
  "type": "azurerm_virtual_network",
  "configuration": {
    "name": "my-vnet",
    "resource_group_name": "my-rg",
    "location": "eastus",
    "address_space": ["10.0.0.0/16"]
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": []
  }
}
```

**Error Response**:

```json
{
  "success": true,
  "data": {
    "valid": false,
    "errors": [
      {
        "property": "name",
        "message": "Virtual network name is required",
        "code": "required"
      }
    ],
    "warnings": []
  }
}
```

---

### Generate Terraform for Resource

Generates Terraform code for a single resource.

```http
POST /api/v1/resources/generate
```

**Request Body**:

```json
{
  "type": "azurerm_virtual_network",
  "name": "main",
  "configuration": {
    "name": "my-vnet",
    "resource_group_name": "my-rg",
    "location": "eastus",
    "address_space": ["10.0.0.0/16"]
  },
  "options": {
    "extractVariables": true,
    "includeProvider": true
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "files": {
      "main.tf": "terraform {\n  required_version = \">= 1.0.0\"\n...",
      "variables.tf": "variable \"vnet_name\" {\n  type = string\n...",
      "terraform.tfvars": "vnet_name = \"my-vnet\"\n..."
    },
    "variables": [
      {
        "name": "vnet_name",
        "type": "string",
        "defaultValue": "my-vnet"
      }
    ]
  }
}
```

---

## Projects API

### List Projects

Returns all projects for the authenticated user.

```http
GET /api/v1/projects
```

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `perPage` | number | Items per page |
| `search` | string | Search by name |
| `environment` | string | Filter by environment |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "proj_abc123",
      "name": "Production Infrastructure",
      "description": "Main production environment",
      "environment": "production",
      "resourceCount": 5,
      "createdAt": "2026-02-20T10:00:00Z",
      "updatedAt": "2026-02-21T08:30:00Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "perPage": 20
  }
}
```

---

### Create Project

Creates a new project.

```http
POST /api/v1/projects
```

**Request Body**:

```json
{
  "name": "Production Infrastructure",
  "description": "Main production environment",
  "environment": "production",
  "metadata": {
    "owner": "DevOps Team",
    "costCenter": "IT-001"
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "proj_abc123",
    "name": "Production Infrastructure",
    "description": "Main production environment",
    "environment": "production",
    "metadata": {
      "owner": "DevOps Team",
      "costCenter": "IT-001"
    },
    "createdAt": "2026-02-21T10:00:00Z",
    "updatedAt": "2026-02-21T10:00:00Z"
  }
}
```

---

### Get Project

Returns a single project with all resources.

```http
GET /api/v1/projects/:id
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "proj_abc123",
    "name": "Production Infrastructure",
    "description": "Main production environment",
    "environment": "production",
    "resources": [
      {
        "id": "res_xyz789",
        "type": "azurerm_resource_group",
        "name": "main",
        "configuration": {
          "name": "prod-rg",
          "location": "eastus"
        },
        "dependencies": [],
        "orderIndex": 0
      },
      {
        "id": "res_xyz790",
        "type": "azurerm_virtual_network",
        "name": "main",
        "configuration": {
          "name": "prod-vnet",
          "resource_group_name": "${azurerm_resource_group.main.name}",
          "location": "eastus",
          "address_space": ["10.0.0.0/16"]
        },
        "dependencies": ["res_xyz789"],
        "orderIndex": 1
      }
    ],
    "variables": [
      {
        "id": "var_001",
        "name": "location",
        "type": "string",
        "defaultValue": "eastus",
        "description": "Azure region for resources"
      }
    ],
    "outputs": [
      {
        "id": "out_001",
        "name": "vnet_id",
        "value": "azurerm_virtual_network.main.id",
        "description": "The ID of the virtual network"
      }
    ],
    "createdAt": "2026-02-21T10:00:00Z",
    "updatedAt": "2026-02-21T10:00:00Z"
  }
}
```

---

### Update Project

Updates project metadata.

```http
PUT /api/v1/projects/:id
```

**Request Body**:

```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "environment": "staging"
}
```

---

### Delete Project

Deletes a project and all associated resources.

```http
DELETE /api/v1/projects/:id
```

**Response**:

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

### Add Resource to Project

Adds a new resource to a project.

```http
POST /api/v1/projects/:id/resources
```

**Request Body**:

```json
{
  "type": "azurerm_virtual_network",
  "name": "main",
  "configuration": {
    "name": "my-vnet",
    "resource_group_name": "${azurerm_resource_group.main.name}",
    "location": "eastus",
    "address_space": ["10.0.0.0/16"]
  },
  "dependencies": ["res_xyz789"]
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "res_xyz790",
    "type": "azurerm_virtual_network",
    "name": "main",
    "configuration": {...},
    "dependencies": ["res_xyz789"],
    "orderIndex": 1
  }
}
```

---

### Update Resource in Project

Updates a resource configuration.

```http
PUT /api/v1/projects/:id/resources/:resourceId
```

**Request Body**:

```json
{
  "configuration": {
    "name": "updated-vnet",
    "resource_group_name": "${azurerm_resource_group.main.name}",
    "location": "westus",
    "address_space": ["10.1.0.0/16"]
  }
}
```

---

### Remove Resource from Project

Removes a resource from a project.

```http
DELETE /api/v1/projects/:id/resources/:resourceId
```

---

### Generate Project Terraform

Generates all Terraform files for a project.

```http
POST /api/v1/projects/:id/generate
```

**Request Body**:

```json
{
  "options": {
    "format": "hcl",
    "includeProvider": true,
    "includeBackend": false,
    "backendConfig": null
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "files": {
      "main.tf": "...",
      "variables.tf": "...",
      "outputs.tf": "...",
      "terraform.tfvars": "..."
    },
    "resourceCount": 5,
    "variableCount": 8,
    "outputCount": 3
  }
}
```

---

### Export Project

Exports project as a downloadable ZIP file.

```http
GET /api/v1/projects/:id/export
```

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | string | Export format: `zip` or `json` |
| `includeTfvars` | boolean | Include terraform.tfvars file |

**Response**: Binary ZIP file or JSON configuration.

---

## Templates API

### List Templates

Returns all available templates.

```http
GET /api/v1/templates
```

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `search` | string | Search by name |
| `author` | string | Filter by author |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "tpl_abc123",
      "name": "Basic Web Application",
      "description": "A basic web application with VM, VNet, and Storage",
      "category": "web-app",
      "author": "TerraformUI Team",
      "version": "1.0.0",
      "resourceCount": 5,
      "isOfficial": true,
      "createdAt": "2026-02-20T10:00:00Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "perPage": 20
  }
}
```

---

### Get Template

Returns a template with all resource configurations.

```http
GET /api/v1/templates/:id
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "tpl_abc123",
    "name": "Basic Web Application",
    "description": "A basic web application with VM, VNet, and Storage",
    "category": "web-app",
    "author": "TerraformUI Team",
    "version": "1.0.0",
    "resources": [
      {
        "type": "azurerm_resource_group",
        "name": "main",
        "configuration": {...}
      }
    ],
    "variables": [
      {
        "name": "location",
        "type": "string",
        "defaultValue": "eastus",
        "description": "Azure region"
      }
    ],
    "metadata": {
      "estimatedCost": "$50-100/month",
      "deploymentTime": "5-10 minutes"
    }
  }
}
```

---

### Create Template

Creates a new template from a project or scratch.

```http
POST /api/v1/templates
```

**Request Body**:

```json
{
  "name": "My Custom Template",
  "description": "A custom template for my team",
  "category": "custom",
  "sourceProjectId": "proj_abc123",
  "variables": [
    {
      "name": "environment",
      "type": "string",
      "defaultValue": "dev",
      "description": "Environment name"
    }
  ]
}
```

---

### Update Template

Updates an existing template.

```http
PUT /api/v1/templates/:id
```

---

### Delete Template

Deletes a template.

```http
DELETE /api/v1/templates/:id
```

---

### Instantiate Template

Creates a new project from a template.

```http
POST /api/v1/templates/:id/instantiate
```

**Request Body**:

```json
{
  "projectName": "My New Project",
  "description": "Created from template",
  "environment": "development",
  "variableOverrides": {
    "location": "westus",
    "environment": "dev"
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "projectId": "proj_new123",
    "name": "My New Project",
    "resourceCount": 5
  }
}
```

---

## Variables API

### List Project Variables

```http
GET /api/v1/projects/:id/variables
```

### Add Variable

```http
POST /api/v1/projects/:id/variables
```

**Request Body**:

```json
{
  "name": "vm_size",
  "type": "string",
  "defaultValue": "Standard_B2s",
  "description": "Size of the virtual machine",
  "isSensitive": false
}
```

### Update Variable

```http
PUT /api/v1/projects/:id/variables/:variableId
```

### Delete Variable

```http
DELETE /api/v1/projects/:id/variables/:variableId
```

---

## Outputs API

### List Project Outputs

```http
GET /api/v1/projects/:id/outputs
```

### Add Output

```http
POST /api/v1/projects/:id/outputs
```

**Request Body**:

```json
{
  "name": "vm_private_ip",
  "value": "azurerm_network_interface.main.private_ip_address",
  "description": "Private IP of the VM"
}
```

### Update Output

```http
PUT /api/v1/projects/:id/outputs/:outputId
```

### Delete Output

```http
DELETE /api/v1/projects/:id/outputs/:outputId
```

---

## Error Responses

All endpoints follow a consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `CONFLICT` | 409 | Resource conflict |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## Rate Limiting

API requests are rate limited:

| Plan | Requests/Minute | Requests/Day |
|------|-----------------|--------------|
| Free | 60 | 1,000 |
| Pro | 300 | 10,000 |
| Enterprise | Unlimited | Unlimited |

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1645449600
```

---

## WebSocket Events

Real-time updates are available via WebSocket connection.

### Connection

```
wss://api.terraformui.io/ws
```

### Events

| Event | Description |
|-------|-------------|
| `project:updated` | Project configuration changed |
| `generation:complete` | Terraform generation finished |
| `validation:complete` | Validation finished |

---

*Document Version: 1.0*
*Last Updated: 2026-02-21*
