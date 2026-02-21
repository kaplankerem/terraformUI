# TerraformUI - System Architecture

## High-Level Architecture

TerraformUI follows a modern three-tier architecture with clear separation of concerns:

```mermaid
flowchart TB
    subgraph Presentation [Presentation Layer]
        Browser[Web Browser]
        ReactApp[React Application]
    end
    
    subgraph Application [Application Layer]
        API[REST API]
        Services[Business Services]
        Generator[Terraform Generator]
    end
    
    subgraph Data [Data Layer]
        PostgreSQL[(PostgreSQL)]
        FileStore[File Storage]
    end
    
    Browser --> ReactApp
    ReactApp --> API
    API --> Services
    Services --> Generator
    Services --> PostgreSQL
    Generator --> FileStore
```

---

## Component Architecture

### Frontend Architecture

```mermaid
flowchart TB
    subgraph Pages [Page Components]
        Dashboard[Dashboard Page]
        Designer[Resource Designer Page]
        Templates[Templates Page]
        Projects[Projects Page]
    end
    
    subgraph Features [Feature Components]
        ResourceSelector[Resource Selector]
        ConfigForm[Configuration Form]
        Canvas[Visual Canvas]
        CodePreview[Code Preview]
    end
    
    subgraph UI [UI Components]
        Forms[Form Controls]
        Layouts[Layout Components]
        Feedback[Feedback Components]
        Navigation[Navigation Components]
    end
    
    subgraph State [State Management]
        ResourceStore[Resource Store]
        ProjectStore[Project Store]
        UIStore[UI Store]
        TemplateStore[Template Store]
    end
    
    subgraph Services [API Services]
        ResourceAPI[Resource API]
        ProjectAPI[Project API]
        TemplateAPI[Template API]
    end
    
    Pages --> Features
    Features --> UI
    Features --> State
    State --> Services
```

### Backend Architecture

```mermaid
flowchart TB
    subgraph Routes [API Routes]
        ResourceRoutes[Resource Routes]
        ProjectRoutes[Project Routes]
        TemplateRoutes[Template Routes]
        GenerateRoutes[Generate Routes]
    end
    
    subgraph Controllers [Controllers]
        ResourceController[Resource Controller]
        ProjectController[Project Controller]
        TemplateController[Template Controller]
        GenerateController[Generate Controller]
    end
    
    subgraph Services [Services]
        ResourceService[Resource Service]
        ProjectService[Project Service]
        TemplateService[Template Service]
        GeneratorService[Generator Service]
        ValidationService[Validation Service]
    end
    
    subgraph Data [Data Access]
        PrismaClient[Prisma Client]
        FileHandler[File Handler]
    end
    
    subgraph External [External Services]
        AzureSDK[Azure SDK]
        TerraformCLI[Terraform CLI]
    end
    
    Routes --> Controllers
    Controllers --> Services
    Services --> Data
    Services --> External
```

---

## Data Flow Architecture

### Resource Configuration Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant ResourceService
    participant GeneratorService
    participant Database
    
    User->>Frontend: Select resource type
    Frontend->>API: GET /api/resources/types/:type/schema
    API->>ResourceService: getResourceSchema
    ResourceService->>Database: query schema
    Database-->>ResourceService: return schema
    ResourceService-->>API: schema JSON
    API-->>Frontend: schema response
    Frontend->>Frontend: render dynamic form
    
    User->>Frontend: fill configuration
    Frontend->>Frontend: validate locally
    User->>Frontend: submit configuration
    Frontend->>API: POST /api/resources/validate
    API->>ResourceService: validateConfiguration
    ResourceService-->>API: validation result
    API-->>Frontend: validation response
    
    User->>Frontend: generate Terraform
    Frontend->>API: POST /api/resources/generate
    API->>GeneratorService: generateTerraform
    GeneratorService->>GeneratorService: convert to HCL
    GeneratorService-->>API: terraform code
    API-->>Frontend: generated code
    Frontend->>Frontend: display in preview
```

### Project Management Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant ProjectService
    participant GeneratorService
    participant Database
    
    User->>Frontend: create new project
    Frontend->>API: POST /api/projects
    API->>ProjectService: createProject
    ProjectService->>Database: insert project
    Database-->>ProjectService: project created
    ProjectService-->>API: project data
    API-->>Frontend: project response
    
    User->>Frontend: add resources to project
    Frontend->>API: POST /api/projects/:id/resources
    API->>ProjectService: addResource
    ProjectService->>Database: insert resource
    Database-->>ProjectService: resource added
    ProjectService-->>API: updated project
    API-->>Frontend: success response
    
    User->>Frontend: generate project Terraform
    Frontend->>API: POST /api/projects/:id/generate
    API->>ProjectService: getProjectResources
    ProjectService->>Database: query resources
    Database-->>ProjectService: resources list
    API->>GeneratorService: generateProjectTerraform
    GeneratorService->>GeneratorService: resolve dependencies
    GeneratorService->>GeneratorService: generate all files
    GeneratorService-->>API: file contents
    API-->>Frontend: generated files
```

---

## Security Architecture

### Authentication and Authorization

```mermaid
flowchart TB
    subgraph Client [Client Side]
        Login[Login Page]
        TokenStorage[Token Storage]
    end
    
    subgraph Server [Server Side]
        AuthMiddleware[Auth Middleware]
        RBAC[Role-Based Access Control]
        UserService[User Service]
    end
    
    subgraph Storage [Token Storage]
        JWT[JWT Tokens]
        RefreshTokens[Refresh Tokens]
    end
    
    Login --> UserService
    UserService --> JWT
    JWT --> TokenStorage
    TokenStorage --> AuthMiddleware
    AuthMiddleware --> RBAC
    RBAC --> APIEndpoints[Protected API Endpoints]
```

### Security Considerations

| Layer | Security Measure |
|-------|-----------------|
| **Transport** | HTTPS/TLS for all communications |
| **Authentication** | JWT-based authentication with refresh tokens |
| **Authorization** | Role-based access control - RBAC |
| **Input Validation** | Zod schema validation on all inputs |
| **Output Encoding** | Sanitize all user-generated content |
| **Database** | Parameterized queries via Prisma |
| **Secrets** | Environment variables, never in code |

---

## Deployment Architecture

### Development Environment

```mermaid
flowchart LR
    subgraph DevMachine [Developer Machine]
        Frontend[React Dev Server :5173]
        Backend[Express Server :3000]
        SQLite[(SQLite DB)]
    end
    
    Frontend --> Backend
    Backend --> SQLite
```

### Production Environment

```mermaid
flowchart TB
    subgraph Cloud [Cloud Infrastructure]
        subgraph FrontendHosting [Static Hosting]
            CDN[CDN]
            StaticFiles[React Static Files]
        end
        
        subgraph BackendHosting [Container Hosting]
            LoadBalancer[Load Balancer]
            Container1[Container 1]
            Container2[Container 2]
        end
        
        subgraph DataLayer [Data Layer]
            ManagedDB[(Managed PostgreSQL)]
            ObjectStorage[Object Storage]
        end
    end
    
    CDN --> StaticFiles
    Users[Users] --> CDN
    Users --> LoadBalancer
    LoadBalancer --> Container1
    LoadBalancer --> Container2
    Container1 --> ManagedDB
    Container2 --> ManagedDB
    Container1 --> ObjectStorage
    Container2 --> ObjectStorage
```

---

## Scalability Considerations

### Horizontal Scaling

- **Stateless API**: Backend services are stateless, allowing horizontal scaling
- **Load Balancing**: Distribute requests across multiple instances
- **Database Connection Pooling**: Efficient database connection management
- **Caching**: Redis for session storage and frequently accessed data

### Performance Optimization

| Area | Strategy |
|------|----------|
| **Frontend** | Code splitting, lazy loading, memoization |
| **API** | Response caching, pagination, query optimization |
| **Database** | Indexing, connection pooling, read replicas |
| **Generation** | Async processing, worker queues for large projects |

---

## Technology Decisions Record

### Decision 1: React over Angular/Vue

**Context**: Need a component-based UI framework for complex forms and visual canvas.

**Decision**: React with TypeScript

**Rationale**:
- Larger ecosystem and community support
- Better TypeScript integration
- More flexible for custom UI needs
- React Flow for visual canvas is React-specific

### Decision 2: Node.js over Python/.NET

**Context**: Need backend API with good performance and developer experience.

**Decision**: Node.js with Express and TypeScript

**Rationale**:
- Language consistency with frontend
- Excellent async I/O for API handling
- Large npm ecosystem
- Easy JSON manipulation for Terraform generation

### Decision 3: Prisma over TypeORM/Sequelize

**Context**: Need type-safe database access with migrations.

**Decision**: Prisma ORM

**Rationale**:
- Best-in-class TypeScript support
- Intuitive schema definition
- Automatic type generation
- Excellent migration system

### Decision 4: Ant Design over Material-UI

**Context**: Need enterprise-grade UI components similar to Azure Portal.

**Decision**: Ant Design 5.x

**Rationale**:
- Enterprise-focused component library
- Similar aesthetic to Azure Portal
- Comprehensive form components
- Built-in localization support

---

## Integration Points

### Azure API Integration

```mermaid
flowchart LR
    subgraph TerraformUI
        AzureService[Azure Service]
    end
    
    subgraph Azure [Azure APIs]
        ResourceGraph[Resource Graph API]
        Management[Management API]
        Subscription[Subscription API]
    end
    
    AzureService --> ResourceGraph
    AzureService --> Management
    AzureService --> Subscription
```

### Terraform CLI Integration - Optional

```mermaid
flowchart LR
    subgraph TerraformUI
        GeneratorService[Generator Service]
        CLIWrapper[CLI Wrapper]
    end
    
    subgraph External
        TerraformCLI[Terraform CLI]
    end
    
    GeneratorService --> CLIWrapper
    CLIWrapper --> TerraformCLI
```

---

*Document Version: 1.0*
*Last Updated: 2026-02-21*
