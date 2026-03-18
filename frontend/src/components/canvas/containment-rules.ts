import type { Node } from '@xyflow/react';

// Containment rules: which resource types can visually contain which
// Models real Azure hierarchy:
//   Resource Group > VNet > Subnet > NIC/WebApp
//   Resource Group > SQL Server > SQL Database
//   Resource Group > Service Plan > Web App
export const CONTAINMENT_RULES: Record<string, string[]> = {
  'azurerm_resource_group': [
    'azurerm_virtual_network',
    'azurerm_storage_account',
    'azurerm_network_security_group',
    'azurerm_public_ip',
    'azurerm_network_interface',
    'azurerm_service_plan',
    'azurerm_linux_web_app',
    'azurerm_mssql_server',
    'azurerm_application_insights',
    'azurerm_log_analytics_workspace',
    'azurerm_windows_virtual_machine',
    'azurerm_key_vault',
    'azurerm_container_registry',
  ],
  'azurerm_virtual_network': [
    'azurerm_subnet',
  ],
  'azurerm_subnet': [
    'azurerm_network_interface',
    'azurerm_linux_web_app',
    'azurerm_windows_virtual_machine',
  ],
  'azurerm_mssql_server': [
    'azurerm_mssql_database',
  ],
  'azurerm_service_plan': [
    'azurerm_linux_web_app',
  ],
};

// Auto-reference bindings: when a child is dropped into a container,
// automatically set the specified config field to a Terraform reference.
// Key = child resource type, value = map of parent type → binding info.
// Each binding matches the real Terraform provider's property names and types.
export const AUTO_REFERENCE_BINDINGS: Record<string, Record<string, {
  configField: string;
  referenceProperty: 'name' | 'id';
}>> = {
  'azurerm_virtual_network': {
    'azurerm_resource_group': {
      configField: 'resource_group_name',
      referenceProperty: 'name',
    },
  },
  'azurerm_subnet': {
    'azurerm_virtual_network': {
      configField: 'virtual_network_name',
      referenceProperty: 'name',
    },
    'azurerm_resource_group': {
      configField: 'resource_group_name',
      referenceProperty: 'name',
    },
  },
  'azurerm_storage_account': {
    'azurerm_resource_group': {
      configField: 'resource_group_name',
      referenceProperty: 'name',
    },
  },
  'azurerm_network_security_group': {
    'azurerm_resource_group': {
      configField: 'resource_group_name',
      referenceProperty: 'name',
    },
  },
  'azurerm_public_ip': {
    'azurerm_resource_group': {
      configField: 'resource_group_name',
      referenceProperty: 'name',
    },
  },
  'azurerm_network_interface': {
    'azurerm_subnet': {
      configField: 'subnet_id',
      referenceProperty: 'id',
    },
    'azurerm_resource_group': {
      configField: 'resource_group_name',
      referenceProperty: 'name',
    },
  },
  'azurerm_service_plan': {
    'azurerm_resource_group': {
      configField: 'resource_group_name',
      referenceProperty: 'name',
    },
  },
  'azurerm_linux_web_app': {
    'azurerm_service_plan': {
      configField: 'service_plan_id',
      referenceProperty: 'id',
    },
    'azurerm_resource_group': {
      configField: 'resource_group_name',
      referenceProperty: 'name',
    },
  },
  'azurerm_mssql_server': {
    'azurerm_resource_group': {
      configField: 'resource_group_name',
      referenceProperty: 'name',
    },
  },
  'azurerm_mssql_database': {
    'azurerm_mssql_server': {
      configField: 'server_id',
      referenceProperty: 'id',
    },
    // Note: azurerm_mssql_database does NOT have resource_group_name -
    // it inherits from its parent SQL Server via server_id
  },
  'azurerm_application_insights': {
    'azurerm_resource_group': {
      configField: 'resource_group_name',
      referenceProperty: 'name',
    },
  },
  'azurerm_log_analytics_workspace': {
    'azurerm_resource_group': {
      configField: 'resource_group_name',
      referenceProperty: 'name',
    },
  },
  'azurerm_windows_virtual_machine': {
    'azurerm_resource_group': {
      configField: 'resource_group_name',
      referenceProperty: 'name',
    },
  },
  'azurerm_key_vault': {
    'azurerm_resource_group': {
      configField: 'resource_group_name',
      referenceProperty: 'name',
    },
  },
  'azurerm_container_registry': {
    'azurerm_resource_group': {
      configField: 'resource_group_name',
      referenceProperty: 'name',
    },
  },
};

export function canContain(parentType: string, childType: string): boolean {
  return CONTAINMENT_RULES[parentType]?.includes(childType) ?? false;
}

export function isContainerType(type: string): boolean {
  return type in CONTAINMENT_RULES;
}

// Default dimensions for container nodes
export const CONTAINER_SIZES: Record<string, { width: number; height: number }> = {
  'azurerm_resource_group': { width: 650, height: 500 },
  'azurerm_virtual_network': { width: 480, height: 350 },
  'azurerm_subnet': { width: 350, height: 250 },
  'azurerm_mssql_server': { width: 380, height: 280 },
  'azurerm_service_plan': { width: 380, height: 280 },
};

// Build a Terraform reference expression: ${azurerm_resource_group.rg-1.name}
export function buildTerraformRef(parentType: string, parentNodeId: string, property: string): string {
  const sanitizedName = parentNodeId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `\${${parentType}.${sanitizedName}.${property}}`;
}

// Find the deepest container node at a given position
export function findContainerAtPosition(
  nodes: Node[],
  position: { x: number; y: number },
  childType: string
): Node | null {
  // Filter to container nodes that can hold this child type
  const candidates = nodes.filter(n => {
    const nodeType = (n.data as { type: string }).type;
    return isContainerType(nodeType) && canContain(nodeType, childType);
  });

  // Check which containers the position falls inside, accounting for absolute position
  const hits = candidates.filter(n => {
    const absPos = getAbsolutePosition(n, nodes);
    const w = (n.measured?.width ?? n.width ?? (n.style as Record<string, number>)?.width) || 400;
    const h = (n.measured?.height ?? n.height ?? (n.style as Record<string, number>)?.height) || 300;
    return (
      position.x >= absPos.x &&
      position.x <= absPos.x + w &&
      position.y >= absPos.y &&
      position.y <= absPos.y + h
    );
  });

  if (hits.length === 0) return null;

  // Prefer deepest (smallest area) container
  hits.sort((a, b) => {
    const aW = (a.measured?.width ?? a.width ?? (a.style as Record<string, number>)?.width) || 400;
    const aH = (a.measured?.height ?? a.height ?? (a.style as Record<string, number>)?.height) || 300;
    const bW = (b.measured?.width ?? b.width ?? (b.style as Record<string, number>)?.width) || 400;
    const bH = (b.measured?.height ?? b.height ?? (b.style as Record<string, number>)?.height) || 300;
    return (aW * aH) - (bW * bH);
  });

  return hits[0];
}

// Get absolute position of a node (accounting for parent chain)
function getAbsolutePosition(node: Node, allNodes: Node[]): { x: number; y: number } {
  let x = node.position.x;
  let y = node.position.y;
  let current = node;

  while (current.parentId) {
    const parent = allNodes.find(n => n.id === current.parentId);
    if (!parent) break;
    x += parent.position.x;
    y += parent.position.y;
    current = parent;
  }

  return { x, y };
}

// Apply auto-references when nesting a child into a container
// Walks up the parent chain to bind all applicable references
export function applyAutoReferences(
  childConfig: Record<string, unknown>,
  childType: string,
  parentNode: Node,
  allNodes: Node[]
): Record<string, unknown> {
  const updated = { ...childConfig };
  const bindings = AUTO_REFERENCE_BINDINGS[childType];
  if (!bindings) return updated;

  let current: Node | undefined = parentNode;
  while (current) {
    const currentType = (current.data as { type: string }).type;
    const binding = bindings[currentType];
    if (binding) {
      updated[binding.configField] = buildTerraformRef(
        currentType,
        current.id,
        binding.referenceProperty
      );
    }
    current = current.parentId
      ? allNodes.find(n => n.id === current!.parentId)
      : undefined;
  }

  return updated;
}
