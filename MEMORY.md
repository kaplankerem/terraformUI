# IaNC (Infrastructure as No-Code) - Project Memory

## Project Overview

**Project Name:** IaNC (Infrastructure as No-Code)

**Description:** A GUI-driven application for generating Terraform code for Azure cloud infrastructure. Users can design and deploy Azure resources through an intuitive interface without writing code.

**Status:** Phase 6 Complete - Nested Resources & Enhanced Visual Designer

---

## Quick Links

| Document | Purpose | Location |
|----------|---------|----------|
| Implementation Plan | Main project plan with phases and milestones | [`plans/IMPLEMENTATION_PLAN.md`](plans/IMPLEMENTATION_PLAN.md) |
| Architecture | System architecture and design decisions | [`plans/ARCHITECTURE.md`](plans/ARCHITECTURE.md) |
| Resource Schemas | Azure resource schema definitions | [`plans/RESOURCE_SCHEMAS.md`](plans/RESOURCE_SCHEMAS.md) |
| API Specification | REST API endpoints and contracts | [`plans/API_SPECIFICATION.md`](plans/API_SPECIFICATION.md) |
| Frontend Components | React component hierarchy | [`plans/FRONTEND_COMPONENTS.md`](plans/FRONTEND_COMPONENTS.md) |
| Terraform Generation | Code generation strategy | [`plans/TERRAFORM_GENERATION.md`](plans/TERRAFORM_GENERATION.md) |

---

## Technology Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **UI Library:** Ant Design 5.x
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod
- **Visual Canvas:** React Flow
- **Code Editor:** Monaco Editor
- **Build Tool:** Vite

### Backend
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js with TypeScript
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **ORM:** Prisma
- **Validation:** Zod

### Development Tools
- ESLint + Prettier
- Jest + React Testing Library
- Playwright
- Docker
- GitHub Actions

---

## Project Structure

```
terraformUI/
├── frontend/          # React frontend application
├── backend/           # Node.js backend application
├── shared/            # Shared types and schemas
├── docs/              # Documentation
├── plans/             # Planning documents
├── docker/            # Docker configuration
└── README.md
```

---

## Development Phases

### Phase 1: Foundation ✅ COMPLETE
- Project setup and configuration
- Backend core (Express, Prisma)
- Frontend core (React, Ant Design)
- First resource implementation (Resource Group)

### Phase 2: Core Features ✅ COMPLETE
- Dynamic form engine with validation
- Resource schema definitions (VNet, Subnet, Storage, NSG, Public IP, NIC)
- Terraform generator with variable extraction
- Code preview with syntax highlighting
- Project-level code generation

### Phase 3: Enhanced UX ✅ COMPLETE
- Visual resource designer with React Flow canvas
- Drag-and-drop resource placement
- Resource connection/dependency visualization
- Template management system with default templates
- Template library UI with preview and use functionality
- Enhanced project management with CRUD operations

### Phase 4: Polish and Advanced Features ✅ COMPLETE
- Jest testing infrastructure setup
- Unit tests for schema registry and terraform generator
- Error boundary component for frontend
- Bug fixes for template instantiation and terraform generation

### Phase 5: Template Loading & Visual Designer Integration ✅ COMPLETE
- Fixed template loading to redirect to visual designer
- VisualDesigner now loads project resources as nodes on canvas
- Added automatic edge generation between related resources
- Added PUT endpoint for updating project resources
- Created Settings page with Azure, Terraform, and UI preferences

### Phase 6: Nested Resources & Enhanced Visual Designer ✅ COMPLETE
- Collapsible group nodes with expand/collapse toggle
- Resource hierarchy tree panel in sidebar
- Improved Terraform generation with nested block support (os_disk, source_image_reference, ip_configuration)
- Updated containment rules for Key Vault, Container Registry, Windows VM
- Better resource type ordering in Terraform generation

### Future Enhancements
- E2E testing with Playwright
- Terraform validate integration
- Azure authentication and resource import
- Cost estimation integration

---

## Key Design Decisions

### Why React over Angular/Vue?
- Larger ecosystem and community support
- Better TypeScript integration
- React Flow for visual canvas is React-specific

### Why Node.js over Python/.NET?
- Language consistency with frontend
- Excellent async I/O for API handling
- Easy JSON manipulation for Terraform generation

### Why Prisma over TypeORM?
- Best-in-class TypeScript support
- Intuitive schema definition
- Automatic type generation

### Why Ant Design over Material-UI?
- Enterprise-focused component library
- Similar aesthetic to Azure Portal
- Comprehensive form components

---

## Azure Resources - MVP Support

| Category | Resources |
|----------|-----------|
| **Core** | Resource Group |
| **Compute** | Windows Virtual Machine (new) |
| **Storage** | Storage Account |
| **Networking** | Virtual Network, Subnet, Network Security Group, Public IP, Network Interface |
| **Database** | Azure SQL Server, SQL Database |
| **Security** | Key Vault (new) |
| **Container** | Container Registry (new) |

---

## API Endpoints Summary

### Resources
- `GET /api/v1/resources/types` - List resource types
- `GET /api/v1/resources/types/:type/schema` - Get resource schema
- `POST /api/v1/resources/validate` - Validate configuration
- `POST /api/v1/resources/generate` - Generate Terraform

### Projects
- `GET /api/v1/projects` - List projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id` - Get project
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project
- `POST /api/v1/projects/:id/generate` - Generate Terraform
- `GET /api/v1/projects/:id/export` - Export project

### Templates
- `GET /api/v1/templates` - List templates
- `GET /api/v1/templates/:id` - Get template
- `POST /api/v1/templates` - Create template
- `POST /api/v1/templates/:id/instantiate` - Create project from template

---

## Package Names

- Root: `ianc`
- Frontend: `@ianc/frontend`
- Backend: `@ianc/backend`
- Shared: `@ianc/shared`

---

## Next Steps

1. **Testing** - Add unit tests, integration tests, and E2E tests
2. **Documentation** - Complete user guide and API documentation
3. **Advanced features** - Terraform validate, plan preview, cost estimation
4. **Azure integration** - Import existing resources, resource discovery
5. **Add more Azure resources** - VM, Azure SQL, and other compute resources

---

## Context for AI Assistants

When working on this project, consider:

1. **This is an ongoing project** - Plans may evolve as requirements change
2. **TypeScript is used throughout** - Maintain type safety
3. **Schema-driven forms** - UI is generated from resource schemas
4. **Terraform best practices** - Generated code should follow HashiCorp guidelines
5. **Azure Portal similarity** - UI should feel familiar to Azure users
6. **Always update documentation** - After completing a todo list or phase, ALWAYS update `MEMORY.md` and `README.md` with the current state

### Common Tasks

- **Adding a new Azure resource**: Create schema in `plans/RESOURCE_SCHEMAS.md`, implement in backend
- **Modifying API**: Update `plans/API_SPECIFICATION.md` first
- **UI changes**: Reference `plans/FRONTEND_COMPONENTS.md` for component structure
- **Code generation changes**: Update `plans/TERRAFORM_GENERATION.md`

---

## Recent Changes

### 2026-03-18 (Phase 6 - Complete)
- QA validation: All 12 backend tests pass, all builds clean, all API endpoints functional
- Added 3 new Azure resource schemas: Windows Virtual Machine, Key Vault, Container Registry (16 total)
- Set up frontend testing infrastructure with Vitest + Testing Library
- Added initial frontend tests for DynamicForm, ErrorBoundary, Dashboard, Settings
- Cleaned up duplicate test data in database
- Updated resource count from 13 to 16
- **Collapsible group nodes**: Groups can be collapsed/expanded with toggle button, shows child count badge
- **Resource hierarchy tree**: New sidebar panel showing parent-child resource hierarchy with click-to-select
- **Improved Terraform generation**: Nested blocks for VM resources (os_disk, source_image_reference), better formatValue with indentation, grouped flat properties into proper TF blocks
- **Updated containment rules**: Key Vault added as container type, all new resources in containment map
- **Resource type config**: Added Key Vault and Container Registry to visual designer type mappings

### 2026-02-21 (Phase 3)
- Implemented Visual Designer with React Flow canvas
- Added drag-and-drop resource placement from palette
- Created resource connection/dependency visualization
- Built Template Library with default templates (Web App, Storage, Networking)
- Enhanced Project Management with full CRUD operations
- Added project export and Terraform generation from projects page

### 2026-02-21 (Phase 2)
- Added 6 new Azure resource schemas: Virtual Network, Subnet, Storage Account, Network Security Group, Public IP, Network Interface
- Implemented project-level Terraform code generation
- Enhanced dynamic form engine with better validation
- Added code preview with syntax highlighting
- Improved Terraform generator with variable extraction

### 2026-02-21 (Phase 1)
- Renamed project from "TerraformUI" to "IaNC (Infrastructure as No-Code)"
- Updated all package names from `@terraformui/*` to `@ianc/*`
- Updated branding in UI components and documentation
- Completed Phase 1 foundation implementation

---

*Last Updated: 2026-03-18*
*Version: 1.4*
