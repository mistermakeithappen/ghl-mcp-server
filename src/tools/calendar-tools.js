export const calendarTools = [
  {
    name: 'ghl_create_calendar',
    description: 'Create a new calendar in GoHighLevel',
    inputSchema: {
      type: 'object',
      properties: {
        calendarData: {
          type: 'object',
          description: 'Calendar configuration',
          properties: {
            name: { type: 'string', description: 'Calendar name' },
            description: { type: 'string', description: 'Calendar description' },
            locationId: { type: 'string', description: 'Location/Sub-account ID' },
            teamMembers: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Array of user IDs who can manage this calendar' 
            },
            eventTitle: { type: 'string', description: 'Default event title template' },
            eventType: { type: 'number', description: 'Event type (1 for Round Robin, 2 for Collective)' },
            slotDuration: { type: 'number', description: 'Duration of each slot in minutes' },
            slotInterval: { type: 'number', description: 'Interval between slots in minutes' },
            slotBuffer: { type: 'number', description: 'Buffer time between appointments' },
            preBuffer: { type: 'number', description: 'Pre-appointment buffer time' },
            preBufferUnit: { type: 'string', enum: ['mins', 'hours'], description: 'Unit for pre-buffer' },
            appoinmentPerSlot: { type: 'number', description: 'Max appointments per slot' },
            appoinmentPerDay: { type: 'number', description: 'Max appointments per day' },
            openHours: {
              type: 'array',
              description: 'Calendar availability hours',
              items: {
                type: 'object',
                properties: {
                  daysOfTheWeek: { 
                    type: 'array', 
                    items: { type: 'number' },
                    description: 'Days (1=Monday, 7=Sunday)' 
                  },
                  hours: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        openHour: { type: 'number', description: 'Opening hour (0-23)' },
                        openMinute: { type: 'number', description: 'Opening minute (0-59)' },
                        closeHour: { type: 'number', description: 'Closing hour (0-23)' },
                        closeMinute: { type: 'number', description: 'Closing minute (0-59)' }
                      }
                    }
                  }
                }
              }
            },
            enableRecurring: { type: 'boolean', description: 'Enable recurring appointments' },
            formId: { type: 'string', description: 'Associated form ID' },
            autoConfirm: { type: 'boolean', description: 'Auto-confirm appointments' },
            allowReschedule: { type: 'boolean', description: 'Allow rescheduling' },
            allowCancellation: { type: 'boolean', description: 'Allow cancellations' }
          },
          required: ['name', 'locationId']
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['calendarData']
    }
  },
  {
    name: 'ghl_create_appointment',
    description: 'Create a new appointment in a calendar',
    inputSchema: {
      type: 'object',
      properties: {
        appointmentData: {
          type: 'object',
          description: 'Appointment details',
          properties: {
            calendarId: { type: 'string', description: 'Calendar ID' },
            locationId: { type: 'string', description: 'Location/Sub-account ID' },
            contactId: { type: 'string', description: 'Contact ID for the appointment' },
            startTime: { type: 'string', description: 'Start time in ISO format (e.g., 2025-07-23T15:00:00Z)' },
            endTime: { type: 'string', description: 'End time in ISO format' },
            title: { type: 'string', description: 'Appointment title' },
            appointmentStatus: { 
              type: 'string', 
              enum: ['new', 'confirmed', 'cancelled', 'showed', 'noshow'],
              description: 'Appointment status' 
            },
            assignedUserId: { type: 'string', description: 'Assigned user/team member ID' },
            address: { type: 'string', description: 'Appointment location address' },
            ignoreDateRange: { type: 'boolean', description: 'Ignore calendar date range restrictions' },
            toNotify: { type: 'boolean', description: 'Send notifications' }
          },
          required: ['calendarId', 'locationId', 'contactId', 'startTime', 'endTime']
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['appointmentData']
    }
  },
  {
    name: 'ghl_get_calendar_slots',
    description: 'Get available time slots for a calendar',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: { 
          type: 'string', 
          description: 'Calendar ID' 
        },
        startDate: { 
          type: 'string', 
          description: 'Start date (YYYY-MM-DD)' 
        },
        endDate: { 
          type: 'string', 
          description: 'End date (YYYY-MM-DD)' 
        },
        timezone: { 
          type: 'string', 
          description: 'Timezone for slots (e.g., America/Los_Angeles)' 
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['calendarId', 'startDate', 'endDate']
    }
  },
  {
    name: 'ghl_update_appointment',
    description: 'Update an existing appointment',
    inputSchema: {
      type: 'object',
      properties: {
        appointmentId: { 
          type: 'string', 
          description: 'Appointment ID to update' 
        },
        updateData: {
          type: 'object',
          description: 'Fields to update',
          properties: {
            startTime: { type: 'string', description: 'New start time in ISO format' },
            endTime: { type: 'string', description: 'New end time in ISO format' },
            title: { type: 'string', description: 'New title' },
            appointmentStatus: { 
              type: 'string', 
              enum: ['new', 'confirmed', 'cancelled', 'showed', 'noshow'],
              description: 'New status' 
            },
            assignedUserId: { type: 'string', description: 'New assigned user ID' },
            address: { type: 'string', description: 'New address' }
          }
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['appointmentId', 'updateData']
    }
  },
  {
    name: 'ghl_cancel_appointment',
    description: 'Cancel an appointment',
    inputSchema: {
      type: 'object',
      properties: {
        appointmentId: { 
          type: 'string', 
          description: 'Appointment ID to cancel' 
        },
        token: { 
          type: 'string', 
          description: 'Access token (optional if GHL_PRIVATE_TOKEN env var is set)' 
        }
      },
      required: ['appointmentId']
    }
  }
];