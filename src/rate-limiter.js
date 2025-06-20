import { GHL_CONFIG } from './config.js';

export class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.dailyRequests = new Map();
  }
  
  canMakeRequest(resource) {
    const now = Date.now();
    const tenSecondsAgo = now - 10000;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    
    // Check burst limit (100 per 10 seconds)
    const recentRequests = this.getRecentRequests(resource, tenSecondsAgo);
    if (recentRequests.length >= GHL_CONFIG.RATE_LIMITS.BURST) {
      return false;
    }
    
    // Check daily limit (200,000 per day)
    const dailyCount = this.getDailyCount(resource, todayStart);
    if (dailyCount >= GHL_CONFIG.RATE_LIMITS.DAILY) {
      return false;
    }
    
    return true;
  }
  
  recordRequest(resource) {
    const now = Date.now();
    
    if (!this.requests.has(resource)) {
      this.requests.set(resource, []);
    }
    this.requests.get(resource).push(now);
    
    // Clean up old requests (older than 10 seconds)
    const tenSecondsAgo = now - 10000;
    const recentRequests = this.requests.get(resource).filter(time => time > tenSecondsAgo);
    this.requests.set(resource, recentRequests);
    
    // Update daily count
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const key = `${resource}-${todayStart}`;
    this.dailyRequests.set(key, (this.dailyRequests.get(key) || 0) + 1);
    
    // Clean up old daily counts (older than 1 day)
    for (const [k, _] of this.dailyRequests) {
      const dateStr = k.split('-').pop();
      if (parseInt(dateStr) < todayStart) {
        this.dailyRequests.delete(k);
      }
    }
  }
  
  getRecentRequests(resource, since) {
    const requests = this.requests.get(resource) || [];
    return requests.filter(time => time > since);
  }
  
  getDailyCount(resource, dayStart) {
    const key = `${resource}-${dayStart}`;
    return this.dailyRequests.get(key) || 0;
  }
  
  getRemainingRequests(resource) {
    const now = Date.now();
    const tenSecondsAgo = now - 10000;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    
    const recentRequests = this.getRecentRequests(resource, tenSecondsAgo);
    const dailyCount = this.getDailyCount(resource, todayStart);
    
    return {
      burst: Math.max(0, GHL_CONFIG.RATE_LIMITS.BURST - recentRequests.length),
      daily: Math.max(0, GHL_CONFIG.RATE_LIMITS.DAILY - dailyCount),
      nextBurstReset: recentRequests.length > 0 ? recentRequests[0] + 10000 : now,
      nextDailyReset: new Date(todayStart + 86400000).toISOString()
    };
  }
}