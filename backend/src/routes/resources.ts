import { Router, Request, Response } from 'express';
import { schemaRegistry } from '../services/resources/schema-registry';
import { terraformGenerator } from '../services/generator';
import type { ApiResponse, ValidateResourceRequest, GenerateResourceRequest } from '@ianc/shared';

export const resourceRoutes = Router();

// Get all resource types
resourceRoutes.get('/types', (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    
    let types = schemaRegistry.getAllSchemas().map(schema => ({
      type: schema.type,
      displayName: schema.displayName,
      category: schema.category,
      icon: schema.icon,
      description: schema.description
    }));

    // Filter by category
    if (category && typeof category === 'string') {
      types = types.filter(t => t.category === category);
    }

    // Search filter
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      types = types.filter(t => 
        t.displayName.toLowerCase().includes(searchLower) ||
        t.type.toLowerCase().includes(searchLower)
      );
    }

    const response: ApiResponse = {
      success: true,
      data: types,
      meta: {
        total: types.length
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

// Get resource schema
resourceRoutes.get('/types/:type/schema', (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const schema = schemaRegistry.getSchema(type);

    if (!schema) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Resource type '${type}' not found` }
      });
    }

    const response: ApiResponse = {
      success: true,
      data: schema
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

// Validate resource configuration
resourceRoutes.post('/validate', (req: Request, res: Response) => {
  try {
    const { type, configuration } = req.body as ValidateResourceRequest;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Resource type is required' }
      });
    }

    const result = schemaRegistry.validateConfiguration(type, configuration || {});

    const response: ApiResponse = {
      success: true,
      data: result
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

// Generate Terraform for a single resource
resourceRoutes.post('/generate', async (req: Request, res: Response) => {
  try {
    const { type, name, configuration, options } = req.body as GenerateResourceRequest;
    
    if (!type || !name || !configuration) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Type, name, and configuration are required' }
      });
    }

    // Validate configuration first
    const validationResult = schemaRegistry.validateConfiguration(type, configuration);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Configuration validation failed',
          details: validationResult.errors.map(e => ({
            field: e.property,
            message: e.message
          }))
        }
      });
    }

    // Generate Terraform
    const result = await terraformGenerator.generateSingle(type, name, configuration, options);

    const response: ApiResponse = {
      success: true,
      data: result
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
