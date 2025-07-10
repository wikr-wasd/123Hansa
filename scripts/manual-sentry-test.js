/**
 * Manual Sentry Testing Script
 * Specifically tests Sentry integration and error reporting
 */

import fetch from 'node-fetch';

class SentryTester {
  constructor(baseUrl = 'http://localhost:3002') {
    this.baseUrl = baseUrl;
    this.results = {
      frontendTests: [],
      backendTests: [],
      errors: [],
      timestamp: new Date().toISOString()
    };
  }

  async testBackendSentry() {
    console.log('🔍 Testing Backend Sentry Integration...\n');

    // Test 1: Sentry Status
    try {
      console.log('1. Testing Sentry status endpoint...');
      const response = await fetch(`${this.baseUrl}/api/test-sentry/status`);
      const data = await response.json();
      
      this.results.backendTests.push({
        test: 'sentry_status',
        status: response.status,
        success: response.ok,
        data: data
      });

      if (response.ok) {
        console.log('   ✅ Status endpoint working');
        console.log(`   📊 DSN configured: ${data.dsn}`);
        console.log(`   📋 Project: ${data.project}`);
      } else {
        console.log('   ❌ Status endpoint failed');
        this.results.errors.push({
          type: 'status_endpoint_failed',
          status: response.status,
          data: data
        });
      }
    } catch (error) {
      console.log('   ❌ Status endpoint error:', error.message);
      this.results.errors.push({
        type: 'status_endpoint_error',
        error: error.message
      });
    }

    // Test 2: Trigger Backend Error
    try {
      console.log('\n2. Testing backend error reporting...');
      const response = await fetch(`${this.baseUrl}/api/test-sentry/error`);
      const data = await response.json();
      
      this.results.backendTests.push({
        test: 'backend_error_trigger',
        status: response.status,
        success: response.status === 500, // We expect a 500 error
        data: data
      });

      if (response.status === 500) {
        console.log('   ✅ Backend error triggered successfully');
        console.log('   📤 Error should now appear in 123hansa-api Sentry project');
        console.log(`   💬 Message: ${data.message}`);
      } else {
        console.log('   ❌ Backend error test failed');
        this.results.errors.push({
          type: 'backend_error_failed',
          status: response.status,
          data: data
        });
      }
    } catch (error) {
      console.log('   ❌ Backend error test error:', error.message);
      this.results.errors.push({
        type: 'backend_error_test_error',
        error: error.message
      });
    }
  }

  async testAPIHealthAndErrors() {
    console.log('\n🏥 Testing API Health and Error Handling...\n');

    // Test general API health
    try {
      console.log('1. Testing API health...');
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      
      console.log('   ✅ API health check passed');
      console.log(`   📊 Status: ${data.status}`);
      console.log(`   🕐 Uptime: ${data.uptime || 'Unknown'}`);
      
    } catch (error) {
      console.log('   ❌ API health check failed:', error.message);
      this.results.errors.push({
        type: 'api_health_failed',
        error: error.message
      });
    }

    // Test 404 handling
    try {
      console.log('\n2. Testing 404 error handling...');
      const response = await fetch(`${this.baseUrl}/api/nonexistent-endpoint`);
      
      if (response.status === 404) {
        console.log('   ✅ 404 handling works correctly');
      } else {
        console.log(`   ⚠️  Expected 404, got ${response.status}`);
      }
    } catch (error) {
      console.log('   ❌ 404 test error:', error.message);
    }

    // Test CORS and security headers
    try {
      console.log('\n3. Testing security headers...');
      const response = await fetch(`${this.baseUrl}/`);
      const headers = response.headers;
      
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection'
      ];

      securityHeaders.forEach(header => {
        if (headers.get(header)) {
          console.log(`   ✅ ${header}: ${headers.get(header)}`);
        } else {
          console.log(`   ⚠️  Missing header: ${header}`);
        }
      });
      
    } catch (error) {
      console.log('   ❌ Security headers test error:', error.message);
    }
  }

  generateSentryInstructions() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 SENTRY VERIFICATION INSTRUCTIONS');
    console.log('='.repeat(60));
    
    console.log('\n🔍 TO VERIFY FRONTEND SENTRY:');
    console.log('1. Open your browser to: http://localhost:3002');
    console.log('2. Open Developer Tools (F12)');
    console.log('3. Add the SentryTest component to any page');
    console.log('4. Click "Break the world" button');
    console.log('5. Check 123hansa-web project in Sentry dashboard');
    
    console.log('\n🔍 TO VERIFY BACKEND SENTRY:');
    console.log('1. Visit: http://localhost:3002/api/test-sentry/error');
    console.log('2. Check 123hansa-api project in Sentry dashboard');
    console.log('3. You should see the test error appear within 1-2 minutes');
    
    console.log('\n🎯 SENTRY PROJECT LINKS:');
    console.log('• Frontend (123hansa-web): https://sentry.io/organizations/4509641117728768/projects/4509643505795152/');
    console.log('• Backend (123hansa-api): https://sentry.io/organizations/4509641117728768/projects/4509643513725008/');
    
    console.log('\n📊 ADMIN PANEL TESTING:');
    console.log('• Test login with admin credentials');
    console.log('• Navigate through all admin sections');
    console.log('• Check for JavaScript errors in console');
    console.log('• Verify all buttons and links work');
    
    console.log('\n🌐 VERCEL STAGING TESTING:');
    console.log('• https://staging-123hansa.vercel.app/api/test-sentry/error');
    console.log('• https://staging-123hansa.vercel.app/api/test-sentry/status');
    console.log('• Make sure environment variables are set in Vercel');
  }

  async runSentryTests() {
    console.log('🚀 Starting Sentry Integration Tests');
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log(`📅 Started at: ${this.results.timestamp}\n`);

    await this.testBackendSentry();
    await this.testAPIHealthAndErrors();
    
    this.generateSentryInstructions();

    // Summary
    const backendTestsPassed = this.results.backendTests.filter(t => t.success).length;
    const totalBackendTests = this.results.backendTests.length;
    
    console.log('\n' + '='.repeat(40));
    console.log('📊 SENTRY TEST SUMMARY');
    console.log('='.repeat(40));
    console.log(`✅ Backend tests passed: ${backendTestsPassed}/${totalBackendTests}`);
    console.log(`❌ Errors encountered: ${this.results.errors.length}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 ERRORS:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.type}: ${error.error || error.message || 'Unknown'}`);
      });
    }

    return this.results;
  }
}

// Run the Sentry tests
const tester = new SentryTester();
tester.runSentryTests().catch(console.error);