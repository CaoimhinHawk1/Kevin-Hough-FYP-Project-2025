// backend/src/test-api.js
// A simple script to test API endpoints

const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 3000}/api`;

async function testEndpoint(url, method = 'GET', data = null) {
    console.log(`Testing ${method} ${url}...`);
    try {
        const response = method === 'GET'
            ? await axios.get(url)
            : await axios.post(url, data);

        console.log(`✅ Success: ${method} ${url}`);
        console.log('Status:', response.status);

        // Limit the response size to avoid console flooding
        const responseData = JSON.stringify(response.data);
        if (responseData.length > 1000) {
            console.log('Response:', responseData.substring(0, 1000) + '... (truncated)');
        } else {
            console.log('Response:', responseData);
        }
        return true;
    } catch (error) {
        console.log(`❌ Error: ${method} ${url}`);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', error.response.data);

            // Add specific suggestions based on error status
            if (error.response.status === 404) {
                console.log('Suggestion: Check if the route is correctly registered in app.js');
            } else if (error.response.status === 500) {
                console.log('Suggestion: Check server logs for detailed error messages');
            }
        } else if (error.code === 'ECONNREFUSED') {
            console.log('Error: Could not connect to the server. Is it running?');
        } else {
            console.log('Error:', error.message);
        }
        return false;
    }
}

async function runTests() {
    console.log('🔍 Starting API tests...');
    console.log('=================================');

    // Test health endpoint
    await testEndpoint(`${BASE_URL}/health`);

    // Test test endpoint
    await testEndpoint(`${BASE_URL}/test`);

    // Test inventory endpoints
    await testEndpoint(`${BASE_URL}/inventory`);
    await testEndpoint(`${BASE_URL}/items`);

    // Test inventory stats endpoint
    await testEndpoint(`${BASE_URL}/inventory/stats`);

    console.log('=================================');
    console.log('🏁 Completed API tests');
}

// Run the tests
runTests().catch(error => {
    console.error('Error running tests:', error);
});