const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/contact',
    method: 'POST', // POST is required for this endpoint
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode === 404) {
        console.log('Endpoint NOT found (Server likely NOT restarted)');
    } else {
        console.log('Endpoint found (Server likely restarted)');
    }
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(JSON.stringify({})); // Send empty body just to check route existence
req.end();
