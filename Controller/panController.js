const https = require('https');
const users = require('../Models/userSchema');

exports.verifyPan = async (req, res) => {
    const { pan, consent, consent_text } = req.body;
    const userId = req.payload;

    const existingUser = await users.findOne({ _id: userId });

    if (existingUser) {
        const options = {
            method: 'POST',
            hostname: 'aadhaar-number-verification-api-using-pan-number.p.rapidapi.com',
            path: '/api/validation/pan_to_aadhaar',
            headers: {
                'x-rapidapi-key': 'da74ff273dmsh0bc13a350ffb2ebp183172jsn51e9580d27d7',
                'x-rapidapi-host': 'aadhaar-number-verification-api-using-pan-number.p.rapidapi.com',
                'Content-Type': 'application/json'
            }
        };

        const apiReq = https.request(options, function (apiRes) {
            const chunks = [];

            apiRes.on('data', function (chunk) {
                chunks.push(chunk);
            });

            apiRes.on('end', async function () {
                const body = Buffer.concat(chunks);
                const response = JSON.parse(body.toString());

                // Check for success status and link status
                if (response.status === 'success' && response.result.link_status === true) {
                    try {
                        await users.updateOne({ _id: userId }, { $set: { pancard: pan } });
                        res.json({ message: 'PAN verified and updated successfully', response });
                    } catch (dbError) {
                        console.error('Error updating user:', dbError.message);
                        res.status(500).json({ message: 'Error updating user data', error: dbError.message });
                    }
                } else {
                    res.status(400).json({ message: 'PAN verification failed', response });
                }
            });
        });

        apiReq.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
            res.status(500).json({ message: 'Internal server error', error: e.message });
        });

        apiReq.write(JSON.stringify({
            pan,
            consent,
            consent_text
        }));

        apiReq.end();
    } else {
        res.status(401).json({ message: 'User not registered' });
    }
};
