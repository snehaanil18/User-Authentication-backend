const users = require('../Models/userSchema')

const jwt = require('jsonwebtoken')



const otpGenerator = require('otp-generator')

exports.register = async (req, res) => {
    const { name, email, phone, aadhar, dob, password } = req.body;
    try {
        const existingUser = await users.findOne({ email })
        if (existingUser) {
            res.status(406).json("User already exsists")
        }
        else {
            const newUser = new users({
                name,
                email,
                email_verify: false,
                phone,
                phone_verify: false,
                aadhar,
                aadhar_verify: false,
                dob,
                password,
                pancard: "",
                address: "",
                account: "",
                gst: ""
            })
            await newUser.save()
            res.status(200).json(newUser)
        }
    }
    catch (err) {
        res.status(500).json(err)
    }
}

exports.login = async (req, res) => {

    const { email, password } = req.body;

    try {
        // Find the user by email and password
        const existingUser = await users.findOne({ email, password });

        if (existingUser) {
            const token = jwt.sign({ userId: existingUser._id }, "superkey");
            res.status(200).json({ existingUser, token });
        } else {
            // If no user is found with the provided email and password
            res.status(404).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        // Handle server errors
        res.status(500).json({ message: 'Login failed. ' + err.message });
    }
};

