#!/usr/bin/env node

/**
 * Comprehensive Deployment Readiness Test Suite
 * Tests all critical aspects of the Wizzered application for production deployment
 */

import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const BOLD = '\x1b[1m';

class DeploymentReadinessTest {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  log(message, color = RESET) {
    console.log(`${color}${message}${RESET}`);
  }

  test(name, fn) {
    this.log(`\n${BLUE}Running: ${name}${RESET}`);
    try {
      const result = fn();
      if (result === true) {
        this.log(`${GREEN}✓ PASSED: ${name}${RESET}`);
        this.results.passed++;
        this.results.tests.push({ name, status: 'PASSED' });
      } else if (result === 'warning') {
        this.log(`${YELLOW}⚠ WARNING: ${name}${RESET}`);
        this.results.warnings++;
        this.results.tests.push({ name, status: 'WARNING' });
      } else {
        this.log(`${RED}✗ FAILED: ${name}${RESET}`);
        this.results.failed++;
        this.results.tests.push({ name, status: 'FAILED', error: result });
      }
    } catch (error) {
      this.log(`${RED}✗ ERROR: ${name} - ${error.message}${RESET}`);
      this.results.failed++;
      this.results.tests.push({ name, status: 'ERROR', error: error.message });
    }
  }

  async asyncTest(name, fn) {
    this.log(`\n${BLUE}Running: ${name}${RESET}`);
    try {
      const result = await fn();
      if (result === true) {
        this.log(`${GREEN}✓ PASSED: ${name}${RESET}`);
        this.results.passed++;
        this.results.tests.push({ name, status: 'PASSED' });
      } else if (result === 'warning') {
        this.log(`${YELLOW}⚠ WARNING: ${name}${RESET}`);
        this.results.warnings++;
        this.results.tests.push({ name, status: 'WARNING' });
      } else {
        this.log(`${RED}✗ FAILED: ${name}${RESET}`);
        this.results.failed++;
        this.results.tests.push({ name, status: 'FAILED', error: result });
      }
    } catch (error) {
      this.log(`${RED}✗ ERROR: ${name} - ${error.message}${RESET}`);
      this.results.failed++;
      this.results.tests.push({ name, status: 'ERROR', error: error.message });
    }
  }

  // Test 1: Package.json validation
  testPackageJson() {
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      
      // Check required scripts
      const requiredScripts = ['dev', 'build', 'start'];
      for (const script of requiredScripts) {
        if (!packageJson.scripts[script]) {
          return `Missing required script: ${script}`;
        }
      }

      // Check critical dependencies
      const criticalDeps = ['express', 'react', 'typescript', 'drizzle-orm', 'openai'];
      for (const dep of criticalDeps) {
        if (!packageJson.dependencies[dep]) {
          return `Missing critical dependency: ${dep}`;
        }
      }

      return true;
    } catch (error) {
      return `Failed to parse package.json: ${error.message}`;
    }
  }

  // Test 2: TypeScript configuration
  testTypeScriptConfig() {
    if (!existsSync('tsconfig.json')) {
      return 'Missing tsconfig.json';
    }

    try {
      const tsConfig = JSON.parse(readFileSync('tsconfig.json', 'utf8'));
      
      if (!tsConfig.compilerOptions) {
        return 'Missing compilerOptions in tsconfig.json';
      }

      if (!tsConfig.compilerOptions.strict) {
        return 'warning'; // Strict mode should be enabled
      }

      return true;
    } catch (error) {
      return `Failed to parse tsconfig.json: ${error.message}`;
    }
  }

  // Test 3: Environment variables
  testEnvironmentVariables() {
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'OPENAI_API_KEY'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        return `Missing required environment variable: ${envVar}`;
      }
    }

    return true;
  }

  // Test 4: Database schema validation
  testDatabaseSchema() {
    if (!existsSync('shared/schema.ts')) {
      return 'Missing database schema file';
    }

    try {
      const schema = readFileSync('shared/schema.ts', 'utf8');
      
      // Check for essential tables
      const requiredTables = ['users', 'cases', 'chatMessages', 'documents'];
      for (const table of requiredTables) {
        if (!schema.includes(table)) {
          return `Missing required table: ${table}`;
        }
      }

      return true;
    } catch (error) {
      return `Failed to read schema file: ${error.message}`;
    }
  }

  // Test 5: Critical files existence
  testCriticalFiles() {
    const criticalFiles = [
      'server/index.ts',
      'server/routes.ts',
      'server/storage.ts',
      'server/db.ts',
      'client/src/main.tsx',
      'client/src/App.tsx',
      'index.html',
      'vite.config.ts'
    ];

    for (const file of criticalFiles) {
      if (!existsSync(file)) {
        return `Missing critical file: ${file}`;
      }
    }

    return true;
  }

  // Test 6: Security configuration
  testSecurityConfig() {
    try {
      const routesContent = readFileSync('server/routes.ts', 'utf8');
      
      // Check for rate limiting
      if (!routesContent.includes('rateLimit')) {
        return 'warning'; // Rate limiting should be implemented
      }

      // Check for helmet usage
      if (!routesContent.includes('helmet')) {
        return 'warning'; // Helmet should be used for security headers
      }

      return true;
    } catch (error) {
      return `Failed to read routes file: ${error.message}`;
    }
  }

  // Test 7: Build configuration
  testBuildConfig() {
    if (!existsSync('vite.config.ts')) {
      return 'Missing vite.config.ts';
    }

    try {
      const viteConfig = readFileSync('vite.config.ts', 'utf8');
      
      // Check for proper build configuration
      if (!viteConfig.includes('build')) {
        return 'warning'; // Build configuration should be specified
      }

      return true;
    } catch (error) {
      return `Failed to read vite.config.ts: ${error.message}`;
    }
  }

  // Test 8: Database connectivity (async)
  async testDatabaseConnectivity() {
    return new Promise((resolve) => {
      const testScript = `
        import { Pool } from '@neondatabase/serverless';
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        pool.query('SELECT 1').then(() => {
          console.log('Database connection successful');
          process.exit(0);
        }).catch((err) => {
          console.error('Database connection failed:', err);
          process.exit(1);
        });
      `;

      // Write temporary test file
      require('fs').writeFileSync('/tmp/db-test.mjs', testScript);

      const testProcess = spawn('node', ['/tmp/db-test.mjs'], {
        env: { ...process.env },
        timeout: 10000
      });

      testProcess.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          resolve('Database connection failed');
        }
      });

      testProcess.on('error', () => {
        resolve('Database test execution failed');
      });
    });
  }

  // Test 9: API endpoints structure
  testAPIEndpoints() {
    try {
      const routesContent = readFileSync('server/routes.ts', 'utf8');
      
      // Check for essential API endpoints
      const requiredEndpoints = [
        '/api/user',
        '/api/cases',
        '/api/chat',
        '/api/documents'
      ];

      for (const endpoint of requiredEndpoints) {
        if (!routesContent.includes(endpoint)) {
          return `Missing API endpoint: ${endpoint}`;
        }
      }

      return true;
    } catch (error) {
      return `Failed to read routes file: ${error.message}`;
    }
  }

  // Test 10: Frontend build requirements
  testFrontendBuild() {
    if (!existsSync('client/src/main.tsx')) {
      return 'Missing frontend entry point';
    }

    if (!existsSync('index.html')) {
      return 'Missing index.html';
    }

    try {
      const indexHtml = readFileSync('index.html', 'utf8');
      if (!indexHtml.includes('src/main.tsx')) {
        return 'Invalid frontend entry point configuration';
      }

      return true;
    } catch (error) {
      return `Failed to read index.html: ${error.message}`;
    }
  }

  // Generate comprehensive report
  generateReport() {
    this.log(`\n${BOLD}${BLUE}=== DEPLOYMENT READINESS REPORT ===${RESET}`);
    this.log(`${GREEN}Passed: ${this.results.passed}${RESET}`);
    this.log(`${RED}Failed: ${this.results.failed}${RESET}`);
    this.log(`${YELLOW}Warnings: ${this.results.warnings}${RESET}`);
    
    const total = this.results.passed + this.results.failed + this.results.warnings;
    const successRate = ((this.results.passed / total) * 100).toFixed(1);
    
    this.log(`\n${BOLD}Success Rate: ${successRate}%${RESET}`);
    
    if (this.results.failed > 0) {
      this.log(`\n${RED}${BOLD}FAILED TESTS:${RESET}`);
      this.results.tests.forEach(test => {
        if (test.status === 'FAILED' || test.status === 'ERROR') {
          this.log(`${RED}  - ${test.name}: ${test.error || 'Unknown error'}${RESET}`);
        }
      });
    }

    if (this.results.warnings > 0) {
      this.log(`\n${YELLOW}${BOLD}WARNINGS:${RESET}`);
      this.results.tests.forEach(test => {
        if (test.status === 'WARNING') {
          this.log(`${YELLOW}  - ${test.name}${RESET}`);
        }
      });
    }

    // Deployment recommendation
    this.log(`\n${BOLD}${BLUE}DEPLOYMENT RECOMMENDATION:${RESET}`);
    if (this.results.failed === 0) {
      this.log(`${GREEN}✓ Application is ready for production deployment${RESET}`);
      this.log(`${GREEN}  Recommended deployment type: Autoscale (for production traffic)${RESET}`);
    } else {
      this.log(`${RED}✗ Application requires fixes before deployment${RESET}`);
      this.log(`${RED}  Please resolve all failed tests before proceeding${RESET}`);
    }
  }

  async runAllTests() {
    this.log(`${BOLD}${BLUE}Starting Deployment Readiness Test Suite...${RESET}`);
    
    // Synchronous tests
    this.test('Package.json validation', () => this.testPackageJson());
    this.test('TypeScript configuration', () => this.testTypeScriptConfig());
    this.test('Environment variables', () => this.testEnvironmentVariables());
    this.test('Database schema validation', () => this.testDatabaseSchema());
    this.test('Critical files existence', () => this.testCriticalFiles());
    this.test('Security configuration', () => this.testSecurityConfig());
    this.test('Build configuration', () => this.testBuildConfig());
    this.test('API endpoints structure', () => this.testAPIEndpoints());
    this.test('Frontend build requirements', () => this.testFrontendBuild());
    
    // Asynchronous tests
    await this.asyncTest('Database connectivity', () => this.testDatabaseConnectivity());
    
    this.generateReport();
  }
}

// Run the test suite
const tester = new DeploymentReadinessTest();
tester.runAllTests().catch(console.error);