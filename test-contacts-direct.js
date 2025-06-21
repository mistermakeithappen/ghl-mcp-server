import { GHLAPIClient } from './src/api-client.js';

async function testContactsCount() {
  const token = 'pit-3af17c0a-a798-4d7e-8e86-9d40c7503cff';
  const locationId = 'aZ66KgncoFQZ6kHEJXzl';
  
  try {
    console.log('GoHighLevel Contacts Counter\n');
    console.log('Fetching contacts from GHL API...\n');
    
    // Create API client
    const apiClient = new GHLAPIClient();
    
    // Search contacts - remove offset as it's not supported
    const result = await apiClient.searchContacts({
      locationId: locationId,
      limit: 10, // Get first 10 contacts
      token: token
    });
    
    // Parse the result
    const data = JSON.parse(result.content[0].text);
    
    if (data.success) {
      console.log('✅ Successfully connected to GoHighLevel API!\n');
      console.log(`📊 Total contacts in location: ${data.total || 0}`);
      console.log(`📍 Location ID: ${locationId}`);
      
      // Show pagination info if available
      if (data.meta) {
        console.log(`📄 Current page: ${data.meta.currentPage || 1}`);
        console.log(`📄 Total pages: ${Math.ceil(data.total / 10)}`);
      }
      
      // If there are contacts, show some samples
      if (data.contacts && data.contacts.length > 0) {
        console.log(`\n📋 Showing first ${data.contacts.length} contacts:\n`);
        data.contacts.forEach((contact, index) => {
          console.log(`${index + 1}. ${contact.firstName || ''} ${contact.lastName || ''}`);
          console.log(`   Email: ${contact.email || 'N/A'}`);
          console.log(`   Phone: ${contact.phone || 'N/A'}`);
          console.log(`   Created: ${contact.dateAdded ? new Date(contact.dateAdded).toLocaleDateString() : 'N/A'}`);
          console.log('');
        });
      } else {
        console.log('\nNo contacts found in this location.');
      }
    } else {
      console.log('❌ Failed to fetch contacts');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
    if (error.status === 401) {
      console.error('\n⚠️  Authentication failed. The API token may be invalid or expired.');
    } else if (error.status === 403) {
      console.error('\n⚠️  Access denied. Please check your permissions for this location.');
    } else if (error.status === 422) {
      console.error('\n⚠️  Invalid request. The location ID may be incorrect.');
    }
  }
}

// Run the test
console.log('Starting GHL API test...\n');
testContactsCount().catch(console.error);