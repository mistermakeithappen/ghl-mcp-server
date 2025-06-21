import { GHLAPIClient } from './src/api-client.js';

// Test configuration
const TOKEN = 'pit-3af17c0a-a798-4d7e-8e86-9d40c7503cff';
const LOCATION_ID = 'aZ66KgncoFQZ6kHEJXzl';
const TEST_CONTACT_ID = 'yPBxVSeVAPhBkBUmSxsW'; // Brandon Burgan's contact ID

async function testAllEndpoints() {
  const apiClient = new GHLAPIClient();
  let testResults = [];
  
  console.log('🧪 Testing GoHighLevel API Endpoints');
  console.log('====================================\n');
  
  // Test 1: Search Contacts
  await testEndpoint('Search Contacts', async () => {
    const result = await apiClient.searchContacts({
      locationId: LOCATION_ID,
      query: 'brandon',
      limit: 5,
      token: TOKEN
    });
    const data = JSON.parse(result.content[0].text);
    return {
      success: data.success,
      message: `Found ${data.contacts?.length || 0} contacts, Total: ${data.total || 0}`
    };
  }, testResults);
  
  // Test 2: Get Specific Contact
  await testEndpoint('Get Contact by ID', async () => {
    const result = await apiClient.getContact({
      contactId: TEST_CONTACT_ID,
      token: TOKEN
    });
    const data = JSON.parse(result.content[0].text);
    return {
      success: data.success,
      message: `Retrieved contact: ${data.contact?.contactName || 'Unknown'}`
    };
  }, testResults);
  
  // Test 3: Get Conversations
  await testEndpoint('Get Conversations', async () => {
    const result = await apiClient.getConversations({
      locationId: LOCATION_ID,
      limit: 5,
      token: TOKEN
    });
    const data = JSON.parse(result.content[0].text);
    return {
      success: data.success,
      message: `Found ${data.conversations?.length || 0} conversations`
    };
  }, testResults);
  
  // Test 4: Get Pipelines
  await testEndpoint('Get Pipelines', async () => {
    const result = await apiClient.getPipelines({
      locationId: LOCATION_ID,
      token: TOKEN
    });
    const data = JSON.parse(result.content[0].text);
    return {
      success: data.success,
      message: `Found ${data.pipelines?.length || 0} pipelines`
    };
  }, testResults);
  
  // Test 5: Search Opportunities
  await testEndpoint('Search Opportunities', async () => {
    const result = await apiClient.searchOpportunities({
      locationId: LOCATION_ID,
      token: TOKEN
    });
    const data = JSON.parse(result.content[0].text);
    return {
      success: data.success,
      message: `Found ${data.opportunities?.length || 0} opportunities`
    };
  }, testResults);
  
  // Test 6: Get Workflows
  await testEndpoint('Get Workflows', async () => {
    const result = await apiClient.getWorkflows({
      locationId: LOCATION_ID,
      token: TOKEN
    });
    const data = JSON.parse(result.content[0].text);
    return {
      success: data.success,
      message: `Found ${data.workflows?.length || 0} workflows`
    };
  }, testResults);
  
  // Test 7: Get Transactions
  await testEndpoint('Get Transactions', async () => {
    const result = await apiClient.getTransactions({
      locationId: LOCATION_ID,
      token: TOKEN
    });
    const data = JSON.parse(result.content[0].text);
    return {
      success: data.success,
      message: `Found ${data.transactions?.length || 0} transactions`
    };
  }, testResults);
  
  // Test 8: Get Orders
  await testEndpoint('Get Orders', async () => {
    const result = await apiClient.getOrders({
      locationId: LOCATION_ID,
      token: TOKEN
    });
    const data = JSON.parse(result.content[0].text);
    return {
      success: data.success,
      message: `Found ${data.orders?.length || 0} orders`
    };
  }, testResults);
  
  // Display results summary
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  
  const passed = testResults.filter(r => r.success).length;
  const failed = testResults.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / testResults.length) * 100).toFixed(1)}%\n`);
  
  // Show failed tests details
  if (failed > 0) {
    console.log('Failed Tests:');
    testResults.filter(r => !r.success).forEach(result => {
      console.log(`  - ${result.name}: ${result.error}`);
    });
  }
  
  return testResults;
}

async function testEndpoint(name, testFunc, results) {
  console.log(`\n🔍 Testing: ${name}`);
  console.log('-'.repeat(40));
  
  try {
    const result = await testFunc();
    console.log(`✅ Success: ${result.message}`);
    results.push({
      name,
      success: true,
      message: result.message
    });
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    if (error.status) {
      console.log(`   Status: ${error.status}`);
    }
    if (error.data) {
      console.log(`   Details: ${JSON.stringify(error.data, null, 2)}`);
    }
    results.push({
      name,
      success: false,
      error: error.message,
      status: error.status
    });
  }
}

// Run all tests
console.log('Starting API endpoint tests...\n');
console.log(`API Token: ${TOKEN.substring(0, 10)}...${TOKEN.substring(TOKEN.length - 4)}`);
console.log(`Location ID: ${LOCATION_ID}`);
console.log(`Test Contact ID: ${TEST_CONTACT_ID}\n`);

testAllEndpoints().catch(console.error);