# Privileged Access Console - QA Automation Framework

A comprehensive QA automation framework for testing Apache Guacamole privileged access management and enterprise admin console applications.

[![Java](https://img.shields.io/badge/Java-17+-ED8B00.svg)](https://www.java.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E.svg)](https://www.javascript.com/)
[![Docker](https://img.shields.io/badge/Docker-Latest-2496ED.svg)](https://www.docker.com/)
[![Apache Guacamole](https://img.shields.io/badge/Apache-Guacamole-4CAF50.svg)](https://guacamole.apache.org/)
[![PAM](https://img.shields.io/badge/PAM-Authentication-FF9800.svg)](https://linux.die.net/man/8/pam)
[![Shell](https://img.shields.io/badge/Shell-Bash-89E051.svg)](https://www.gnu.org/software/bash/)


## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Setup Instructions](#setup-instructions)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Project Information](#project-information)

---

## 🎯 Project Overview

This project demonstrates end-to-end testing capabilities for enterprise-level privileged access management systems, focusing on:

- **Apache Guacamole Testing** - Clientless remote desktop gateway for privileged access
- **Enterprise Integration** - LDAP, Active Directory authentication flows
- **Security Testing** - Input validation, injection prevention, session security
- **Fault Tolerance** - System resilience and error recovery
- **Role-Based Access Control** - RBAC validation and permission testing

### Business Context

Apache Guacamole serves as a privileged access management (PAM) solution providing:
- Centralized access to remote systems (RDP, VNC, SSH, Telnet)
- Session recording and audit trails for compliance
- Jump box/bastion host functionality
- Browser-based access without client software

### Testing Focus

This framework validates:
- Authentication and session management
- Enterprise directory integration (LDAP/Active Directory)
- Security controls and input validation
- System resilience under adverse conditions
- Concurrent user session handling

---

## 🏗️ Architecture

### Project Structure
```text
privileged-access-console-automation/
├── tests/
│   ├── config/git 
│   │   └── credentials.ts
│   ├── pages/
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── AdminPage.ts
│   │   ├── GuacamoleLoginPage.ts
│   │   └── GuacamoleDashboardPage.ts
│   ├── guacamole/
│   │   ├── guacamole-auth.spec.ts
│   │   ├── guacamole-ldap.spec.ts
│   │   └── guacamole-fault-tolerance.spec.ts
│   └── orangehrm/
│       ├── auth.spec.ts
│       ├── rbac.spec.ts
│       └── sql-injection.spec.ts
├── docs/
│   ├── TEST_PLAN.md
│   └── TEST_CASES.md
├── playwright.config.ts
├── package.json
└── README.md
```

### Design Patterns

- **Page Object Model (POM)**: Encapsulates page interactions
- **Configuration Management**: Environment-based settings
- **Reusable Components**: Shared page objects and utilities
- **Test Data Management**: Centralized credential management

---

## 🔧 Technologies

### Testing Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Playwright** | 1.40+ | E2E testing framework |
| **TypeScript** | 5.0+ | Type-safe test development |
| **Node.js** | 18+ | Runtime environment |
| **Docker** | Latest | Container orchestration |
| **PostgreSQL** | 13+ | Guacamole database backend |

### Application Under Test

- **Apache Guacamole**: 1.5+ (Clientless remote desktop gateway)
- **Database**: PostgreSQL for user/connection storage
- **Authentication**: Local database + LDAP support

### Development Tools

- **VS Code**: Recommended IDE with Playwright extension
- **Git**: Version control
- **npm**: Package management
- **Docker Compose**: Multi-container setup

---

## 🛠️ Setup Instructions

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/))
- **npm** (comes with Node.js)

### Installation Steps

#### 1. Clone Repository

```bash
git clone <repository-url>
cd privileged-access-console-automation
```

### 2. Install Dependencies
``` bash
# Install Node.js dependencies
npm install

# Install Playwright browsers
npx playwright install
```
### 3. Start Guacamole with Docker (includes PostgreSQL)
```bash
# Start all services (Guacamole, PostgreSQL, Guacd)
docker-compose up -d

# Verify containers are running
docker ps

# Initialize Guacamole database (first time only)
docker exec -it guacamole-postgres psql -U guacamole -d guacamole_db
``` 

Expected containers:

guacamole-web (port 8080)
guacamole-postgres (port 5432)
guacamole-guacd (port 4822)


**Database Configuration:**
- Database: PostgreSQL 13+
- Database Name: `guacamole_db`
- Username: `guacamole`
- Password: `guacamole_password`
- Port: `5432`
- Host: `localhost`

**Database Schema:**

The Guacamole database is automatically initialized by Docker Compose with:
- User accounts table
- Connection configurations  
- Session tracking
- Permission mappings

### 4. Configure Environment
``` bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
```

**`.env` Configuration:**
```env
# Guacamole Configuration
GUACAMOLE_URL=http://localhost:8080/guacamole
GUACAMOLE_ADMIN_USERNAME=guacadmin
GUACAMOLE_ADMIN_PASSWORD=guacadmin

# Optional: Other application URLs
CONSOLE_URL=https://the-internet.herokuapp.com
```

### 5. Verify Setup
``` bash
# Access Guacamole in browser
# Open: http://localhost:8080/guacamole
# Login: guacadmin / guacadmin

# Run a quick test
npx playwright test tests/guacamole/guacamole-auth.spec.ts --headed
```
### 🧪 Running Tests
Basic Test Execution
``` bash
# Run all tests
npm test

# Run all Guacamole tests
npx playwright test tests/guacamole/

# Run specific test file
npx playwright test tests/guacamole/guacamole-auth.spec.ts
```
Test Suites by Category
``` bash
# Authentication tests
npx playwright test tests/guacamole/guacamole-auth.spec.ts

# LDAP integration tests
npx playwright test tests/guacamole/guacamole-ldap.spec.ts

# Fault tolerance tests
npx playwright test tests/guacamole/guacamole-fault-tolerance.spec.ts
```

Browser-Specific Testing
``` bash
# Run in Chromium
npx playwright test --project=chromium

# Run in Firefox
npx playwright test --project=firefox

# Run in WebKit (Safari)
npx playwright test --project=webkit

# Run in all browsers
npx playwright test
```

Debugging & Development
``` bash
# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode with Playwright Inspector
npx playwright test --debug

# Run specific test by name
npx playwright test -g "TC-GUAC-AUTH-001"

# Run tests in UI mode
npx playwright test --ui
```

Reporting
``` bash
# Generate and open HTML report
npx playwright show-report

# Run tests and generate report
npm run report
```

### 📋 Test Coverage

### Guacamole - Privileged Access Management

**Guacamole Authentication**
- TC-GUAC-AUTH-001: Login with valid admin credentials
- TC-GUAC-AUTH-002: Logout functionality

**Guacamole LDAP Integration**
- TC-LDAP-001: Navigate to LDAP settings interface ✅
- TC-LDAP-002: Verify LDAP authentication flow ⏭️ *Skipped*
- TC-LDAP-003: LDAP search parameters configuration ⏭️ *Skipped*
- TC-LDAP-004: LDAP user DN configuration ⏭️ *Skipped*
- TC-LDAP-005: LDAP group mapping ⏭️ *Skipped*

*LDAP extension requires compilation from source and is not included in standard Docker deployment

**Fault Tolerance**
- TC-FAULT-001: Invalid connection attempt handling
- TC-FAULT-002: Network timeout resilience
- TC-FAULT-003: Error message validation
- TC-FAULT-004: Graceful failure recovery
- TC-FAULT-005: Rapid login attempt handling
- TC-FAULT-006: Malformed URL protection
- TC-FAULT-007: Concurrent session management

### UI - Web Console

**Authentication**
- TC-AUTH-001: Valid login with credentials
- TC-AUTH-002: Invalid username error handling
- TC-AUTH-003: Invalid password error handling
- TC-AUTH-004: Logout functionality

**User Management**
- TC-USER-001: Display user table
- TC-USER-002: Create new user
- TC-USER-003: Edit existing user
- TC-USER-004: Delete user
- TC-USER-005: Search users
- TC-USER-006: Filter by role

### API - Backend

**Authentication**
- TC-API-AUTH-001: API token generation
- TC-API-AUTH-002: Token validation
- TC-API-AUTH-003: Invalid credentials handling

**CRUD Operations**
- TC-API-CRUD-001: Create resource
- TC-API-CRUD-002: Read resource
- TC-API-CRUD-003: Update resource
- TC-API-CRUD-004: Delete resource

### Integration - Enterprise Systems

**Enterprise Integration**
- TC-ENT-001: Multi-User Role Workflow
- TC-ENT-002: Dashboard Navigation Flow
- TC-ENT-003: Search and Filter Integration
- TC-ENT-004: User Profile Management
- TC-ENT-005: Complete End-to-End Business Flow

### Security Testing

**Security Vulnerabilities**
- TC-SEC-001: SQL Injection Prevention
- TC-SEC-002: XSS Prevention
- TC-SEC-003: Session Timeout Validation
- TC-SEC-004: Password Field Masking

**RBAC (Role-Based Access Control)**
- TC-RBAC-001: Admin full access
- TC-RBAC-002: Manager limited access
- TC-RBAC-003: Analyst read operations
- TC-RBAC-004: Viewer read-only
- TC-RBAC-005: Permission enforcement
- TC-RBAC-006: Role inheritance


### Summary
- **Total Test Cases**: 46
- **Passing**: 42 (91%)
- **Skipped**: 4 (9%)
- **Status**: Professionally documented ✅

---

## 📝 Project Information

**Author**: Carolina Steadham  
**Role**: QA Automation Engineer  
**Specialization**: Enterprise Privileged Access Management & Security Testing  
**Technologies**: Playwright, TypeScript, Node.js, Docker, PostgreSQL  
**Framework**: Page Object Model (POM)  
**Testing Types**: E2E, API, Integration, Security, RBAC  
**Project Type**: Portfolio Demonstration  
**Date**: December 2025  

### Key Achievements
- ✅ 46 automated test cases 
- ✅ 91% test pass rate (42 passing, 4 professionally skipped)
- ✅ Comprehensive Page Object Model implementation
- ✅ Enterprise-grade test documentation
- ✅ Docker-based test environment
- ✅ Multi-browser compatibility testing
- ✅ Security and fault tolerance validation

### Technical Skills Demonstrated
- End-to-end test automation with Playwright
- TypeScript for type-safe test development
- Page Object Model design pattern
- Docker containerization for test environments
- PostgreSQL database integration
- Enterprise authentication testing (LDAP/AD)
- Security testing (SQL injection, XSS prevention)
- RBAC and permission testing
- API testing and validation
- CI/CD ready automation framework

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📧 Contact

For questions or collaboration opportunities, please reach out through GitHub.

---

**Note**: This is a demonstration project created to showcase QA automation skills for enterprise privileged access management systems. Test scenarios utilize publicly available applications and follow industry best practices for security testing.

