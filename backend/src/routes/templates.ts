import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import type { ApiResponse, CreateTemplateRequest, InstantiateTemplateRequest } from '@terraformui/shared';

export const templateRoutes = Router();

// List all templates
templateRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, author } = req.query;

    const where: Record<string, unknown> = {};

    if (category && typeof category === 'string') {
      where.category = category;
    }

    if (author && typeof author === 'string') {
      where.author = author;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { resources: true }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: templates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        author: t.author,
        version: t.version,
        resourceCount: t._count.resources,
        createdAt: t.createdAt.toISOString()
      }))
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

// Get a single template
templateRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        resources: {
          orderBy: { orderIndex: 'asc' }
        },
        variables: true
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' }
      });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        author: template.author,
        version: template.version,
        resources: template.resources.map(r => ({
          type: r.type,
          name: r.name,
          configuration: JSON.parse(r.configuration)
        })),
        variables: template.variables.map(v => ({
          name: v.name,
          type: v.type,
          defaultValue: v.defaultValue,
          description: v.description
        })),
        metadata: template.metadata ? JSON.parse(template.metadata) : null
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

// Create a template
templateRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, category, sourceProjectId, variables } = req.body as CreateTemplateRequest;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name and category are required' }
      });
    }

    let resources: Array<{ type: string; name: string; configuration: string; orderIndex: number }> = [];
    let templateVariables: Array<{ name: string; type: string; defaultValue: string | null; description: string | null }> = [];

    // If sourceProjectId is provided, copy resources from project
    if (sourceProjectId) {
      const project = await prisma.project.findUnique({
        where: { id: sourceProjectId },
        include: {
          resources: { orderBy: { orderIndex: 'asc' } },
          variables: true
        }
      });

      if (project) {
        resources = project.resources.map(r => ({
          type: r.type,
          name: r.name,
          configuration: r.configuration,
          orderIndex: r.orderIndex
        }));

        templateVariables = project.variables.map(v => ({
          name: v.name,
          type: v.type,
          defaultValue: v.defaultValue,
          description: v.description
        }));
      }
    }

    // Override with provided variables
    if (variables && variables.length > 0) {
      templateVariables = variables.map(v => ({
        name: v.name,
        type: v.type,
        defaultValue: v.defaultValue ? String(v.defaultValue) : null,
        description: v.description || null
      }));
    }

    const template = await prisma.template.create({
      data: {
        name,
        description,
        category,
        resources: {
          create: resources
        },
        variables: {
          create: templateVariables
        }
      },
      include: {
        resources: true,
        variables: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        version: template.version
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

// Instantiate template (create project from template)
templateRoutes.post('/:id/instantiate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { projectName, description, environment, variableOverrides } = req.body as InstantiateTemplateRequest;

    if (!projectName) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Project name is required' }
      });
    }

    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        resources: { orderBy: { orderIndex: 'asc' } },
        variables: true
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' }
      });
    }

    // Create project from template
    const project = await prisma.project.create({
      data: {
        name: projectName,
        description: description || template.description,
        environment,
        resources: {
          create: template.resources.map(r => {
            let config = JSON.parse(r.configuration);
            
            // Apply variable overrides to configuration
            if (variableOverrides) {
              config = { ...config, ...variableOverrides };
            }
            
            return {
              type: r.type,
              name: r.name,
              configuration: JSON.stringify(config),
              orderIndex: r.orderIndex
            };
          })
        },
        variables: {
          create: template.variables.map(v => ({
            name: v.name,
            type: v.type,
            defaultValue: variableOverrides?.[v.name] !== undefined 
              ? String(variableOverrides[v.name]) 
              : v.defaultValue,
            description: v.description,
            isSensitive: false
          }))
        }
      },
      include: {
        resources: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: {
        projectId: project.id,
        name: project.name,
        resourceCount: project.resources.length
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

// Delete a template
templateRoutes.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.template.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message }
    });
  }
});
