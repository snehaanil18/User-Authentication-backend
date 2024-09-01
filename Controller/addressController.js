const https = require('https');
const users = require('../Models/userSchema');

exports.getPincodeDetails = async (req, res) => {
    const { pincode } = req.params; // Extract pincode from request params
    const userId = req.payload;

    try {
        // Check if the user exists
        const existingUser = await users.findOne({ _id: userId });

        if (existingUser) {
            const options = {
                method: 'GET',
                hostname: 'india-pincode-with-latitude-and-longitude.p.rapidapi.com',
                port: null,
                path: `/api/v1/pincode/${pincode}`, // Use the dynamic pincode
                headers: {
                    'x-rapidapi-key': 'e140319af7msh2f0fbd7d73d443cp119272jsnd01a051ac171', // Replace with your API key
                    'x-rapidapi-host': 'india-pincode-with-latitude-and-longitude.p.rapidapi.com'
                },
                timeout: 5000 // Set a timeout of 5 seconds
            };

            const apiReq = https.request(options, function (apiRes) {
                let body = '';

                // Collect response data
                apiRes.on('data', (chunk) => {
                    body += chunk;
                });

                apiRes.on('end', async function () {
                    try {
                        // Check content type
                        if (apiRes.headers['content-type'] && apiRes.headers['content-type'].includes('application/json')) {
                            if (body) {
                                // Attempt to parse the response body
                                const response = JSON.parse(body);

                                if (Array.isArray(response) && response.length === 0) {
                                    // No data found for the given pincode
                                    res.status(404).json({ message: 'Pincode not found' });
                                } else {
                                    // Save the pincode in the database
                                    await users.updateOne({ _id: userId }, { $set: { address: pincode } });
                                    res.json({ message: 'Pincode verified and updated successfully', response });
                                }
                            } else {
                                // Empty response body
                                res.status(204).json({ message: 'No content returned from API' });
                            }
                        } else {
                            // Unexpected content type
                            res.status(500).json({ message: 'Unexpected response format', response: body });
                        }
                    } catch (parseError) {
                        console.error(`Error parsing response: ${parseError.message}`);
                        res.status(500).json({ message: 'Error parsing API response', error: parseError.message });
                    }
                });
            });

            apiReq.on('error', (e) => {
                console.error(`Problem with request: ${e.message}`);
                res.status(500).json({ message: 'Internal server error', error: e.message });
            });

            apiReq.on('timeout', () => {
                console.error('Request timed out');
                apiReq.abort(); // Abort the request
                res.status(504).json({ message: 'Request timed out' });
            });

            apiReq.end();
        } else {
            res.status(401).json({ message: 'User not Registered' });
        }
    } catch (error) {
        console.error(`Unexpected error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
