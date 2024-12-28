const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const otpStore = new Map();

app.post('/api/send-otp', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000);
        
        otpStore.set(phoneNumber, {
            code: otp,
            timestamp: Date.now()
        });

        await client.messages.create({
            body: `Your OTP is: ${otp}. Valid for 5 minutes.`,
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });

        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    const { phoneNumber, otp } = req.body;
    const storedData = otpStore.get(phoneNumber);
    
    if (!storedData) {
        return res.status(400).json({ 
            success: false, 
            message: 'OTP expired or not sent' 
        });
    }

    if (Date.now() - storedData.timestamp > 5 * 60 * 1000) {
        otpStore.delete(phoneNumber);
        return res.status(400).json({ 
            success: false, 
            message: 'OTP expired' 
        });
    }

    if (storedData.code === parseInt(otp)) {
        otpStore.delete(phoneNumber);
        return res.status(200).json({ 
            success: true, 
            message: 'OTP verified successfully',
            redirectUrl: 'https://drive.google.com/file/d/1ExEWz8Wvazcu7K2AiHzZSnfvYqBEk8IM/view?usp=sharing'
        });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});