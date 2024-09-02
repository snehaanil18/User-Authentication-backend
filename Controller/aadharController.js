
const request = require('request');

// Aadhar validation controller function
exports.validateAadhar = (req, res) => {
  // Extract Aadhar number from request body
  const { aadhaar } = req.body;

  // Define the options for the request to ApyHub API
  const options = {
    method: 'POST',
    url: 'https://api.apyhub.com/validate/aadhaar',
    headers: {
      'apy-token': process.env.aadhar_key, 
      'Content-Type': 'application/json'
    },
    body: { aadhaar },
    json: true
  };

  // Make the request to the ApyHub API
  request(options, (error, response, body) => {
    if (error) {
      // Handle errors appropriately
      console.error('Error occurred while validating Aadhar:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Check the response status from ApyHub API
    if (response.statusCode === 200) {
      // Handle successful validation
      return res.status(200).json(body);
    } else {
      // Handle unsuccessful validation or other response status codes
      return res.status(response.statusCode).json(body);
    }
  });
};
