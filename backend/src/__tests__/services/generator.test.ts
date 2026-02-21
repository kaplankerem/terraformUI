import { terraformGenerator } from '../../services/generator';

describe('TerraformGenerator', () => {
  describe('generateSingle', () => {
    it('should generate terraform for resource group', async () => {
      const result = await terraformGenerator.generateSingle(
        'azurerm_resource_group',
        'test-rg',
        {
          name: 'test-resource-group',
          location: 'eastus',
        }
      );

      expect(result.files).toBeDefined();
      expect(result.files['main.tf']).toContain('azurerm_resource_group');
      expect(result.files['main.tf']).toContain('test-rg');
      expect(result.files['main.tf']).toContain('test-resource-group');
      expect(result.files['main.tf']).toContain('eastus');
    });

    it('should generate terraform for virtual network', async () => {
      const result = await terraformGenerator.generateSingle(
        'azurerm_virtual_network',
        'test-vnet',
        {
          name: 'test-vnet',
          resource_group_name: 'test-rg',
          location: 'eastus',
          address_space: ['10.0.0.0/16'],
        }
      );

      expect(result.files).toBeDefined();
      expect(result.files['main.tf']).toContain('azurerm_virtual_network');
      expect(result.files['main.tf']).toContain('address_space');
      expect(result.files['main.tf']).toContain('10.0.0.0/16');
    });

    it('should include outputs in generated terraform', async () => {
      const result = await terraformGenerator.generateSingle(
        'azurerm_resource_group',
        'test-rg',
        {
          name: 'test-resource-group',
          location: 'eastus',
        }
      );

      expect(result.files['outputs.tf']).toBeDefined();
      expect(result.files['outputs.tf']).toContain('output');
    });

    it('should include terraform and provider blocks', async () => {
      const result = await terraformGenerator.generateSingle(
        'azurerm_resource_group',
        'test-rg',
        {
          name: 'test-resource-group',
          location: 'eastus',
        }
      );

      expect(result.files['main.tf']).toContain('terraform {');
      expect(result.files['main.tf']).toContain('provider "azurerm"');
    });

    it('should throw error for unknown resource type', async () => {
      await expect(
        terraformGenerator.generateSingle('unknown_type', 'test', {})
      ).rejects.toThrow('Unknown resource type');
    });
  });
});
