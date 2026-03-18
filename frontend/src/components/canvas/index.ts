export { default as DesignerCanvas } from './DesignerCanvas';
export { default as ResourceNode } from './ResourceNode';
export { default as GroupNode } from './GroupNode';
export { default as ResourcePalette } from './ResourcePalette';
export { default as ResourceTree } from './ResourceTree';
export type { ResourceNodeData } from './ResourceNode';
export type { GroupNodeData } from './GroupNode';
export {
  isContainerType,
  canContain,
  CONTAINMENT_RULES,
  CONTAINER_SIZES,
  findContainerAtPosition,
  applyAutoReferences,
  buildTerraformRef,
} from './containment-rules';
