export const opportunityTools = [
  {
    name: 'ghl_create_opportunity',
    description: 'Create a new sales opportunity',
    inputSchema: {
      type: 'object',
      properties: {
        opportunityData: {
          type: 'object',
          description: 'Opportunity details',
          properties: {
            pipelineId: { type: 'string', description: 'Pipeline ID' },
            locationId: { type: 'string', description: 'Location/Sub-account ID' },
            name: { type: 'string', description: 'Opportunity name' },
            pipelineStageId: { type: 'string', description: 'Pipeline stage ID' },
            status: { 
              type: 'string', 
              enum: ['open', 'won', 'lost', 'abandoned'],
              description: 'Opportunity status' 
            },
            contactId: { type: 'string', description: 'Associated contact ID' },
            monetaryValue: { type: 'number', description: 'Opportunity value in cents' },
            assignedTo: { type: 'string', description: 'Assigned user ID' },
            notes: { type: 'string', description: 'Internal notes' },
            customFields: { 
              type: 'object', 
              description: 'Custom field values as key-value pairs' 
            }
          },
          required: ['pipelineId', 'locationId', 'name', 'pipelineStageId', 'contactId']
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['opportunityData']
    }
  },
  {
    name: 'ghl_search_opportunities',
    description: 'Search for opportunities in pipelines',
    inputSchema: {
      type: 'object',
      properties: {
        locationId: { 
          type: 'string', 
          description: 'Location/Sub-account ID' 
        },
        pipelineId: { 
          type: 'string', 
          description: 'Filter by specific pipeline ID (optional)' 
        },
        query: { 
          type: 'string', 
          description: 'Search query string' 
        },
        assignedTo: { 
          type: 'string', 
          description: 'Filter by assigned user ID' 
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['locationId']
    }
  },
  {
    name: 'ghl_update_opportunity',
    description: 'Update an existing opportunity',
    inputSchema: {
      type: 'object',
      properties: {
        opportunityId: { 
          type: 'string', 
          description: 'Opportunity ID to update' 
        },
        updateData: {
          type: 'object',
          description: 'Fields to update',
          properties: {
            name: { type: 'string', description: 'New opportunity name' },
            pipelineStageId: { type: 'string', description: 'Move to different stage' },
            status: { 
              type: 'string', 
              enum: ['open', 'won', 'lost', 'abandoned'],
              description: 'New status' 
            },
            monetaryValue: { type: 'number', description: 'New value in cents' },
            assignedTo: { type: 'string', description: 'Reassign to user ID' },
            notes: { type: 'string', description: 'Update notes' },
            customFields: { type: 'object', description: 'Update custom fields' }
          }
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['opportunityId', 'updateData']
    }
  },
  {
    name: 'ghl_delete_opportunity',
    description: 'Delete an opportunity',
    inputSchema: {
      type: 'object',
      properties: {
        opportunityId: { 
          type: 'string', 
          description: 'Opportunity ID to delete' 
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['opportunityId']
    }
  },
  {
    name: 'ghl_get_pipelines',
    description: 'Get all pipelines for a location',
    inputSchema: {
      type: 'object',
      properties: {
        locationId: { 
          type: 'string', 
          description: 'Location/Sub-account ID' 
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['locationId']
    }
  }
];