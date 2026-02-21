import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { schemaRegistry } from '../services/resources/schema-registry';
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

    // Resources
    for (const resource of project.resources) {
      const config = JSON.parse(resource.configuration);
      const schema = schemaRegistry.getSchema(resource.type);
      
      lines.push(`resource "${resource.type}" "${resource.name}" {`);
      
      for (const [key, value] of Object.entries(config)) {
        if (value !== undefined && value !== null) {
          const formattedValue = formatValue(value);
          lines.push(`  ${key} = ${formattedValue}`);
        }
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

// Helper function to format values
function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    if (value.startsWith('${') && value.endsWith('}')) {
      return value.slice(2, -1);
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
    const items = value.map(v => formatValue(v));
    return `[${items.join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value).map(
      ([k, v]) => `    ${k} = ${formatValue(v)}`
    );
    return `{\n${entries.join('\n')}\n  }`;
  }
  return String(value);
}
