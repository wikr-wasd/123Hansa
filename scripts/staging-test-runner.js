/**
 * Staging Test Runner for 123hansa Website
 * Tests against Vercel staging deployment
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

class StagingTestRunner {
  constructor(baseUrl = 'https://staging-123hansa.vercel.app') {
    this.baseUrl = baseUrl;
    this.results = {
      tests: [],
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString()
    };
  }

  async testEndpoint(path, expectedStatuses = [200], description = '') {
    const url = `${this.baseUrl}${path}`;
    const testName = description || `GET ${path}`;
    
    console.log(`Testing: ${testName}`);
    
    try {
      const { stdout, stderr } = await execAsync(`curl -s -w "%{http_code}" -o /dev/null "${url}" --max-time 30`);
      const statusCode = parseInt(stdout.trim());
      
      const expectedArray = Array.isArray(expectedStatuses) ? expectedStatuses : [expectedStatuses];
      const isSuccess = expectedArray.includes(statusCode);
      
      const result = {
        test: testName,
        url: url,
        expected: expectedArray,
        actual: statusCode,
        status: isSuccess ? 'PASS' : 'FAIL',
        timestamp: new Date().toISOString()
      };

      this.results.tests.push(result);
      
      if (!isSuccess) {
        this.results.errors.push({
          type: 'status_code_mismatch',
          test: testName,
          url: url,
          expected: expectedArray,
          actual: statusCode
        });
      }

      console.log(`  ${result.status}: ${statusCode} (expected ${expectedArray.join(' or ')})`);
      
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
    
    await this.testEndpoint('/api/test-sentry/status', [200], 'Sentry Status Check');
    await this.testEndpoint('/api/test-sentry/error', [500], 'Sentry Error Test');
    
    // Get actual response content for Sentry tests
    try {
      console.log('\nFetching Sentry status details...');
      const { stdout } = await execAsync(`curl -s "${this.baseUrl}/api/test-sentry/status"`);
      console.log('Sentry Status Response:', stdout);
    } catch (error) {
      console.log('Could not fetch Sentry status details:', error.message);
    }
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
      { path: '/heart', name: 'Heart Page' },
      { path: '/dashboard', name: 'Dashboard Page (may redirect)' },
      { path: '/admin', name: 'Admin Panel (may redirect)' }
    ];

    for (const page of pages) {
      await this.testEndpoint(page.path, [200, 302, 401], page.name);
    }
  }

  async testAPIEndpoints() {
    console.log('\n=== TESTING API ENDPOINTS ===');
    
    const apiEndpoints = [
      { path: '/api/auth/login', name: 'Auth Login API', expected: [405, 400] }, // POST only
      { path: '/api/auth/register', name: 'Auth Register API', expected: [405, 400] }, // POST only
      { path: '/api/listings', name: 'Listings API', expected: [200, 401] },
      { path: '/api/users', name: 'Users API', expected: [200, 401] },
      { path: '/api/messages', name: 'Messages API', expected: [200, 401] },
      { path: '/api/admin', name: 'Admin API', expected: [200, 401, 403] },
      { path: '/health', name: 'Health Check', expected: [200] },
      { path: '/metrics', name: 'Metrics Endpoint', expected: [200, 401] }
    ];

    for (const endpoint of apiEndpoints) {
      await this.testEndpoint(endpoint.path, endpoint.expected, endpoint.name);
    }
  }

  async testErrorPages() {
    console.log('\n=== TESTING ERROR PAGES ===');
    
    await this.testEndpoint('/nonexistent-page', [404], '404 Page');
    await this.testEndpoint('/api/nonexistent-endpoint', [404], '404 API Endpoint');
  }

  async checkDeploymentStatus() {
    console.log('\n=== CHECKING DEPLOYMENT STATUS ===');
    
    try {
      const { stdout } = await execAsync(`curl -s -I "${this.baseUrl}/" --max-time 10`);
      
      // Parse headers
      const headers = stdout.split('\n').reduce((acc, line) => {
        const [key, value] = line.split(': ');
        if (key && value) {
          acc[key.toLowerCase()] = value.trim();
        }
        return acc;
      }, {});

      console.log('✅ Deployment is accessible');
      console.log(`🌐 Server: ${headers.server || 'Unknown'}`);
      console.log(`📅 Date: ${headers.date || 'Unknown'}`);
      console.log(`🔒 Security Headers: ${headers['x-frame-options'] ? 'Present' : 'Missing'}`);
      
      this.results.tests.push({
        test: 'Deployment Status Check',
        status: 'PASS',
        headers: headers,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      this.results.errors.push({
        type: 'deployment_check_failed',
        error: error.message
      });
      
      console.log('❌ Deployment check failed:', error.message);
    }
  }

  async testStagingSpecificFeatures() {
    console.log('\n=== TESTING STAGING-SPECIFIC FEATURES ===');
    
    // Test if staging has proper redirects
    try {
      const { stdout } = await execAsync(`curl -s -L -w "%{url_effective}|%{http_code}" -o /dev/null "${this.baseUrl}/admin"`);
      const [finalUrl, statusCode] = stdout.split('|');
      
      console.log(`Admin redirect test: ${statusCode} -> ${finalUrl}`);
      
      this.results.tests.push({
        test: 'Admin Redirect Test',
        finalUrl: finalUrl,
        statusCode: parseInt(statusCode),
        status: 'INFO'
      });
      
    } catch (error) {
      console.log('Admin redirect test failed:', error.message);
    }

    // Test CORS headers
    try {
      const { stdout } = await execAsync(`curl -s -H "Origin: https://123hansa.se" -I "${this.baseUrl}/api/listings"`);
      const hasCors = stdout.includes('access-control-allow-origin');
      
      console.log(`CORS test: ${hasCors ? 'PASS' : 'FAIL'}`);
      
      this.results.tests.push({
        test: 'CORS Headers Test',
        hasCors: hasCors,
        status: hasCors ? 'PASS' : 'WARN'
      });
      
    } catch (error) {
      console.log('CORS test failed:', error.message);
    }
  }

  async runStagingTests() {
    console.log('🚀 Starting 123hansa Staging Tests');
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log(`📅 Started at: ${this.results.timestamp}\n`);

    await this.checkDeploymentStatus();
    await this.testPublicPages();
    await this.testAPIEndpoints();
    await this.testSentryEndpoints();
    await this.testErrorPages();
    await this.testStagingSpecificFeatures();

    this.generateReport();
  }

  generateReport() {
    const passed = this.results.tests.filter(t => t.status === 'PASS').length;
    const failed = this.results.tests.filter(t => t.status === 'FAIL').length;
    const errors = this.results.tests.filter(t => t.status === 'ERROR').length;
    const warnings = this.results.tests.filter(t => t.status === 'WARN').length;

    console.log('\n' + '='.repeat(60));
    console.log('📋 STAGING TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed:   ${passed}`);
    console.log(`❌ Failed:   ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`🚨 Errors:   ${errors}`);
    console.log(`📊 Total:    ${this.results.tests.length}`);

    if (this.results.errors.length > 0) {
      console.log('\n🚨 ISSUES FOUND:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.type}: ${error.test || 'Unknown test'}`);
        console.log(`   URL: ${error.url || 'N/A'}`);
        console.log(`   Error: ${error.error || error.message || 'Unknown error'}`);
        if (error.expected && error.actual) {
          console.log(`   Expected: ${error.expected}, Got: ${error.actual}`);
        }
        console.log('');
      });
    } else {
      console.log('\n🎉 No critical issues found!');
    }

    // Save detailed report
    const reportPath = './staging-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);

    console.log('\n🔗 NEXT STEPS:');
    console.log('1. Manual testing: Open https://staging-123hansa.vercel.app in browser');
    console.log('2. Test admin login with your credentials');
    console.log('3. Check Sentry dashboards for error reports:');
    console.log('   - Frontend: https://sentry.io/organizations/4509641117728768/projects/4509643505795152/');
    console.log('   - Backend: https://sentry.io/organizations/4509641117728768/projects/4509643513725008/');
    console.log('4. Test form submissions and user interactions');
    console.log('5. Verify mobile responsiveness');
  }
}

// Run staging tests
const runner = new StagingTestRunner();
runner.runStagingTests().catch(console.error);