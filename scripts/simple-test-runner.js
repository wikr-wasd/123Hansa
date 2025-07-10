/**
 * Simple Test Runner for 123hansa Website
 * Manual testing approach using curl and basic checks
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

class SimpleTestRunner {
  constructor(baseUrl = 'http://localhost:3002') {
    this.baseUrl = baseUrl;
    this.results = {
      tests: [],
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString()
    };
  }

  async testEndpoint(path, expectedStatus = 200, description = '') {
    const url = `${this.baseUrl}${path}`;
    const testName = description || `GET ${path}`;
    
    console.log(`Testing: ${testName}`);
    
    try {
      const { stdout, stderr } = await execAsync(`curl -s -w "%{http_code}" -o /dev/null "${url}"`);
      const statusCode = parseInt(stdout.trim());
      
      const result = {
        test: testName,
        url: url,
        expected: expectedStatus,
        actual: statusCode,
        status: statusCode === expectedStatus ? 'PASS' : 'FAIL',
        timestamp: new Date().toISOString()
      };

      this.results.tests.push(result);
      
      if (statusCode !== expectedStatus) {
        this.results.errors.push({
          type: 'status_code_mismatch',
          test: testName,
          url: url,
          expected: expectedStatus,
          actual: statusCode
        });
      }

      console.log(`  ${result.status}: ${statusCode} (expected ${expectedStatus})`);
      
    } catch (error) {
      const result = {
        test: testName,
        url: url,
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.results.tests.push(result);
      this.results.errors.push({
        type: 'request_error',
        test: testName,
        url: url,
        error: error.message
      });
      
      console.log(`  ERROR: ${error.message}`);
    }
  }

  async testSentryEndpoints() {
    console.log('\n=== TESTING SENTRY ENDPOINTS ===');
    
    await this.testEndpoint('/api/test-sentry/status', 200, 'Sentry Status Check');
    await this.testEndpoint('/api/test-sentry/error', 500, 'Sentry Error Test');
  }

  async testPublicPages() {
    console.log('\n=== TESTING PUBLIC PAGES ===');
    
    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/listings', name: 'Listings Page' },
      { path: '/crowdfunding', name: 'Crowdfunding Page' },
      { path: '/valuation', name: 'Valuation Page' },
      { path: '/professionals', name: 'Professional Services' },
      { path: '/login', name: 'Login Page' },
      { path: '/register', name: 'Register Page' },
      { path: '/help', name: 'Help Page' },
      { path: '/contact', name: 'Contact Page' },
      { path: '/legal', name: 'Legal Page' },
      { path: '/heart', name: 'Heart Page' }
    ];

    for (const page of pages) {
      await this.testEndpoint(page.path, 200, page.name);
    }
  }

  async testAPIEndpoints() {
    console.log('\n=== TESTING API ENDPOINTS ===');
    
    const apiEndpoints = [
      { path: '/api/auth/login', name: 'Auth Login API' },
      { path: '/api/auth/register', name: 'Auth Register API' },
      { path: '/api/listings', name: 'Listings API' },
      { path: '/api/users', name: 'Users API' },
      { path: '/api/messages', name: 'Messages API' },
      { path: '/api/admin', name: 'Admin API' },
      { path: '/health', name: 'Health Check' },
      { path: '/metrics', name: 'Metrics Endpoint' }
    ];

    for (const endpoint of apiEndpoints) {
      // Most API endpoints will return 401 or 405 for GET requests without auth
      // We're just checking they respond, not that they work properly
      await this.testEndpoint(endpoint.path, [200, 401, 405, 500], endpoint.name);
    }
  }

  async testErrorPages() {
    console.log('\n=== TESTING ERROR PAGES ===');
    
    await this.testEndpoint('/nonexistent-page', 404, '404 Page');
    await this.testEndpoint('/api/nonexistent-endpoint', 404, '404 API Endpoint');
  }

  async checkServerStatus() {
    console.log('\n=== CHECKING SERVER STATUS ===');
    
    try {
      const { stdout } = await execAsync(`curl -s "${this.baseUrl}/health"`);
      const healthData = JSON.parse(stdout);
      
      this.results.tests.push({
        test: 'Server Health Check',
        status: 'PASS',
        data: healthData,
        timestamp: new Date().toISOString()
      });
      
      console.log('  ✅ Server is healthy');
      console.log(`  📊 Status: ${healthData.status}`);
      
    } catch (error) {
      this.results.errors.push({
        type: 'health_check_failed',
        error: error.message
      });
      
      console.log('  ❌ Health check failed:', error.message);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting 123hansa Website Tests');
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log(`📅 Started at: ${this.results.timestamp}\n`);

    await this.checkServerStatus();
    await this.testPublicPages();
    await this.testAPIEndpoints();
    await this.testSentryEndpoints();
    await this.testErrorPages();

    this.generateReport();
  }

  generateReport() {
    const passed = this.results.tests.filter(t => t.status === 'PASS').length;
    const failed = this.results.tests.filter(t => t.status === 'FAIL').length;
    const errors = this.results.tests.filter(t => t.status === 'ERROR').length;

    console.log('\n' + '='.repeat(50));
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Errors: ${errors}`);
    console.log(`📊 Total:  ${this.results.tests.length}`);

    if (this.results.errors.length > 0) {
      console.log('\n🚨 ISSUES FOUND:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.type}: ${error.test || 'Unknown test'}`);
        console.log(`   URL: ${error.url || 'N/A'}`);
        console.log(`   Error: ${error.error || error.message || 'Unknown error'}`);
        console.log('');
      });
    } else {
      console.log('\n🎉 No issues found! All tests passed.');
    }

    // Save detailed report
    const reportPath = './simple-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }
}

// Check if server is running first
const checkServer = async () => {
  try {
    await execAsync('curl -s http://localhost:3002/health');
    return true;
  } catch {
    return false;
  }
};

// Run tests
(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:3002');
    console.log('💡 Start your development server first:');
    console.log('   cd apps/web && npm run dev');
    console.log('   cd apps/api && npm run dev');
    process.exit(1);
  }

  const runner = new SimpleTestRunner();
  await runner.runAllTests();
})();