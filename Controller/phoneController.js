const twilio = require('twilio');
const otpGenerator = require('otp-generator');
const users = require('../Models/userSchema');

// Using environment variables for sensitive data
const accountSid = process.env.acct_sid;  // Make sure these are defined in your environment
const authToken = process.env.auth_token;

// Initialize Twilio client
const client = new twilio(accountSid, authToken);

exports.verifyPhone = async (req, res) => {
  const { phone } = req.body;

  // Check if the phone number is provided
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const existingUser = await users.findOne({phone})
    if(existingUser){
      const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
      const otpExpiry = Date.now() + 4 * 60 * 1000;
  
      req.session.otp = otp;
      req.session.phone = phone;
      req.session.otpExpiry = otpExpiry;
  
  
      // Create and send SMS
      const messageResponse = await client.messages.create({
        body: `Your OTP for Account Verification is ${otp}`,  
        from: '+16505499375',  
        to:`+91 ${phone}` ,
      });

      return res.status(200).json({ message: 'Message sent successfully', sid: messageResponse.sid });
    }
    else{
      res.status(401).json("Phone number is not registered")
    }

  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  // Check if OTP, phone, and expiration time exist in the session
  if (!req.session.otp || !req.session.phone || !req.session.otpExpiry) {
      return res.status(400).json({ message: "No OTP found. Please request a new one." });
  }

  const currentTime = Date.now();
  if (currentTime > req.session.otpExpiry) {
      // OTP has expired
      req.session.otp = null;
      req.session.phone = null;
      req.session.otpExpiry = null;
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
  }

  if (req.session.otp === otp && req.session.phone === phone) {

      // OTP is correct and within the valid time
      await users.findOneAndUpdate({ phone: phone }, { 
        phone_verify: true });

      
      // Clear the OTP and related data from the session after verification
      req.session.otp = null;
      req.session.phone = null;
      req.session.otpExpiry = null;

      return res.status(200).json({ message: "OTP verified successfully!" });
  } else {
      // OTP or phone is incorrect
      return res.status(400).json({ message: "Invalid OTP or phone number." });
  }
};
