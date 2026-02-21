# TerraformUI - Project Memory

> This document serves as a memory file for AI assistants (Kilo, Claude) working on this project. It captures the current state, architecture decisions, and important context for ongoing development.

---

## Project Overview

**Name:** IaNC (Infrastructure as No-Code) - TerraformUI

**Title:** A GUI-Driven Application for Generating Cloud Infrastructure with Terraform Code Automation for Azure

**Objective:** Create a GUI-driven application that allows users to design and deploy Azure cloud infrastructure resources by selecting properties through an intuitive interface, generating Terraform code without manual coding.

**Repository:** https://github.com/kaplankerem/terraformUI.git (main branch)

---

## Current Status

**Phase:** 5 Completed - Template Loading & Visual Designer Integration

**Next Phase:** 6 - Nested Resources Support

### Completed Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation | ✅ Complete |
| 2 | Core Features | ✅ Complete |
| 3 | Enhanced UX | ✅ Complete |
| 4 | Polish and Advanced Features | ✅ Complete |
| 5 | Template Loading & Visual Designer Integration | ✅ Complete |

### Active Development Servers

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000

---

## Architecture

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18+, TypeScript, Ant Design 5.x, Vite |
| Canvas | React Flow for visual resource designer |
| Backend | Node.js 20+, Express.js, TypeScript |
| Database | Prisma ORM with SQLite (dev) |
| Build | npm workspaces (monorepo) |

### Project Structure

```
terraformUI/
├── frontend/                    # React frontend (@ianc/frontend)
│   ├── src/
│   │   ├── components/
│   │   │   ├── canvas/          # DesignerCanvas, ResourceNode, ResourcePalette
│   │   │   ├── forms/           # DynamicForm
│   │   │   └── layout/          # Header, Layout
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ResourceDesigner.tsx
│   │   │   ├── VisualDesigner.tsx
│   │   │   ├── Templates.tsx
│   │   │   └── Settings.tsx
│   │   └── ...
│   └── package.json
│
├── backend/                     # Node.js backend (@ianc/backend)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── resources.ts     # Resource type schemas
│   │   │   ├── projects.ts      # Project CRUD + resources
│   │   │   └── templates.ts     # Template management
│   │   ├── services/
│   │   │   ├── generator/       # Terraform code generation
│   │   │   └── resources/
│   │   │       └── schemas/     # Azure resource schemas
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── shared/                      # Shared types (@ianc/shared)
│   ├── types/
│   └── package.json
│
└── plans/                       # Planning documents
    ├── IMPLEMENTATION_PLAN.md
    ├── ARCHITECTURE.md
    ├── RESOURCE_SCHEMAS.md
    ├── API_SPECIFICATION.md
    ├── FRONTEND_COMPONENTS.md
    └── TERRAFORM_GENERATION.md
```

---

## Key Implementation Details

### React Flow Integration

The visual designer uses React Flow for the resource canvas. Key implementation notes:

1. **Node State Management:** Uses manual `useState` instead of `useNodesState` for better prop synchronization
2. **Ref-based Tracking:** Uses `useRef` to track previous node IDs and prevent unnecessary re-renders
3. **Node Synchronization Pattern:**
   ```typescript
   const [nodes, setNodes] = useState<Node[]>([]);
   const prevInitialNodesRef = useRef<string>('');
   
   useEffect(() => {
     const newNodeIds = (initialNodes || []).map(n => n.id).sort().join(',');
     if (newNodeIds && newNodeIds !== prevInitialNodesRef.current) {
       prevInitialNodesRef.current = newNodeIds;
       setNodes(initialNodes || []);
     }
   }, [initialNodes]);
   ```

### Resource Icon Mapping

Resources use string keys for icons, not emojis. The mapping is in `ResourceNode.tsx`:

```typescript
const iconMap: Record<string, React.ReactNode> = {
  'resource-group': <ApartmentOutlined />,
  'virtual-network': <ApartmentOutlined />,
  'subnet': <ApartmentOutlined />,
  'storage-account': <DatabaseOutlined />,
  'virtual-machine': <CloudServerOutlined />,
  'nsg': <SafetyOutlined />,
  'public-ip': <GlobalOutlined />,
  'nic': <ApiOutlined />,
  'default': <CloudOutlined />,
};
```

### Azure Resource Schemas

Each Azure resource has a schema definition in `backend/src/services/resources/schemas/`. Schemas define:

- Properties with validation rules
- Required fields per Terraform provider documentation
- References to other resources (e.g., `resource_group_name`)
- Dependencies
- Outputs

**Supported Resources:**
- `azurerm_resource_group`
- `azurerm_virtual_network`
- `azurerm_subnet`
- `azurerm_storage_account`
- `azurerm_network_security_group`
- `azurerm_public_ip`
- `azurerm_network_interface`

### Template System

Templates are stored both as:
1. **Default templates** - Hardcoded in `Templates.tsx` with ID prefix `default-`
2. **Database templates** - Stored in SQLite via Prisma

Default templates must include all required Azure properties:
```typescript
{
  type: 'azurerm_virtual_network',
  name: 'main-vnet',
  configuration: {
    name: 'vnet-webapp',
    resource_group_name: 'rg-webapp-001',  // Required
    location: 'eastus',                     // Required
    address_space: ['10.0.0.0/16']
  }
}
```

### Edge Generation

Edges are generated automatically based on resource relationships:
- `resource_group_name` → connects to Resource Group
- `virtual_network_name` → connects to Virtual Network
- `subnet_id` → connects to Subnet

---

## Recent Bug Fixes

### 1. DesignerCanvas Node Synchronization
**Issue:** Nodes not updating when template resources loaded
**Fix:** Changed from `useNodesState` to manual `useState` with ref-based tracking

### 2. Icon Mapping
**Issue:** ResourceNode expecting string keys but receiving emojis
**Fix:** Updated `resourceTypeConfig` in VisualDesigner to use proper icon keys

### 3. Template Resource Configurations
**Issue:** Templates missing required Azure properties (resource_group_name, location)
**Fix:** Added all required properties per Terraform provider documentation

---

## API Endpoints

### Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/resources/types` | List all resource types |
| GET | `/api/v1/resources/types/:type/schema` | Get resource schema |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/projects` | List projects |
| POST | `/api/v1/projects` | Create project |
| GET | `/api/v1/projects/:id` | Get project with resources |
| PUT | `/api/v1/projects/:id` | Update project |
| DELETE | `/api/v1/projects/:id` | Delete project |
| POST | `/api/v1/projects/:id/resources` | Add resource |
| PUT | `/api/v1/projects/:id/resources/:resourceId` | Update resource |
| DELETE | `/api/v1/projects/:id/resources/:resourceId` | Delete resource |
| POST | `/api/v1/projects/:id/generate` | Generate Terraform |

### Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/templates` | List templates |
| POST | `/api/v1/templates` | Create template |
| POST | `/api/v1/templates/:id/instantiate` | Create project from template |

---

## Running the Project

```bash
# Install dependencies
npm install

# Run both frontend and backend
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

---

## Next Steps (Phase 6)

1. **Nested Resources Support**
   - Implement parent-child relationships in schemas
   - Update visual designer for nested nodes
   - Modify Terraform generator for nested blocks

2. **Enhanced Visual Designer**
   - Collapsible resource groups
   - Better layout algorithms
   - Zoom-to-fit functionality

3. **Additional Resource Types**
   - Azure SQL Database
   - Container Registry
   - Kubernetes Service

---

## Important Files Reference

| File | Purpose |
|------|---------|
| `frontend/src/pages/VisualDesigner.tsx` | Main visual designer page |
| `frontend/src/pages/Templates.tsx` | Template library with default templates |
| `frontend/src/components/canvas/DesignerCanvas.tsx` | React Flow canvas component |
| `frontend/src/components/canvas/ResourceNode.tsx` | Custom node component |
| `frontend/src/components/forms/DynamicForm.tsx` | Schema-driven form |
| `backend/src/services/generator/index.ts` | Terraform code generator |
| `backend/src/services/resources/schemas/*.ts` | Azure resource schemas |
| `backend/src/routes/projects.ts` | Project API routes |
| `backend/prisma/schema.prisma` | Database schema |

---

*Document Version: 1.0*
*Last Updated: 2026-02-21*
*Status: Active Development*
