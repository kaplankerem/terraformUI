# IaNC (Infrastructure as No-Code)

A GUI-Driven Application for Generating Cloud Infrastructure with Terraform Code Automation for Azure

## Overview

IaNC (Infrastructure as No-Code) simplifies the process of creating Infrastructure as Code (IaC) by providing an intuitive graphical interface for designing Azure cloud infrastructure. Users can select and configure Azure resources through a web-based GUI, and the application automatically generates valid Terraform code.

## Features

- **Visual Resource Designer**: Drag-and-drop interface for designing infrastructure
- **Dynamic Configuration Forms**: Auto-generated forms based on resource schemas
- **Terraform Code Generation**: Automatic generation of HCL code following best practices
- **Template Library**: Pre-built templates for common infrastructure patterns
- **Project Management**: Organize and manage multiple infrastructure projects
- **Code Preview**: Real-time preview of generated Terraform code

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18+, TypeScript, Ant Design, React Flow |
| Backend | Node.js 20+, Express, TypeScript, Prisma |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Build | Vite, Docker |
| Testing | Jest, React Testing Library, Playwright |

## Project Status

✅ **Phase 4 Complete** - Polish and Advanced Features Implemented

See the [plans directory](./plans) for detailed documentation.

## Documentation

- [Implementation Plan](./plans/IMPLEMENTATION_PLAN.md) - Main project plan
- [Architecture](./plans/ARCHITECTURE.md) - System architecture design
- [Resource Schemas](./plans/RESOURCE_SCHEMAS.md) - Azure resource definitions
- [API Specification](./plans/API_SPECIFICATION.md) - REST API documentation
- [Frontend Components](./plans/FRONTEND_COMPONENTS.md) - React component hierarchy
- [Terraform Generation](./plans/TERRAFORM_GENERATION.md) - Code generation strategy

## Getting Started

### Prerequisites

- Node.js 20+ LTS
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd terraformUI

# Install dependencies
npm install

# Start development servers
npm run dev
```

## Project Structure

```
terraformUI/
├── frontend/          # React frontend application
├── backend/           # Node.js backend application
├── shared/            # Shared types and schemas
├── docs/              # Documentation
├── plans/             # Planning documents
├── docker/            # Docker configuration
├── MEMORY.md          # Project memory for AI assistants
└── README.md          # This file
```

## Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 | Foundation - Project setup, core infrastructure | ✅ Complete |
| Phase 2 | Core Features - Forms, generation, preview | ✅ Complete |
| Phase 3 | Enhanced UX - Visual designer, templates | ✅ Complete |
| Phase 4 | Polish - Testing, documentation, advanced features | ✅ Complete |

## Supported Azure Resources (MVP)

- Resource Group
- Virtual Network & Subnet
- Storage Account
- Windows Virtual Machine
- Network Security Group
- Public IP
- Network Interface

## Contributing

This project is currently in the planning phase. Contribution guidelines will be added during Phase 1.

## License

MIT License - See [LICENSE](LICENSE) for details.

## Acknowledgments

- [HashiCorp Terraform](https://www.terraform.io/) - Infrastructure as Code tool
- [Azure](https://azure.microsoft.com/) - Cloud platform
- [Ant Design](https://ant.design/) - UI component library
- [React Flow](https://reactflow.dev/) - Visual canvas library

---

*Last Updated: 2026-02-21*
