const path = require('path');

// Add these constants after your other constants
const CSV_FILE_PATH = path.join(__dirname, 'phone_numbers.csv');


async function initializeCSV() {
    try {
        await fs.access(CSV_FILE_PATH);
    } catch {
        await fs.writeFile(CSV_FILE_PATH, 'Phone Number,Timestamp\n');
    }
}

// Initialize CSV when server starts
initializeCSV().catch(console.error);

// Function to add phone number to CSV
async function addPhoneToCSV(phoneNumber) {
    try {
        const timestamp = new Date().toISOString();
        const csvLine = `${phoneNumber},${timestamp}\n`;
        await fs.appendFile(CSV_FILE_PATH, csvLine);
        return true;
    } catch (error) {
        console.error('Error writing to CSV:', error);
        return false;
    }
}


async function sendOTP() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    const messageDiv = document.getElementById('message');

    if (!phoneNumber || phoneNumber.length !== 10) {
        messageDiv.innerText = 'Please enter a valid 10-digit phone number';
        messageDiv.className = 'message error';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber: '+91' + phoneNumber })
        });

        const data = await response.json();

        if (data.success) {
            messageDiv.innerText = 'OTP sent to your phone!';
            messageDiv.className = 'message success';
            document.getElementById('otpSection').style.display = 'block';
        } else {
            messageDiv.innerText = data.message;
            messageDiv.className = 'message error';
        }
    } catch (error) {
        messageDiv.innerText = 'Error sending OTP';
        messageDiv.className = 'message error';
    }
}

async function verifyOTP() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    const otp = document.getElementById('otp').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch('http://localhost:3000/api/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                phoneNumber: '+91' + phoneNumber,
                otp: otp 
            })
        });
        console.log("Hello");
        const data = await response.json();
        console.log(data);

        if (data.success) {
            console.log(data.redirectUrl)
            messageDiv.innerText = data.message;
            messageDiv.className = 'message success';
              // Add phone number to CSV asynchronously
         try{     
           const csvSuccess = await addPhoneToCSV(phoneNumber);
           if (!csvSuccess) {
               return res.status(500).json({
                   success: false,
                   message: 'Error storing phone number'
               });
           }
        }
        catch{
            console.log(error);
        }
            window.location.href = data.redirectUrl;
          
        } else {
            messageDiv.innerText = data.message;
            messageDiv.className = 'message error';
        }
    } catch (error) {
        messageDiv.innerText = 'Error verifying OTP';
        messageDiv.className = 'message error';
    }
}