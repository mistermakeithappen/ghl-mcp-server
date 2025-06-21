import { GHLAPIClient } from './src/api-client.js';

async function searchContactByPhone() {
  const token = 'pit-3af17c0a-a798-4d7e-8e86-9d40c7503cff';
  const locationId = 'aZ66KgncoFQZ6kHEJXzl';
  const phoneNumber = '5099934628';
  
  try {
    console.log('Searching for contact with phone number:', phoneNumber);
    console.log('----------------------------------------\n');
    
    // Create API client
    const apiClient = new GHLAPIClient();
    
    // Search for contact by phone number
    // Try different formats
    const searchQueries = [
      phoneNumber,                    // 5099934628
      `+1${phoneNumber}`,            // +15099934628
      `(509) 993-4628`,              // formatted
      `509-993-4628`                 // with dashes
    ];
    
    let contactFound = false;
    
    for (const query of searchQueries) {
      console.log(`Searching with query: "${query}"`);
      
      const result = await apiClient.searchContacts({
        locationId: locationId,
        query: query,
        limit: 20,
        token: token
      });
      
      const data = JSON.parse(result.content[0].text);
      
      if (data.success && data.contacts && data.contacts.length > 0) {
        console.log(`\n✅ Found ${data.contacts.length} contact(s)!\n`);
        
        // Look for exact phone match
        const phoneToFind = `+1${phoneNumber}`;
        const exactMatch = data.contacts.find(contact => 
          contact.phone === phoneToFind || 
          contact.phone?.replace(/\D/g, '') === phoneNumber ||
          contact.phone?.replace(/\D/g, '') === `1${phoneNumber}`
        );
        
        if (exactMatch) {
          console.log('📞 EXACT MATCH FOUND:');
          console.log('====================');
          displayContactDetails(exactMatch);
          contactFound = true;
          break;
        } else {
          // Show all results if no exact match
          console.log('Contacts found (but no exact phone match):');
          data.contacts.forEach((contact, index) => {
            console.log(`\n${index + 1}. ${contact.contactName || 'No Name'}`);
            console.log(`   Phone: ${contact.phone || 'N/A'}`);
          });
        }
      } else {
        console.log('   No contacts found with this query.');
      }
    }
    
    if (!contactFound) {
      console.log('\n❌ No contact found with phone number:', phoneNumber);
      console.log('\nTrying to get all contacts and search manually...\n');
      
      // Get more contacts and search manually
      const allContactsResult = await apiClient.searchContacts({
        locationId: locationId,
        limit: 100,
        token: token
      });
      
      const allData = JSON.parse(allContactsResult.content[0].text);
      
      if (allData.success && allData.contacts) {
        const phoneToFind = `+1${phoneNumber}`;
        const match = allData.contacts.find(contact => 
          contact.phone === phoneToFind || 
          contact.phone?.replace(/\D/g, '') === phoneNumber ||
          contact.phone?.replace(/\D/g, '') === `1${phoneNumber}`
        );
        
        if (match) {
          console.log('✅ FOUND IN BROADER SEARCH:');
          console.log('========================');
          displayContactDetails(match);
        } else {
          console.log(`Searched through ${allData.contacts.length} contacts but couldn't find phone number ${phoneNumber}`);
          console.log('\nShowing all phone numbers in the system:');
          allData.contacts.forEach((contact, index) => {
            if (contact.phone) {
              console.log(`${index + 1}. ${contact.phone} - ${contact.contactName || 'No Name'}`);
            }
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2));
    }
  }
}

function displayContactDetails(contact) {
  console.log(`\nContact ID: ${contact.id}`);
  console.log(`Name: ${contact.firstName || ''} ${contact.lastName || ''} (${contact.contactName || 'No display name'})`);
  console.log(`Email: ${contact.email || 'N/A'}`);
  console.log(`Phone: ${contact.phone || 'N/A'}`);
  console.log(`Type: ${contact.type || 'N/A'}`);
  console.log(`Source: ${contact.source || 'N/A'}`);
  console.log(`Date Added: ${contact.dateAdded ? new Date(contact.dateAdded).toLocaleString() : 'N/A'}`);
  console.log(`Last Updated: ${contact.dateUpdated ? new Date(contact.dateUpdated).toLocaleString() : 'N/A'}`);
  
  if (contact.tags && contact.tags.length > 0) {
    console.log(`Tags: ${contact.tags.join(', ')}`);
  }
  
  if (contact.customFields && contact.customFields.length > 0) {
    console.log('\nCustom Fields:');
    contact.customFields.forEach(field => {
      console.log(`  - ${field.id}: ${field.value}`);
    });
  }
  
  if (contact.address1 || contact.city || contact.state || contact.postalCode) {
    console.log('\nAddress:');
    if (contact.address1) console.log(`  ${contact.address1}`);
    if (contact.city || contact.state || contact.postalCode) {
      console.log(`  ${contact.city || ''} ${contact.state || ''} ${contact.postalCode || ''}`);
    }
  }
  
  if (contact.country) {
    console.log(`Country: ${contact.country}`);
  }
  
  if (contact.timezone) {
    console.log(`Timezone: ${contact.timezone}`);
  }
  
  if (contact.companyName) {
    console.log(`Company: ${contact.companyName}`);
  }
  
  console.log(`\nDND Status: ${contact.dnd ? 'Yes' : 'No'}`);
  
  if (contact.assignedTo) {
    console.log(`Assigned To: ${contact.assignedTo}`);
  }
}

// Run the search
searchContactByPhone().catch(console.error);