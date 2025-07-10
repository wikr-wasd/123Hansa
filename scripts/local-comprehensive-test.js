/**
 * Local Comprehensive Test Suite
 * Tests localhost deployment with full functionality check
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

class LocalTestSuite {
  constructor() {
    this.frontendUrl = 'http://localhost:3002';
    this.apiUrl = 'http://localhost:3001';
    this.results = {
      serverStatus: {},
      pageTests: [],
      apiTests: [],
      sentryTests: [],
      linkTests: [],
      buttonTests: [],
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString()
    };
  }

  async checkServerStatus() {
    console.log('🔍 Checking Server Status...\n');

    // Check frontend server
    try {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" "${this.frontendUrl}/" --max-time 5`);
      const frontendStatus = parseInt(stdout.trim());
      
      this.results.serverStatus.frontend = {
        url: this.frontendUrl,
        status: frontendStatus,
        running: frontendStatus === 200
      };

      console.log(`📱 Frontend: ${frontendStatus === 200 ? '✅ RUNNING' : '❌ NOT RUNNING'} (${this.frontendUrl})`);
      
    } catch (error) {
      this.results.serverStatus.frontend = {
        url: this.frontendUrl,
        running: false,
        error: error.message
      };
      console.log(`📱 Frontend: ❌ NOT RUNNING (${this.frontendUrl})`);
    }

    // Check API server
    try {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" "${this.apiUrl}/health" --max-time 5`);
      const apiStatus = parseInt(stdout.trim());
      
      this.results.serverStatus.api = {
        url: this.apiUrl,
        status: apiStatus,
        running: apiStatus === 200
      };

      console.log(`🔧 API: ${apiStatus === 200 ? '✅ RUNNING' : '❌ NOT RUNNING'} (${this.apiUrl})`);
      
    } catch (error) {
      this.results.serverStatus.api = {
        url: this.apiUrl,
        running: false,
        error: error.message
      };
      console.log(`🔧 API: ❌ NOT RUNNING (${this.apiUrl})`);
    }

    const bothRunning = this.results.serverStatus.frontend?.running && this.results.serverStatus.api?.running;
    
    if (!bothRunning) {
      console.log('\n❌ SERVERS NOT RUNNING');
      console.log('💡 To start servers:');
      console.log('   Terminal 1: cd apps/web && npm run dev');
      console.log('   Terminal 2: cd apps/api && npm run dev');
      return false;
    }

    console.log('\n✅ Both servers are running!');
    return true;
  }

  async testPages() {
    if (!this.results.serverStatus.frontend?.running) {
      console.log('\n❌ Skipping page tests - frontend not running');
      return;
    }

    console.log('\n📄 Testing Pages...\n');

    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/listings', name: 'Listings' },
      { path: '/crowdfunding', name: 'Crowdfunding' },
      { path: '/valuation', name: 'Valuation' },
      { path: '/professionals', name: 'Professional Services' },
      { path: '/login', name: 'Login' },
      { path: '/register', name: 'Register' },
      { path: '/help', name: 'Help' },
      { path: '/contact', name: 'Contact' },
      { path: '/legal', name: 'Legal' },
      { path: '/heart', name: 'Heart' },
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/admin', name: 'Admin' }
    ];

    for (const page of pages) {
      await this.testPage(page.path, page.name);
    }
  }

  async testPage(path, name) {
    const url = `${this.frontendUrl}${path}`;
    
    try {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" "${url}" --max-time 10`);
      const status = parseInt(stdout.trim());
      
      const result = {
        page: name,
        path: path,
        url: url,
        status: status,
        success: status === 200 || status === 302,
        timestamp: new Date().toISOString()
      };

      this.results.pageTests.push(result);
      
      if (result.success) {
        console.log(`  ✅ ${name}: ${status}`);
      } else {
        console.log(`  ❌ ${name}: ${status}`);
        this.results.errors.push({
          type: 'page_load_failed',
          page: name,
          status: status,
          url: url
        });
      }
      
    } catch (error) {
      console.log(`  ❌ ${name}: ERROR - ${error.message}`);
      this.results.errors.push({
        type: 'page_test_error',
        page: name,
        error: error.message,
        url: url
      });
    }
  }

  async testAPI() {
    if (!this.results.serverStatus.api?.running) {
      console.log('\n❌ Skipping API tests - backend not running');
      return;
    }

    console.log('\n🔧 Testing API Endpoints...\n');

    const endpoints = [
      { path: '/health', name: 'Health Check', expected: [200] },
      { path: '/metrics', name: 'Metrics', expected: [200] },
      { path: '/api/auth/login', name: 'Auth Login', expected: [405, 400] },
      { path: '/api/auth/register', name: 'Auth Register', expected: [405, 400] },
      { path: '/api/listings', name: 'Listings API', expected: [200, 401] },
      { path: '/api/users', name: 'Users API', expected: [200, 401] },
      { path: '/api/messages', name: 'Messages API', expected: [200, 401] },
      { path: '/api/admin', name: 'Admin API', expected: [200, 401, 403] }
    ];

    for (const endpoint of endpoints) {
      await this.testAPIEndpoint(endpoint.path, endpoint.name, endpoint.expected);
    }
  }

  async testAPIEndpoint(path, name, expectedStatuses) {
    const url = `${this.apiUrl}${path}`;
    
    try {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" "${url}" --max-time 10`);
      const status = parseInt(stdout.trim());
      
      const success = expectedStatuses.includes(status);
      
      const result = {
        endpoint: name,
        path: path,
        url: url,
        status: status,
        expected: expectedStatuses,
        success: success,
        timestamp: new Date().toISOString()
      };

      this.results.apiTests.push(result);
      
      if (success) {
        console.log(`  ✅ ${name}: ${status}`);
      } else {
        console.log(`  ❌ ${name}: ${status} (expected ${expectedStatuses.join('/')})`);
        this.results.errors.push({
          type: 'api_unexpected_status',
          endpoint: name,
          status: status,
          expected: expectedStatuses,
          url: url
        });
      }
      
    } catch (error) {
      console.log(`  ❌ ${name}: ERROR - ${error.message}`);
      this.results.errors.push({
        type: 'api_test_error',
        endpoint: name,
        error: error.message,
        url: url
      });
    }
  }

  async testSentry() {
    if (!this.results.serverStatus.api?.running) {
      console.log('\n❌ Skipping Sentry tests - backend not running');
      return;
    }

    console.log('\n🎯 Testing Sentry Integration...\n');

    // Test Sentry status
    try {
      console.log('1. Testing Sentry status...');
      const { stdout } = await execAsync(`curl -s "${this.apiUrl}/api/test-sentry/status"`);
      
      try {
        const data = JSON.parse(stdout);
        console.log(`   ✅ Status: ${data.message}`);
        console.log(`   📊 DSN: ${data.dsn}`);
        console.log(`   📋 Project: ${data.project}`);
        
        this.results.sentryTests.push({
          test: 'sentry_status',
          success: true,
          data: data
        });
        
      } catch (parseError) {
        console.log(`   ❌ Invalid JSON response: ${stdout.substring(0, 100)}...`);
        this.results.errors.push({
          type: 'sentry_status_invalid_json',
          response: stdout
        });
      }
      
    } catch (error) {
      console.log(`   ❌ Status test failed: ${error.message}`);
      this.results.errors.push({
        type: 'sentry_status_error',
        error: error.message
      });
    }

    // Test Sentry error trigger
    try {
      console.log('\n2. Testing Sentry error trigger...');
      const { stdout } = await execAsync(`curl -s "${this.apiUrl}/api/test-sentry/error"`);
      
      try {
        const data = JSON.parse(stdout);
        console.log(`   ✅ Error triggered: ${data.message}`);
        console.log('   📤 Check 123hansa-api Sentry project for this error');
        
        this.results.sentryTests.push({
          test: 'sentry_error_trigger',
          success: true,
          data: data
        });
        
      } catch (parseError) {
        console.log(`   ❌ Invalid JSON response: ${stdout.substring(0, 100)}...`);
        this.results.errors.push({
          type: 'sentry_error_invalid_json',
          response: stdout
        });
      }
      
    } catch (error) {
      console.log(`   ❌ Error trigger failed: ${error.message}`);
      this.results.errors.push({
        type: 'sentry_error_test_error',
        error: error.message
      });
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(70));

    // Server status
    const frontendRunning = this.results.serverStatus.frontend?.running || false;
    const apiRunning = this.results.serverStatus.api?.running || false;
    
    console.log(`🖥️  Servers: Frontend ${frontendRunning ? '✅' : '❌'} | API ${apiRunning ? '✅' : '❌'}`);

    // Page tests
    const pagesPassed = this.results.pageTests.filter(t => t.success).length;
    const pagesTotal = this.results.pageTests.length;
    console.log(`📄 Pages: ${pagesPassed}/${pagesTotal} passed`);

    // API tests
    const apiPassed = this.results.apiTests.filter(t => t.success).length;
    const apiTotal = this.results.apiTests.length;
    console.log(`🔧 API: ${apiPassed}/${apiTotal} passed`);

    // Sentry tests
    const sentryPassed = this.results.sentryTests.filter(t => t.success).length;
    const sentryTotal = this.results.sentryTests.length;
    console.log(`🎯 Sentry: ${sentryPassed}/${sentryTotal} passed`);

    // Overall stats
    console.log(`❌ Total Errors: ${this.results.errors.length}`);

    if (this.results.errors.length > 0) {
      console.log('\n🚨 ISSUES FOUND:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.type}: ${error.page || error.endpoint || 'Unknown'}`);
        if (error.status) console.log(`   Status: ${error.status}`);
        if (error.error) console.log(`   Error: ${error.error}`);
        if (error.url) console.log(`   URL: ${error.url}`);
        console.log('');
      });
    }

    // Save report
    const reportPath = './local-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed report: ${reportPath}`);

    console.log('\n🎯 NEXT STEPS FOR MANUAL TESTING:');
    if (frontendRunning) {
      console.log('1. 🌐 Open http://localhost:3002 in browser');
      console.log('2. 🔍 Check Developer Tools Console for errors');
      console.log('3. 🖱️  Test all navigation links and buttons');
      console.log('4. 📱 Test mobile responsiveness');
      console.log('5. 🧪 Add SentryTest component to test frontend errors');
    } else {
      console.log('1. ⚠️  Start frontend server: cd apps/web && npm run dev');
    }

    if (apiRunning) {
      console.log('6. 🔧 Test API endpoints work correctly');
      console.log('7. 👤 Test admin login functionality');
      console.log('8. 📊 Check Sentry dashboards for errors');
    } else {
      console.log('6. ⚠️  Start API server: cd apps/api && npm run dev');
    }

    return this.results;
  }

  async runComprehensiveTest() {
    console.log('🚀 Starting Comprehensive Local Test Suite');
    console.log(`📅 Started: ${this.results.timestamp}\n`);

    const serversRunning = await this.checkServerStatus();
    
    if (serversRunning) {
      await this.testPages();
      await this.testAPI();
      await this.testSentry();
    }

    this.generateReport();
    return this.results;
  }
}

// Run the comprehensive test
const testSuite = new LocalTestSuite();
testSuite.runComprehensiveTest().catch(console.error);