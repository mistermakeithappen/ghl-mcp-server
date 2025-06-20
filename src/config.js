export const GHL_CONFIG = {
  BASE_URL: 'https://services.leadconnectorhq.com',
  OAUTH_BASE: 'https://marketplace.gohighlevel.com',
  OAUTH_BASE_WHITE_LABEL: 'https://marketplace.leadconnectorhq.com',
  API_VERSION: '2021-07-28',
  RATE_LIMITS: {
    BURST: 100, // per 10 seconds
    DAILY: 200000 // per day
  }
};

export const OAUTH_SCOPES = [
  // Core scopes
  'contacts.readonly', 'contacts.write',
  'conversations.readonly', 'conversations.write',
  'calendars.readonly', 'calendars.write',
  'calendars/events.readonly', 'calendars/events.write',
  
  // Business scopes
  'opportunities.readonly', 'opportunities.write',
  'payments/orders.readonly', 'payments/orders.write',
  'products.readonly', 'products.write',
  
  // Automation scopes
  'workflows.readonly', 'workflows.write',
  'campaigns.readonly', 'campaigns.write',
  'forms.readonly', 'forms.write',
  
  // Additional scopes
  'users.readonly', 'users.write',
  'locations.readonly', 'locations.write',
  'businesses.readonly', 'businesses.write',
  'companies.readonly', 'companies.write',
  'snapshots.readonly', 'snapshots.write',
  'medias.readonly', 'medias.write',
  'surveys.readonly', 'surveys.write',
  'social.readonly', 'social.write',
  'links.readonly', 'links.write',
  'courses.readonly', 'courses.write',
  'saas.readonly', 'saas.write',
  'oauth.readonly', 'oauth.write'
];