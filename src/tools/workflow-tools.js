export const workflowTools = [
  {
    name: 'ghl_add_contact_to_workflow',
    description: 'Add a contact to an automation workflow',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { 
          type: 'string', 
          description: 'Contact ID to add to workflow' 
        },
        workflowId: { 
          type: 'string', 
          description: 'Workflow ID to add contact to' 
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['contactId', 'workflowId']
    }
  },
  {
    name: 'ghl_remove_contact_from_workflow',
    description: 'Remove a contact from a workflow',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { 
          type: 'string', 
          description: 'Contact ID to remove from workflow' 
        },
        workflowId: { 
          type: 'string', 
          description: 'Workflow ID to remove contact from' 
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['contactId', 'workflowId']
    }
  },
  {
    name: 'ghl_get_workflows',
    description: 'Get all workflows for a location',
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