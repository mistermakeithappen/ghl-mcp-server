export class ErrorHandler {
  static async handleAPIError(error, context = {}) {
    // Handle standard errors
    if (!error.response && !error.status) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error occurred',
            context: context.resource
          }, null, 2)
        }]
      };
    }
    
    const status = error.status || error.response?.status;
    const data = error.data || {};
    
    let errorMessage;
    let userMessage;
    
    switch (status) {
      case 400:
        errorMessage = 'Bad Request';
        userMessage = data.message || 'Invalid request parameters. Please check your input.';
        break;
        
      case 401:
        errorMessage = 'Unauthorized';
        userMessage = 'Invalid or expired token. Please authenticate again.';
        break;
        
      case 403:
        errorMessage = 'Forbidden';
        userMessage = 'Insufficient permissions. Make sure your token has the required scopes.';
        break;
        
      case 404:
        errorMessage = 'Not Found';
        userMessage = `The requested ${context.resource || 'resource'} was not found.`;
        break;
        
      case 422:
        errorMessage = 'Unprocessable Entity';
        userMessage = data.message || 'The request contains invalid data.';
        if (data.errors) {
          userMessage += '\nErrors: ' + JSON.stringify(data.errors, null, 2);
        }
        break;
        
      case 429:
        errorMessage = 'Rate Limited';
        const retryAfter = error.response?.headers?.get?.('X-RateLimit-Reset') || '60';
        userMessage = `Rate limit exceeded. Please try again after ${retryAfter} seconds.`;
        break;
        
      case 500:
        errorMessage = 'Internal Server Error';
        userMessage = 'GoHighLevel service error. Please try again later.';
        break;
        
      case 502:
        errorMessage = 'Bad Gateway';
        userMessage = 'GoHighLevel service is temporarily unavailable.';
        break;
        
      case 503:
        errorMessage = 'Service Unavailable';
        userMessage = 'GoHighLevel service is currently down for maintenance.';
        break;
        
      default:
        errorMessage = `API Error (${status})`;
        userMessage = data.message || 'An unexpected error occurred.';
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: errorMessage,
          message: userMessage,
          status: status,
          details: data,
          context: context.resource
        }, null, 2)
      }]
    };
  }
  
  static formatValidationError(field, message) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'Validation Error',
          field: field,
          message: message
        }, null, 2)
      }]
    };
  }
  
  static handleWebhookError(error, webhookType) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'Webhook Error',
          webhookType: webhookType,
          message: error.message,
          timestamp: new Date().toISOString()
        }, null, 2)
      }]
    };
  }
}