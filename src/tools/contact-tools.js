export const contactTools = [
  {
    name: 'ghl_create_contact',
    description: 'Create a new contact in GoHighLevel',
    inputSchema: {
      type: 'object',
      properties: {
        locationId: { 
          type: 'string', 
          description: 'Location/Sub-account ID (required)' 
        },
        contactData: { 
          type: 'object', 
          description: 'Contact information object',
          properties: {
            firstName: { type: 'string', description: 'First name' },
            lastName: { type: 'string', description: 'Last name' },
            email: { type: 'string', description: 'Email address' },
            phone: { type: 'string', description: 'Phone number with country code' },
            address1: { type: 'string', description: 'Street address' },
            city: { type: 'string', description: 'City' },
            state: { type: 'string', description: 'State/Province' },
            postalCode: { type: 'string', description: 'Postal/ZIP code' },
            country: { type: 'string', description: 'Country code (e.g., US)' },
            website: { type: 'string', description: 'Website URL' },
            timezone: { type: 'string', description: 'Timezone (e.g., America/Los_Angeles)' },
            dnd: { type: 'boolean', description: 'Do Not Disturb status' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Array of tags' },
            source: { type: 'string', description: 'Contact source' },
            assignedTo: { type: 'string', description: 'Assigned user ID' },
            companyName: { type: 'string', description: 'Company name' },
            customFields: { 
              type: 'array', 
              description: 'Custom field values',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string', description: 'Custom field ID' },
                  field_value: { description: 'Field value' }
                }
              }
            }
          }
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['locationId', 'contactData']
    }
  },
  {
    name: 'ghl_search_contacts',
    description: 'Search for contacts in GoHighLevel',
    inputSchema: {
      type: 'object',
      properties: {
        locationId: { 
          type: 'string', 
          description: 'Location/Sub-account ID (required)' 
        },
        query: { 
          type: 'string', 
          description: 'Search query string' 
        },
        limit: { 
          type: 'number', 
          description: 'Number of results to return (default: 20, max: 100)' 
        },
        offset: { 
          type: 'number', 
          description: 'Offset for pagination' 
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
    name: 'ghl_get_contact',
    description: 'Get a specific contact by ID',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { 
          type: 'string', 
          description: 'Contact ID' 
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['contactId']
    }
  },
  {
    name: 'ghl_update_contact',
    description: 'Update an existing contact',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { 
          type: 'string', 
          description: 'Contact ID to update' 
        },
        updateData: { 
          type: 'object', 
          description: 'Fields to update (same structure as contactData in create)' 
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['contactId', 'updateData']
    }
  },
  {
    name: 'ghl_delete_contact',
    description: 'Delete a contact',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { 
          type: 'string', 
          description: 'Contact ID to delete' 
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['contactId']
    }
  },
  {
    name: 'ghl_add_contact_tags',
    description: 'Add tags to a contact',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { 
          type: 'string', 
          description: 'Contact ID' 
        },
        tags: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Array of tags to add' 
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['contactId', 'tags']
    }
  },
  {
    name: 'ghl_remove_contact_tags',
    description: 'Remove tags from a contact',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: { 
          type: 'string', 
          description: 'Contact ID' 
        },
        tags: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Array of tags to remove' 
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['contactId', 'tags']
    }
  }
];