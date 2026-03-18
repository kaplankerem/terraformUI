import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import type { ApiResponse, CreateProjectRequest, AddResourceRequest } from '@ianc/shared';

export const projectRoutes = Router();

// List all projects
projectRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, perPage = 20, search, environment } = req.query;

    const where: Record<string, unknown> = {};
    
    if (environment && typeof environment === 'string') {
      where.environment = environment;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: (Number(page) - 1) * Number(perPage),
        take: Number(perPage),
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: { resources: true }
          }
        }
      }),
      prisma.project.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      data: projects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        environment: p.environment,
        resourceCount: p._count.resources,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString()
      })),
      meta: {
        total,
        page: Number(page),
        perPage: Number(perPage)
      }
    };

    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message }
    });
  }
});

// Create a new project
projectRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, environment, metadata } = req.body as CreateProjectRequest;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Project name is required' }
      });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        environment,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    const response: ApiResponse = {
      success: true,
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        environment: project.environment,
        metadata: project.metadata ? JSON.parse(project.metadata) : null,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      }
    };

    res.status(201).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message }
    });
  }
});

// Get a single project
projectRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        resources: {
          orderBy: { orderIndex: 'asc' }
        },
        variables: true,
        outputs: true
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        environment: project.environment,
        resources: project.resources.map(r => ({
          id: r.id,
          type: r.type,
          name: r.name,
          configuration: JSON.parse(r.configuration),
          dependencies: r.dependencies ? JSON.parse(r.dependencies) : [],
          orderIndex: r.orderIndex
        })),
        variables: project.variables.map(v => ({
          id: v.id,
          name: v.name,
          type: v.type,
          defaultValue: v.defaultValue,
          description: v.description,
          isSensitive: v.isSensitive
        })),
        outputs: project.outputs.map(o => ({
          id: o.id,
          name: o.name,
          value: o.value,
          description: o.description
        })),
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      }
    };

    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message }
    });
  }
});

// Update a project
projectRoutes.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, environment, metadata } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        environment,
        metadata: metadata ? JSON.stringify(metadata) : undefined
      }
    });

    const response: ApiResponse = {
      success: true,
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        environment: project.environment,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      }
    };

    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message }
    });
  }
});

// Delete a project
projectRoutes.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message }
    });
  }
});

// Add resource to project
projectRoutes.post('/:id/resources', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, name, configuration, dependencies } = req.body as AddResourceRequest;

    if (!type || !name || !configuration) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Type, name, and configuration are required' }
      });
    }

    // Get current max order index
    const maxOrder = await prisma.resource.aggregate({
      where: { projectId: id },
      _max: { orderIndex: true }
    });

    const resource = await prisma.resource.create({
      data: {
        type,
        name,
        configuration: JSON.stringify(configuration),
        dependencies: dependencies ? JSON.stringify(dependencies) : null,
        orderIndex: (maxOrder._max.orderIndex || 0) + 1,
        projectId: id
      }
    });

    const response: ApiResponse = {
      success: true,
      data: {
        id: resource.id,
        type: resource.type,
        name: resource.name,
        configuration: JSON.parse(resource.configuration),
        dependencies: resource.dependencies ? JSON.parse(resource.dependencies) : [],
        orderIndex: resource.orderIndex
      }
    };

    res.status(201).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message }
    });
  }
});

// Remove resource from project
projectRoutes.delete('/:id/resources/:resourceId', async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;

    await prisma.resource.delete({
      where: { id: resourceId }
    });

    res.json({
      success: true,
      message: 'Resource removed successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message }
    });
  }
});

// Update resource in project
projectRoutes.put('/:id/resources/:resourceId', async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;
    const { name, configuration, dependencies } = req.body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (configuration !== undefined) updateData.configuration = JSON.stringify(configuration);
    if (dependencies !== undefined) updateData.dependencies = JSON.stringify(dependencies);

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: updateData
    });

    const response: ApiResponse = {
      success: true,
      data: {
        id: resource.id,
        type: resource.type,
        name: resource.name,
        configuration: JSON.parse(resource.configuration),
        dependencies: resource.dependencies ? JSON.parse(resource.dependencies) : [],
        orderIndex: resource.orderIndex
      }
    };

    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message }
    });
  }
});

// Generate Terraform for project
projectRoutes.post('/:id/generate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        resources: { orderBy: { orderIndex: 'asc' } },
        variables: true,
        outputs: true
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    // Build resource lookup map for reference resolution
    const resourceMap = new Map<string, { type: string; name: string; config: Record<string, unknown> }>();
    for (const resource of project.resources) {
      resourceMap.set(resource.id, {
        type: resource.type,
        name: resource.name,
        config: JSON.parse(resource.configuration),
      });
    }

    // Topological sort: resource groups first, then VNets, subnets, then rest
    const typeOrder: Record<string, number> = {
      'azurerm_resource_group': 0,
      'azurerm_virtual_network': 1,
      'azurerm_subnet': 2,
      'azurerm_network_security_group': 3,
      'azurerm_public_ip': 3,
      'azurerm_storage_account': 3,
      'azurerm_key_vault': 3,
      'azurerm_container_registry': 3,
      'azurerm_service_plan': 3,
      'azurerm_mssql_server': 3,
      'azurerm_log_analytics_workspace': 3,
      'azurerm_application_insights': 4,
      'azurerm_network_interface': 4,
      'azurerm_windows_virtual_machine': 5,
      'azurerm_linux_web_app': 5,
      'azurerm_mssql_database': 5,
    };

    const sortedResources = [...project.resources].sort((a, b) => {
      const orderA = typeOrder[a.type] ?? 10;
      const orderB = typeOrder[b.type] ?? 10;
      return orderA - orderB;
    });

    // Generate Terraform files
    const lines: string[] = [];

    // Header
    lines.push('# Generated by IaNC (Infrastructure as No-Code)');
    lines.push(`# Generated at: ${new Date().toISOString()}`);
    lines.push('');

    // Terraform block
    lines.push('terraform {');
    lines.push('  required_version = ">= 1.0.0"');
    lines.push('');
    lines.push('  required_providers {');
    lines.push('    azurerm = {');
    lines.push('      source  = "hashicorp/azurerm"');
    lines.push('      version = "~> 3.0"');
    lines.push('    }');
    lines.push('  }');
    lines.push('}');
    lines.push('');

    // Provider block
    lines.push('provider "azurerm" {');
    lines.push('  features {}');
    lines.push('}');
    lines.push('');

    // Generate locals block for resource name references
    const resourceNames = new Map<string, string>();
    for (const resource of sortedResources) {
      resourceNames.set(resource.id, resource.name);
    }

    // Resources with proper references and depends_on
    for (const resource of sortedResources) {
      const config = JSON.parse(resource.configuration);
      const dependsOn: string[] = [];

      lines.push(`resource "${resource.type}" "${resource.name}" {`);

      const processedConfig = groupNestedProperties(config, resource.type);
      for (const [key, value] of Object.entries(processedConfig)) {
        if (value === undefined || value === null) continue;

        if (typeof value === 'object' && !Array.isArray(value)) {
          // Emit as a nested Terraform block
          lines.push('');
          lines.push(`  ${key} {`);
          for (const [subKey, subValue] of Object.entries(value as Record<string, unknown>)) {
            if (subValue === undefined || subValue === null) continue;
            if (typeof subValue === 'string' && subValue.startsWith('${') && subValue.endsWith('}')) {
              lines.push(`    ${subKey} = ${subValue.slice(2, -1)}`);
            } else {
              lines.push(`    ${subKey} = ${formatValue(subValue, 4)}`);
            }
          }
          lines.push('  }');
        } else if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
          const ref = value.slice(2, -1);
          lines.push(`  ${key} = ${ref}`);
          const parts = ref.split('.');
          if (parts.length >= 2) {
            const depRef = `${parts[0]}.${parts[1]}`;
            if (!dependsOn.includes(depRef)) {
              dependsOn.push(depRef);
            }
          }
        } else {
          lines.push(`  ${key} = ${formatValue(value)}`);
        }
      }

      // Add depends_on from parent resource (visual containment)
      if (resource.dependencies) {
        try {
          const deps = JSON.parse(resource.dependencies);
          if (deps.parentResourceId) {
            const parent = resourceMap.get(deps.parentResourceId);
            if (parent) {
              const depRef = `${parent.type}.${parent.name}`;
              if (!dependsOn.includes(depRef)) {
                dependsOn.push(depRef);
              }
            }
          }
        } catch {
          // Ignore invalid JSON in dependencies
        }
      }

      // Emit depends_on block if there are dependencies
      if (dependsOn.length > 0) {
        lines.push('');
        lines.push(`  depends_on = [${dependsOn.join(', ')}]`);
      }

      lines.push('}');
      lines.push('');
    }

    // Variables
    if (project.variables.length > 0) {
      lines.push('# Variables');
      for (const variable of project.variables) {
        lines.push(`variable "${variable.name}" {`);
        lines.push(`  type = ${variable.type}`);
        if (variable.description) {
          lines.push(`  description = "${variable.description}"`);
        }
        if (variable.defaultValue) {
          lines.push(`  default = ${formatValue(JSON.parse(variable.defaultValue))}`);
        }
        lines.push('}');
        lines.push('');
      }
    }

    // Outputs
    if (project.outputs.length > 0) {
      lines.push('# Outputs');
      for (const output of project.outputs) {
        lines.push(`output "${output.name}" {`);
        lines.push(`  value = ${output.value}`);
        if (output.description) {
          lines.push(`  description = "${output.description}"`);
        }
        lines.push('}');
        lines.push('');
      }
    }

    const response: ApiResponse = {
      success: true,
      data: {
        files: {
          'main.tf': lines.join('\n')
        },
        resourceCount: project.resources.length,
        variableCount: project.variables.length,
        outputCount: project.outputs.length
      }
    };

    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message }
    });
  }
});

// Group flat properties into nested Terraform blocks
// e.g. os_disk_caching, os_disk_storage_account_type -> os_disk { caching = ... }
function groupNestedProperties(config: Record<string, unknown>, resourceType: string): Record<string, unknown> {
  if (resourceType !== 'azurerm_windows_virtual_machine' && resourceType !== 'azurerm_linux_virtual_machine') {
    return config;
  }
  
  const result: Record<string, unknown> = {};
  const osDisk: Record<string, unknown> = {};
  const sourceImage: Record<string, unknown> = {};
  const ipConfig: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(config)) {
    if (key.startsWith('os_disk_')) {
      osDisk[key.replace('os_disk_', '')] = value;
    } else if (key.startsWith('source_image_')) {
      sourceImage[key.replace('source_image_', '')] = value;
    } else if (key.startsWith('ip_configuration_')) {
      ipConfig[key.replace('ip_configuration_', '')] = value;
    } else {
      result[key] = value;
    }
  }
  
  if (Object.keys(osDisk).length > 0) {
    result['os_disk'] = osDisk;
  }
  if (Object.keys(sourceImage).length > 0) {
    result['source_image_reference'] = sourceImage;
  }
  if (Object.keys(ipConfig).length > 0) {
    result['ip_configuration'] = ipConfig;
  }
  
  return result;
}

// Helper function to format values
function formatValue(value: unknown, indent: number = 2): string {
  const pad = ' '.repeat(indent);
  const innerPad = ' '.repeat(indent + 2);
  
  if (typeof value === 'string') {
    if (value.startsWith('${') && value.endsWith('}')) {
      return value.slice(2, -1);
    }
    if (value.startsWith('var.')) {
      return value;
    }
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    // Check if items are simple (strings/numbers) or complex (objects)
    if (value.every(v => typeof v !== 'object' || v === null)) {
      const items = value.map(v => formatValue(v, indent));
      return `[${items.join(', ')}]`;
    }
    // Array of objects — each becomes a block
    return value.map(v => `{\n${Object.entries(v as Record<string, unknown>).map(
      ([k, val]) => `${innerPad}${k} = ${formatValue(val, indent + 2)}`
    ).join('\n')}\n${pad}}`).join('\n');
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return `{\n${entries.map(
      ([k, v]) => `${innerPad}${k} = ${formatValue(v, indent + 2)}`
    ).join('\n')}\n${pad}}`;
  }
  return String(value);
}
