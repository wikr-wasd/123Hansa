/**
 * Staging Sentry Test - Focused on Sentry integration testing
 * Tests against Vercel staging deployment
 */

import fetch from 'node-fetch';
import fs from 'fs';

class StagingSentryTester {
  constructor(baseUrl = 'https://staging-123hansa.vercel.app') {
    this.baseUrl = baseUrl;
    this.results = {
      sentryTests: [],
      errors: [],
      timestamp: new Date().toISOString()
    };
  }

  async testSentryIntegration() {
    console.log('🔍 Testing Staging Sentry Integration...\n');

    // Test 1: Sentry Status
    try {
      console.log('1. Testing Sentry status endpoint...');
      const response = await fetch(`${this.baseUrl}/api/test-sentry/status`, {
        timeout: 15000
      });
      
      if (response.ok) {
        const data = await response.json();
        
        this.results.sentryTests.push({
          test: 'sentry_status',
          status: response.status,
          success: true,
          data: data
        });

        console.log('   ✅ Status endpoint working');
        console.log(`   📊 DSN configured: ${data.dsn}`);
        console.log(`   📋 Project: ${data.project}`);
        console.log(`   🌐 Message: ${data.message}`);
        
      } else {
        const errorText = await response.text();
        console.log('   ❌ Status endpoint failed');
        console.log(`   📄 Response: ${errorText}`);
        
        this.results.errors.push({
          type: 'status_endpoint_failed',
          status: response.status,
          response: errorText
        });
      }
    } catch (error) {
      console.log('   ❌ Status endpoint error:', error.message);
      this.results.errors.push({
        type: 'status_endpoint_error',
        error: error.message
      });
    }

    // Test 2: Trigger Backend Error for Sentry
    try {
      console.log('\n2. Testing backend error reporting to Sentry...');
      const response = await fetch(`${this.baseUrl}/api/test-sentry/error`, {
        timeout: 15000
      });
      
      if (response.status === 500) {
        const data = await response.json();
        
        this.results.sentryTests.push({
          test: 'backend_error_trigger',
          status: response.status,
          success: true,
          data: data
        });

        console.log('   ✅ Backend error triggered successfully');
        console.log('   📤 Error should now appear in 123hansa-api Sentry project');
        console.log(`   💬 Message: ${data.message}`);
        console.log(`   🆔 Error ID: Check Sentry for "Test API error for Sentry"`);
        
      } else {
        const errorText = await response.text();
        console.log('   ❌ Backend error test failed');
        console.log(`   📊 Expected 500, got ${response.status}`);
        console.log(`   📄 Response: ${errorText}`);
        
        this.results.errors.push({
          type: 'backend_error_failed',
          status: response.status,
          response: errorText
        });
      }
    } catch (error) {
      console.log('   ❌ Backend error test error:', error.message);
      this.results.errors.push({
        type: 'backend_error_test_error',
        error: error.message
      });
    }

    // Test 3: Check if frontend is loading Sentry
    try {
      console.log('\n3. Testing frontend Sentry configuration...');
      const response = await fetch(`${this.baseUrl}/`, {
        timeout: 15000
      });
      
      if (response.ok) {
        const html = await response.text();
        
        // Check if Sentry SDK is loaded
        const hasSentryScript = html.includes('sentry') || html.includes('Sentry');
        const hasViteSentryDsn = html.includes('VITE_SENTRY_DSN');
        
        console.log(`   📊 Frontend loads: ${response.ok ? 'YES' : 'NO'}`);
        console.log(`   🔍 Sentry references found: ${hasSentryScript ? 'YES' : 'NO'}`);
        console.log(`   🔑 Vite Sentry DSN: ${hasViteSentryDsn ? 'CONFIGURED' : 'NOT FOUND'}`);
        
        this.results.sentryTests.push({
          test: 'frontend_sentry_check',
          success: response.ok,
          hasSentryScript: hasSentryScript,
          hasViteSentryDsn: hasViteSentryDsn
        });
        
      } else {
        console.log('   ❌ Frontend failed to load');
        this.results.errors.push({
          type: 'frontend_load_failed',
          status: response.status
        });
      }
    } catch (error) {
      console.log('   ❌ Frontend test error:', error.message);
      this.results.errors.push({
        type: 'frontend_test_error',
        error: error.message
      });
    }
  }

  async testStagingHealth() {
    console.log('\n🏥 Testing Staging Health...\n');

    try {
      console.log('1. Testing general health endpoint...');
      const response = await fetch(`${this.baseUrl}/health`, {
        timeout: 10000
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Health check passed');
        console.log(`   📊 Status: ${data.status}`);
        console.log(`   🕐 Timestamp: ${data.timestamp}`);
        
        // Check for any health warnings
        if (data.status === 'critical') {
          console.log('   ⚠️  System status is CRITICAL');
          this.results.errors.push({
            type: 'critical_health_status',
            data: data
          });
        }
        
      } else {
        console.log('   ❌ Health check failed');
        const errorText = await response.text();
        console.log(`   📄 Response: ${errorText}`);
      }
    } catch (error) {
      console.log('   ❌ Health check error:', error.message);
    }

    // Test basic API responsiveness
    try {
      console.log('\n2. Testing API responsiveness...');
      const startTime = Date.now();
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
        timeout: 10000
      });
      const responseTime = Date.now() - startTime;
      
      console.log(`   📊 API Response Time: ${responseTime}ms`);
      console.log(`   📈 Status: ${response.status} (${response.status === 400 || response.status === 401 ? 'Expected for invalid login' : 'Unexpected'})`);
      
      if (responseTime > 5000) {
        console.log('   ⚠️  API response time is slow (>5s)');
        this.results.errors.push({
          type: 'slow_api_response',
          responseTime: responseTime
        });
      }
      
    } catch (error) {
      console.log('   ❌ API responsiveness test error:', error.message);
    }
  }

  generateSentryReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 SENTRY INTEGRATION TEST RESULTS');
    console.log('='.repeat(70));

    const successfulTests = this.results.sentryTests.filter(t => t.success).length;
    const totalTests = this.results.sentryTests.length;
    
    console.log(`✅ Successful Tests: ${successfulTests}/${totalTests}`);
    console.log(`❌ Errors Found: ${this.results.errors.length}`);

    if (this.results.errors.length > 0) {
      console.log('\n🚨 ISSUES TO INVESTIGATE:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.type}`);
        if (error.error) console.log(`   Error: ${error.error}`);
        if (error.status) console.log(`   Status: ${error.status}`);
        if (error.response) console.log(`   Response: ${error.response.substring(0, 200)}...`);
        console.log('');
      });
    }

    console.log('\n🎯 VERIFICATION STEPS:');
    console.log('1. 🔗 Check Sentry Projects:');
    console.log('   Frontend: https://sentry.io/organizations/4509641117728768/projects/4509643505795152/');
    console.log('   Backend:  https://sentry.io/organizations/4509641117728768/projects/4509643513725008/');
    
    console.log('\n2. 🖱️  Manual Frontend Test:');
    console.log('   - Open: https://staging-123hansa.vercel.app');
    console.log('   - Open Browser DevTools (F12)');
    console.log('   - Add SentryTest component to trigger frontend error');
    console.log('   - Check 123hansa-web Sentry project for errors');
    
    console.log('\n3. 🔄 Expected Sentry Behavior:');
    console.log('   - Backend errors appear in 123hansa-api project');
    console.log('   - Frontend errors appear in 123hansa-web project');
    console.log('   - Source maps should be uploaded for better debugging');
    console.log('   - Performance monitoring should be active');

    console.log('\n4. 🛠️  If Issues Found:');
    console.log('   - Check Vercel environment variables are set');
    console.log('   - Verify SENTRY_DSN values match your projects');
    console.log('   - Check SENTRY_AUTH_TOKEN is configured');
    console.log('   - Review build logs for Sentry plugin errors');

    // Save report
    const reportPath = './staging-sentry-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report: ${reportPath}`);
  }

  async runStagingSentryTests() {
    console.log('🚀 Starting Staging Sentry Tests');
    console.log(`🌐 Testing: ${this.baseUrl}`);
    console.log(`📅 Started: ${this.results.timestamp}\n`);

    await this.testSentryIntegration();
    await this.testStagingHealth();
    
    this.generateSentryReport();
    
    return this.results;
  }
}

// Run the staging Sentry tests
const tester = new StagingSentryTester();
tester.runStagingSentryTests().catch(console.error);