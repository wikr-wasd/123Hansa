import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

interface RequestPattern {
  count: number;
  timestamps: number[];
  userAgent: string;
  endpoints: Set<string>;
}

interface SuspiciousActivity {
  ip: string;
  reason: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class DDoSProtection {
  private requestMap: Map<string, RequestPattern> = new Map();
  private suspiciousIPs: Map<string, SuspiciousActivity[]> = new Map();
  private bannedIPs: Set<string> = new Set();
  private cleanupInterval: NodeJS.Timer;
  
  // Configuration
  private readonly config = {
    // Request thresholds
    maxRequestsPerMinute: 60,
    maxRequestsPer5Minutes: 200,
    maxRequestsPerHour: 1000,
    
    // Pattern detection
    maxSameEndpointPerMinute: 30,
    maxUniqueEndpointsPerMinute: 20,
    
    // Timing thresholds (ms)
    minRequestInterval: 100, // Minimum time between requests
    suspiciousRequestInterval: 50, // Faster than this is suspicious
    
    // Ban durations (ms)
    tempBanDuration: 15 * 60 * 1000, // 15 minutes
    longBanDuration: 60 * 60 * 1000, // 1 hour
    permanentBanThreshold: 5, // Number of violations before permanent ban
    
    // Cleanup interval
    cleanupIntervalMs: 5 * 60 * 1000 // 5 minutes
  };
  
  constructor() {
    this.startCleanupTask();
  }
  
  // Main middleware function
  public middleware = (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = this.getClientIP(req);
    const now = Date.now();
    
    // Check if IP is banned
    if (this.isBanned(clientIP)) {
      this.logSuspiciousActivity(clientIP, 'Attempt to access while banned', 'high');
      res.status(429).json({
        success: false,
        message: 'Din IP-adress har blockerats på grund av misstänkt aktivitet',
        retryAfter: this.config.tempBanDuration / 1000
      });
      return;
    }
    
    // Get or create request pattern for this IP
    const pattern = this.getRequestPattern(clientIP, req);
    
    // Check various DDoS patterns
    const violations = this.checkViolations(pattern, req, now);
    
    if (violations.length > 0) {
      this.handleViolations(clientIP, violations, res);
      return;
    }
    
    // Update request pattern
    this.updateRequestPattern(clientIP, pattern, req, now);
    
    // Add security headers
    this.addSecurityHeaders(res);
    
    next();
  };
  
  private getClientIP(req: Request): string {
    // Get real IP, considering proxies
    return req.ip || 
           req.headers['x-forwarded-for'] as string ||
           req.headers['x-real-ip'] as string ||
           req.connection.remoteAddress ||
           'unknown';
  }
  
  private getRequestPattern(ip: string, req: Request): RequestPattern {
    if (!this.requestMap.has(ip)) {
      this.requestMap.set(ip, {
        count: 0,
        timestamps: [],
        userAgent: req.get('User-Agent') || 'unknown',
        endpoints: new Set()
      });
    }
    return this.requestMap.get(ip)!;
  }
  
  private checkViolations(pattern: RequestPattern, req: Request, now: number): string[] {
    const violations: string[] = [];
    const oneMinuteAgo = now - 60 * 1000;
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    
    // Count recent requests
    const recentRequests = pattern.timestamps.filter(t => t > oneMinuteAgo);
    const recent5MinRequests = pattern.timestamps.filter(t => t > fiveMinutesAgo);
    const recentHourRequests = pattern.timestamps.filter(t => t > oneHourAgo);
    
    // Check request rate violations
    if (recentRequests.length > this.config.maxRequestsPerMinute) {
      violations.push(`För många förfrågningar per minut: ${recentRequests.length}`);
    }
    
    if (recent5MinRequests.length > this.config.maxRequestsPer5Minutes) {
      violations.push(`För många förfrågningar per 5 minuter: ${recent5MinRequests.length}`);
    }
    
    if (recentHourRequests.length > this.config.maxRequestsPerHour) {
      violations.push(`För många förfrågningar per timme: ${recentHourRequests.length}`);
    }
    
    // Check request timing patterns
    if (pattern.timestamps.length >= 2) {
      const lastRequestTime = pattern.timestamps[pattern.timestamps.length - 1];
      const timeDiff = now - lastRequestTime;
      
      if (timeDiff < this.config.suspiciousRequestInterval) {
        violations.push(`Misstänkt snabb förfrågningsfrekvens: ${timeDiff}ms`);
      }
    }
    
    // Check same endpoint spam
    const currentEndpoint = req.originalUrl;
    const recentSameEndpoint = Array.from(pattern.endpoints).filter(endpoint => 
      endpoint === currentEndpoint
    ).length;
    
    if (recentSameEndpoint > this.config.maxSameEndpointPerMinute) {
      violations.push(`För många förfrågningar till samma endpoint: ${currentEndpoint}`);
    }
    
    // Check endpoint diversity (crawling detection)
    if (pattern.endpoints.size > this.config.maxUniqueEndpointsPerMinute) {
      violations.push(`För många unika endpoints: ${pattern.endpoints.size}`);
    }
    
    // Check for bot patterns
    const userAgent = req.get('User-Agent') || '';
    if (this.isBotUserAgent(userAgent)) {
      violations.push(`Bot user agent: ${userAgent}`);
    }
    
    // Check for suspicious headers
    if (this.hasSuspiciousHeaders(req)) {
      violations.push('Misstänka HTTP-headers');
    }
    
    return violations;
  }
  
  private isBotUserAgent(userAgent: string): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /harvester/i,
      /libwww/i,
      /python/i,
      /curl/i,
      /wget/i,
      /http/i,
      /scanner/i,
      /nmap/i,
      /nikto/i,
      /masscan/i,
      /zmap/i
    ];
    
    return botPatterns.some(pattern => pattern.test(userAgent));
  }
  
  private hasSuspiciousHeaders(req: Request): boolean {
    const headers = req.headers;
    
    // Check for missing common headers
    if (!headers['user-agent'] || !headers['accept']) {
      return true;
    }
    
    // Check for suspicious header combinations
    if (headers['x-forwarded-for'] && typeof headers['x-forwarded-for'] === 'string') {
      const forwardedIPs = headers['x-forwarded-for'].split(',').length;
      if (forwardedIPs > 5) { // Suspicious proxy chain
        return true;
      }
    }
    
    // Check for automated tool headers
    const suspiciousHeaders = [
      'x-scanner',
      'x-exploit',
      'x-hack',
      'x-sql',
      'x-xss'
    ];
    
    return suspiciousHeaders.some(header => headers[header]);
  }
  
  private handleViolations(ip: string, violations: string[], res: Response): void {
    const severity = this.calculateSeverity(violations);
    
    // Log the violation
    this.logSuspiciousActivity(ip, violations.join('; '), severity);
    
    // Apply appropriate response based on severity
    switch (severity) {
      case 'low':
        // Just log and slow down
        setTimeout(() => {
          res.status(429).json({
            success: false,
            message: 'Vänligen sakta ner dina förfrågningar',
            violations: violations
          });
        }, 1000);
        break;
        
      case 'medium':
        // Temporary slow down
        this.tempBanIP(ip, this.config.tempBanDuration / 2);
        res.status(429).json({
          success: false,
          message: 'För många förfrågningar - tillfälligt blockerad',
          retryAfter: this.config.tempBanDuration / 2000
        });
        break;
        
      case 'high':
        // Temporary ban
        this.tempBanIP(ip, this.config.tempBanDuration);
        res.status(429).json({
          success: false,
          message: 'Misstänkt aktivitet upptäckt - tillfälligt blockerad',
          retryAfter: this.config.tempBanDuration / 1000
        });
        break;
        
      case 'critical':
        // Longer ban and alert
        this.tempBanIP(ip, this.config.longBanDuration);
        this.alertAdministrators(ip, violations);
        res.status(429).json({
          success: false,
          message: 'Kritisk säkerhetsvarning - IP blockerad',
          retryAfter: this.config.longBanDuration / 1000
        });
        break;
    }
  }
  
  private calculateSeverity(violations: string[]): 'low' | 'medium' | 'high' | 'critical' {
    let score = 0;
    
    violations.forEach(violation => {
      if (violation.includes('snabb förfrågningsfrekvens')) score += 3;
      if (violation.includes('Bot user agent')) score += 4;
      if (violation.includes('per minut:')) score += 2;
      if (violation.includes('per timme:')) score += 1;
      if (violation.includes('samma endpoint')) score += 3;
      if (violation.includes('unika endpoints')) score += 2;
      if (violation.includes('Misstänka')) score += 4;
    });
    
    if (score >= 10) return 'critical';
    if (score >= 7) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }
  
  private logSuspiciousActivity(ip: string, reason: string, severity: 'low' | 'medium' | 'high' | 'critical'): void {
    const activity: SuspiciousActivity = {
      ip,
      reason,
      timestamp: Date.now(),
      severity
    };
    
    if (!this.suspiciousIPs.has(ip)) {
      this.suspiciousIPs.set(ip, []);
    }
    
    this.suspiciousIPs.get(ip)!.push(activity);
    
    // Log to console (in production, send to monitoring service)
    console.warn(`[SECURITY] ${severity.toUpperCase()}: IP ${ip} - ${reason}`);
    
    // Check if IP should be permanently banned
    const activities = this.suspiciousIPs.get(ip)!;
    const recentActivities = activities.filter(a => 
      Date.now() - a.timestamp < this.config.longBanDuration
    );
    
    if (recentActivities.length >= this.config.permanentBanThreshold) {
      this.permanentlyBanIP(ip);
    }
  }
  
  private tempBanIP(ip: string, duration: number): void {
    this.bannedIPs.add(ip);
    
    setTimeout(() => {
      this.bannedIPs.delete(ip);
      console.log(`[SECURITY] Temporary ban lifted for IP: ${ip}`);
    }, duration);
    
    console.log(`[SECURITY] Temporarily banned IP: ${ip} for ${duration/1000} seconds`);
  }
  
  private permanentlyBanIP(ip: string): void {
    this.bannedIPs.add(ip);
    console.error(`[SECURITY] PERMANENTLY BANNED IP: ${ip}`);
    
    // In production, add to persistent ban list
    // await this.addToPermanentBanList(ip);
  }
  
  private isBanned(ip: string): boolean {
    return this.bannedIPs.has(ip);
  }
  
  private updateRequestPattern(ip: string, pattern: RequestPattern, req: Request, now: number): void {
    pattern.count++;
    pattern.timestamps.push(now);
    pattern.endpoints.add(req.originalUrl);
    
    // Keep only recent timestamps (last hour)
    const oneHourAgo = now - 60 * 60 * 1000;
    pattern.timestamps = pattern.timestamps.filter(t => t > oneHourAgo);
    
    // Limit endpoints set size
    if (pattern.endpoints.size > 100) {
      const endpointsArray = Array.from(pattern.endpoints);
      pattern.endpoints = new Set(endpointsArray.slice(-50));
    }
  }
  
  private addSecurityHeaders(res: Response): void {
    res.set({
      'X-RateLimit-Remaining': '1',
      'X-Security-Monitor': 'active',
      'X-DDoS-Protection': 'enabled'
    });
  }
  
  private alertAdministrators(ip: string, violations: string[]): void {
    // In production, send email/SMS/Slack notification
    console.error(`[CRITICAL SECURITY ALERT] IP ${ip} triggered critical violations:`, violations);
    
    // Could integrate with services like:
    // - SendGrid for email alerts
    // - Twilio for SMS alerts
    // - Slack webhook for team notifications
    // - PagerDuty for incident management
  }
  
  private startCleanupTask(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupIntervalMs);
  }
  
  private cleanup(): void {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    // Clean up old request patterns
    for (const [ip, pattern] of this.requestMap.entries()) {
      pattern.timestamps = pattern.timestamps.filter(t => t > oneHourAgo);
      
      if (pattern.timestamps.length === 0) {
        this.requestMap.delete(ip);
      }
    }
    
    // Clean up old suspicious activities
    for (const [ip, activities] of this.suspiciousIPs.entries()) {
      const recentActivities = activities.filter(a => 
        now - a.timestamp < this.config.longBanDuration
      );
      
      if (recentActivities.length === 0) {
        this.suspiciousIPs.delete(ip);
      } else {
        this.suspiciousIPs.set(ip, recentActivities);
      }
    }
    
    console.log(`[SECURITY] Cleanup completed. Monitoring ${this.requestMap.size} IPs`);
  }
  
  // Public methods for administration
  public getBannedIPs(): string[] {
    return Array.from(this.bannedIPs);
  }
  
  public getSuspiciousIPs(): Map<string, SuspiciousActivity[]> {
    return new Map(this.suspiciousIPs);
  }
  
  public unbanIP(ip: string): boolean {
    return this.bannedIPs.delete(ip);
  }
  
  public getStats(): object {
    return {
      totalIPs: this.requestMap.size,
      bannedIPs: this.bannedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      config: this.config
    };
  }
  
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Create singleton instance
const ddosProtection = new DDoSProtection();

// Export middleware
export const ddosProtectionMiddleware = ddosProtection.middleware;
export const getDDoSStats = () => ddosProtection.getStats();
export const getBannedIPs = () => ddosProtection.getBannedIPs();
export const unbanIP = (ip: string) => ddosProtection.unbanIP(ip);
export const getSuspiciousIPs = () => ddosProtection.getSuspiciousIPs();

export default ddosProtection;