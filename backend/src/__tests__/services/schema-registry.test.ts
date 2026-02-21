import { schemaRegistry } from '../../services/resources/schema-registry';

describe('SchemaRegistry', () => {
  describe('getAllSchemas', () => {
    it('should return all registered schemas', () => {
      const schemas = schemaRegistry.getAllSchemas();
      
      expect(schemas).toBeInstanceOf(Array);
      expect(schemas.length).toBeGreaterThan(0);
    });

    it('should include resource group schema', () => {
      const schemas = schemaRegistry.getAllSchemas();
      const rgSchema = schemas.find((s) => s.type === 'azurerm_resource_group');
      
      expect(rgSchema).toBeDefined();
      expect(rgSchema?.displayName).toBe('Resource Group');
      expect(rgSchema?.category).toBe('core');
    });
  });

  describe('getSchema', () => {
    it('should return schema for valid resource type', () => {
      const schema = schemaRegistry.getSchema('azurerm_resource_group');
      
      expect(schema).toBeDefined();
      expect(schema?.type).toBe('azurerm_resource_group');
    });

    it('should return undefined for invalid resource type', () => {
      const schema = schemaRegistry.getSchema('invalid_type');
      
      expect(schema).toBeUndefined();
    });
  });

  describe('validateConfiguration', () => {
    it('should validate correct configuration', () => {
      const result = schemaRegistry.validateConfiguration('azurerm_resource_group', {
        name: 'test-rg',
        location: 'eastus',
      });
      
      expect(result.valid).toBe(true);
    });

    it('should fail for missing required fields', () => {
      const result = schemaRegistry.validateConfiguration('azurerm_resource_group', {});
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should return error for invalid resource type', () => {
      const result = schemaRegistry.validateConfiguration('invalid_type', {});
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
