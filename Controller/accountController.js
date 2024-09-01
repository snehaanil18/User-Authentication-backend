const users = require('../Models/userSchema');
const https = require('https');

exports.verifyBankAccount = async(req, res) => {
    // Extract bank account number and IFSC code from request body
    const { bank_account_no, bank_ifsc_code } = req.body;
    const userId = req.payload;

    
    const existingUser = await users.findOne({ _id: userId });
    if (existingUser) {
        const options = {
            method: 'POST',
            hostname: 'indian-bank-account-verification.p.rapidapi.com',
            port: null,
            path: '/v3/tasks/async/verify_with_source/validate_bank_account',
            headers: {
                'x-rapidapi-key': '8f4fc40af9msh3d452ca6189bf2ep13bf1fjsn4472b50b5f79', // Use your own key here
                'x-rapidapi-host': 'indian-bank-account-verification.p.rapidapi.com',
                'Content-Type': 'application/json'
            }
        };
    
        const apiReq = https.request(options, function (apiRes) {
            const chunks = [];
    
            apiRes.on('data', function (chunk) {
                chunks.push(chunk);
            });
    
            apiRes.on('end',async function () {
                const body = Buffer.concat(chunks);
                const response = JSON.parse(body.toString());
                // Send the API response back to the client
                res.json(response);
            });
        });
    
        apiReq.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
            res.status(500).json({ message: 'Internal server error', error: e.message });
        });
    
        // Send the request body data to the external API
        apiReq.write(JSON.stringify({
            task_id: '123', // Replace with actual task ID if needed
            group_id: '1234', // Replace with actual group ID if needed
            data: {
                bank_account_no,
                bank_ifsc_code
            }
        }));
    
        // End the request
        apiReq.end();
    }else {
        res.status(401).json({ message: 'User not registered' });
    }
  
};


exports.verifyBankAccountStatus = (req, res) => {
    const requestId = req.params.requestId; // Get the request ID from the route parameter

    const options = {
        method: 'GET',
        hostname: 'indian-bank-account-verification.p.rapidapi.com',
        port: null,
        path: `/v3/tasks?request_id=${requestId}`, // Use the request ID in the path
        headers: {
            'x-rapidapi-key': '8f4fc40af9msh3d452ca6189bf2ep13bf1fjsn4472b50b5f79',
            'x-rapidapi-host': 'indian-bank-account-verification.p.rapidapi.com'
        }
    };

    const apiReq = https.request(options, function (apiRes) {
        const chunks = [];

        apiRes.on('data', function (chunk) {
            chunks.push(chunk);
        });

        apiRes.on('end', function () {
            const body = Buffer.concat(chunks);
            const response = JSON.parse(body.toString());
            // Send the API response back to the client
            res.json(response);
        });
    });

    // Handle errors from the HTTPS request
    apiReq.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
        res.status(500).json({ message: 'Internal server error', error: e.message });
    });

    // End the request
    apiReq.end();
};