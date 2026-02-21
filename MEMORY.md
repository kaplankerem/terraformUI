# IaNC (Infrastructure as No-Code) - Project Memory

## Project Overview

**Project Name:** IaNC (Infrastructure as No-Code)

**Description:** A GUI-driven application for generating Terraform code for Azure cloud infrastructure. Users can design and deploy Azure resources through an intuitive interface without writing code.

**Status:** Phase 2 Complete - Core Features Implemented

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

### Phase 3: Enhanced UX - NEXT
- Visual resource designer (React Flow canvas)
- Template system
- Project management

### Phase 4: Polish and Advanced Features
- Testing (unit, integration, E2E)
- Documentation
- Advanced features (Terraform validate, import)

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
| **Compute** | Windows Virtual Machine |
| **Storage** | Storage Account |
| **Networking** | Virtual Network, Subnet, Network Security Group, Public IP, Network Interface |
| **Database** | Azure SQL Server, SQL Database |

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

1. **Implement visual designer** - React Flow canvas for drag-and-drop resource design
2. **Template management** - Create and manage infrastructure templates
3. **Add more Azure resources** - VM, Azure SQL, and other compute resources
4. **Dependency visualization** - Show resource dependencies in the designer

---

## Context for AI Assistants

When working on this project, consider:

1. **This is an ongoing project** - Plans may evolve as requirements change
2. **TypeScript is used throughout** - Maintain type safety
3. **Schema-driven forms** - UI is generated from resource schemas
4. **Terraform best practices** - Generated code should follow HashiCorp guidelines
5. **Azure Portal similarity** - UI should feel familiar to Azure users

### Common Tasks

- **Adding a new Azure resource**: Create schema in `plans/RESOURCE_SCHEMAS.md`, implement in backend
- **Modifying API**: Update `plans/API_SPECIFICATION.md` first
- **UI changes**: Reference `plans/FRONTEND_COMPONENTS.md` for component structure
- **Code generation changes**: Update `plans/TERRAFORM_GENERATION.md`

---

## Recent Changes

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

*Last Updated: 2026-02-21*
*Version: 1.2*
