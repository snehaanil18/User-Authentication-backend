const express = require('express');

const userController = require('../Controller/userController');
const emailController = require('../Controller/emailController');
const jwtMiddleware = require('../Middleware/jwtMiddleware');
const phoneController = require('../Controller/phoneController');
const bankController = require('../Controller/accountController');
const addressController = require('../Controller/addressController');
const gstController = require('../Controller/gstnoController')
const panController = require('../Controller/panController')
const aadhaarController = require('../Controller/aadharController')

const router = express.Router();

//register user
router.post('/register',userController.register);

//login
router.post('/login',userController.login);;

//verify email address
router.post('/verify-email',emailController.emailVerify);

//verify entered otp
router.post('/verify-otp-email',emailController.verifyOtp);

//verify phone number
router.post('/verify-phone',phoneController.verifyPhone);

//verify entered otp
router.post('/verify-otp-phone',phoneController.verifyOtp);

//verify bank account
router.post('/verify-account',jwtMiddleware,bankController.verifyBankAccount);

// //verify details of bank account
router.get('/verify-status/:requestId', bankController.verifyBankAccountStatus);

//verify address
router.get('/pincode/:pincode',jwtMiddleware, addressController.getPincodeDetails);

//verify gst number
router.post('/verify-gst',jwtMiddleware,gstController.verifyGst);

//verify pan card
router.post('/verify-pan',jwtMiddleware,panController.verifyPan)

//verify aadhar
router.post('/verify-aadhar',aadhaarController.validateAadhar)

module.exports = router