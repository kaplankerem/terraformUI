import type { Node, Edge } from '@xyflow/react';

/**
 * Generates a Mermaid diagram from React Flow nodes and edges.
 * Container nodes (with children) become subgraphs.
 */
export function generateMermaid(nodes: Node[], edges: Edge[]): string {
  const lines: string[] = ['graph TD'];

  const childrenOf = (parentId: string) =>
    nodes.filter(n => n.parentId === parentId);

  const rootNodes = nodes.filter(n => !n.parentId);

  function sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  function getLabel(node: Node): string {
    const data = node.data as { label?: string; type?: string };
    const label = data.label || node.id;
    const type = (data.type || '').replace('azurerm_', '').replace(/_/g, ' ');
    return `${label}<br/><i>${type}</i>`;
  }

  function renderNode(node: Node, indent: string) {
    const id = sanitizeId(node.id);
    lines.push(`${indent}${id}["${getLabel(node)}"]`);
  }

  function renderSubgraph(parent: Node, indent: string) {
    const id = sanitizeId(parent.id);
    const data = parent.data as { label?: string; type?: string };
    const label = data.label || parent.id;
    const type = (data.type || '').replace('azurerm_', '').replace(/_/g, ' ');

    lines.push(`${indent}subgraph ${id}["${label} (${type})"]`);

    const children = childrenOf(parent.id);
    for (const child of children) {
      if (childrenOf(child.id).length > 0) {
        renderSubgraph(child, indent + '  ');
      } else {
        renderNode(child, indent + '  ');
      }
    }

    lines.push(`${indent}end`);
  }

  for (const node of rootNodes) {
    if (childrenOf(node.id).length > 0) {
      renderSubgraph(node, '  ');
    } else {
      renderNode(node, '  ');
    }
  }

  // Render edges
  for (const edge of edges) {
    const source = sanitizeId(edge.source);
    const target = sanitizeId(edge.target);
    lines.push(`  ${source} --> ${target}`);
  }

  return lines.join('\n');
}
