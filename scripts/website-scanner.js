/**
 * Comprehensive 123hansa Website Scanner
 * Tests all pages, links, buttons, admin panels, and Sentry integration
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

class WebsiteScanner {
  constructor(baseUrl = 'http://localhost:3002') {
    this.baseUrl = baseUrl;
    this.browser = null;
    this.page = null;
    this.results = {
      errors: [],
      warnings: [],
      brokenLinks: [],
      nonFunctionalButtons: [],
      pageTests: [],
      sentryTests: [],
      adminTests: [],
      timestamp: new Date().toISOString()
    };
  }

  async init() {
    this.browser = await puppeteer.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Listen for console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.results.errors.push({
          type: 'console_error',
          message: msg.text(),
          url: this.page.url(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Listen for page errors
    this.page.on('pageerror', error => {
      this.results.errors.push({
        type: 'page_error',
        message: error.message,
        stack: error.stack,
        url: this.page.url(),
        timestamp: new Date().toISOString()
      });
    });

    // Listen for failed requests
    this.page.on('requestfailed', request => {
      this.results.errors.push({
        type: 'request_failed',
        url: request.url(),
        failure: request.failure().errorText,
        page: this.page.url(),
        timestamp: new Date().toISOString()
      });
    });
  }

  async testPage(url, pageName) {
    console.log(`Testing page: ${pageName} (${url})`);
    
    try {
      const response = await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      const pageTest = {
        page: pageName,
        url: url,
        status: response.status(),
        title: await this.page.title(),
        timestamp: new Date().toISOString()
      };

      // Check for broken images
      const brokenImages = await this.page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => !img.complete || img.naturalHeight === 0)
                    .map(img => ({ src: img.src, alt: img.alt }));
      });

      if (brokenImages.length > 0) {
        pageTest.brokenImages = brokenImages;
        this.results.warnings.push({
          type: 'broken_images',
          page: pageName,
          images: brokenImages
        });
      }

      // Check for broken links
      const links = await this.page.$$eval('a[href]', links => 
        links.map(link => ({
          href: link.href,
          text: link.textContent.trim(),
          hasOnClick: !!link.onclick
        }))
      );

      for (const link of links) {
        if (link.href.startsWith('http') && !link.href.includes(this.baseUrl.replace('http://localhost:3002', ''))) {
          // External link - just check if it exists
          continue;
        }
        
        if (link.href.includes('javascript:') || link.href === '#' || link.hasOnClick) {
          // Skip JavaScript links and onclick handlers
          continue;
        }

        // Test internal links
        try {
          const linkResponse = await this.page.goto(link.href, { waitUntil: 'domcontentloaded', timeout: 10000 });
          if (linkResponse.status() >= 400) {
            this.results.brokenLinks.push({
              page: pageName,
              link: link.href,
              text: link.text,
              status: linkResponse.status()
            });
          }
        } catch (error) {
          this.results.brokenLinks.push({
            page: pageName,
            link: link.href,
            text: link.text,
            error: error.message
          });
        }
      }

      // Check for non-functional buttons
      const buttons = await this.page.$$eval('button, input[type="button"], input[type="submit"]', buttons => 
        buttons.map(btn => ({
          text: btn.textContent.trim() || btn.value,
          type: btn.type,
          disabled: btn.disabled,
          hasOnClick: !!btn.onclick,
          hasForm: !!btn.form,
          id: btn.id,
          className: btn.className
        }))
      );

      const nonFunctionalButtons = buttons.filter(btn => 
        !btn.disabled && 
        !btn.hasOnClick && 
        !btn.hasForm && 
        btn.type !== 'submit' &&
        !btn.className.includes('sentry-test') // Skip our test buttons
      );

      if (nonFunctionalButtons.length > 0) {
        pageTest.nonFunctionalButtons = nonFunctionalButtons;
        this.results.nonFunctionalButtons.push({
          page: pageName,
          buttons: nonFunctionalButtons
        });
      }

      this.results.pageTests.push(pageTest);
      
      // Return to original URL
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
      
    } catch (error) {
      this.results.errors.push({
        type: 'page_test_error',
        page: pageName,
        url: url,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async testSentryIntegration() {
    console.log('Testing Sentry integration...');
    
    try {
      // Test frontend Sentry
      await this.page.goto(`${this.baseUrl}/`);
      
      // Try to trigger a test error if SentryTest component exists
      const sentryTestButton = await this.page.$('button:contains("Break the world")');
      if (sentryTestButton) {
        console.log('Found Sentry test button, triggering test error...');
        
        // Click the test button and catch the error
        try {
          await sentryTestButton.click();
        } catch (error) {
          this.results.sentryTests.push({
            type: 'frontend_test',
            status: 'success',
            message: 'Test error triggered successfully',
            error: error.message
          });
        }
      }

      // Test backend Sentry API
      const apiResponse = await this.page.goto(`${this.baseUrl}/api/test-sentry/status`);
      const statusData = await this.page.evaluate(() => {
        return JSON.parse(document.querySelector('pre').textContent);
      });

      this.results.sentryTests.push({
        type: 'backend_status',
        status: apiResponse.status(),
        data: statusData
      });

      // Test backend error endpoint
      const errorResponse = await this.page.goto(`${this.baseUrl}/api/test-sentry/error`);
      const errorData = await this.page.evaluate(() => {
        return JSON.parse(document.querySelector('pre').textContent);
      });

      this.results.sentryTests.push({
        type: 'backend_error_test',
        status: errorResponse.status(),
        data: errorData
      });

    } catch (error) {
      this.results.errors.push({
        type: 'sentry_test_error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async testAdminPanel(username, password, panelType = 'admin') {
    console.log(`Testing ${panelType} panel...`);
    
    try {
      // Go to login page
      await this.page.goto(`${this.baseUrl}/login`);
      
      // Fill login form
      await this.page.type('input[type="email"]', username);
      await this.page.type('input[type="password"]', password);
      
      // Submit login
      await this.page.click('button[type="submit"]');
      await this.page.waitForNavigation();

      // Check if logged in successfully
      const currentUrl = this.page.url();
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/admin')) {
        this.results.adminTests.push({
          type: panelType,
          status: 'login_success',
          redirectUrl: currentUrl
        });

        // Test admin navigation
        const adminLinks = await this.page.$$eval('nav a, .sidebar a', links => 
          links.map(link => ({
            href: link.href,
            text: link.textContent.trim()
          }))
        );

        for (const link of adminLinks) {
          try {
            await this.page.goto(link.href);
            await this.page.waitForLoadState('domcontentloaded');
            
            this.results.adminTests.push({
              type: `${panelType}_navigation`,
              link: link.href,
              text: link.text,
              status: 'success'
            });
          } catch (error) {
            this.results.adminTests.push({
              type: `${panelType}_navigation`,
              link: link.href,
              text: link.text,
              status: 'error',
              error: error.message
            });
          }
        }

      } else {
        this.results.adminTests.push({
          type: panelType,
          status: 'login_failed',
          currentUrl: currentUrl
        });
      }

    } catch (error) {
      this.results.errors.push({
        type: `${panelType}_test_error`,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async runFullScan() {
    console.log('Starting comprehensive website scan...');
    
    await this.init();

    // Define pages to test
    const pagesToTest = [
      { url: `${this.baseUrl}/`, name: 'Homepage' },
      { url: `${this.baseUrl}/listings`, name: 'Listings' },
      { url: `${this.baseUrl}/crowdfunding`, name: 'Crowdfunding' },
      { url: `${this.baseUrl}/valuation`, name: 'Valuation' },
      { url: `${this.baseUrl}/professionals`, name: 'Professional Services' },
      { url: `${this.baseUrl}/login`, name: 'Login' },
      { url: `${this.baseUrl}/register`, name: 'Register' },
      { url: `${this.baseUrl}/help`, name: 'Help' },
      { url: `${this.baseUrl}/contact`, name: 'Contact' },
      { url: `${this.baseUrl}/legal`, name: 'Legal' },
      { url: `${this.baseUrl}/dashboard`, name: 'Dashboard' },
      { url: `${this.baseUrl}/admin`, name: 'Admin Panel' }
    ];

    // Test all pages
    for (const page of pagesToTest) {
      await this.testPage(page.url, page.name);
    }

    // Test Sentry integration
    await this.testSentryIntegration();

    // Test admin panels (you'll need to provide credentials)
    // await this.testAdminPanel('willi@example.com', 'password', 'willi_admin');
    // await this.testAdminPanel('customer@example.com', 'password', 'customer_admin');

    await this.browser.close();

    // Generate report
    this.generateReport();
    
    console.log('Scan completed! Check the report at: ./scan-report.json');
    return this.results;
  }

  generateReport() {
    const reportPath = path.join(process.cwd(), 'scan-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

    // Generate summary
    const summary = {
      totalErrors: this.results.errors.length,
      totalWarnings: this.results.warnings.length,
      brokenLinks: this.results.brokenLinks.length,
      nonFunctionalButtons: this.results.nonFunctionalButtons.length,
      pagesScanned: this.results.pageTests.length,
      sentryTestsRun: this.results.sentryTests.length,
      adminTestsRun: this.results.adminTests.length,
      timestamp: this.results.timestamp
    };

    console.log('\n=== SCAN SUMMARY ===');
    console.log(JSON.stringify(summary, null, 2));

    if (this.results.errors.length > 0) {
      console.log('\n=== CRITICAL ERRORS ===');
      this.results.errors.forEach(error => {
        console.log(`❌ ${error.type}: ${error.message}`);
      });
    }

    if (this.results.brokenLinks.length > 0) {
      console.log('\n=== BROKEN LINKS ===');
      this.results.brokenLinks.forEach(link => {
        console.log(`🔗 ${link.page}: ${link.link} (${link.text})`);
      });
    }

    if (this.results.nonFunctionalButtons.length > 0) {
      console.log('\n=== NON-FUNCTIONAL BUTTONS ===');
      this.results.nonFunctionalButtons.forEach(btn => {
        console.log(`🔘 ${btn.page}: ${btn.buttons.length} buttons need functionality`);
      });
    }
  }
}

// Run the scanner
const scanner = new WebsiteScanner();
scanner.runFullScan().catch(console.error);