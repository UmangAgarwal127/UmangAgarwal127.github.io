function submitPhoneNumber() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    
    if (!phoneNumber) {
        document.getElementById('message').innerText = 'Please enter a phone number';
        return;
    }

    // Here you would typically send to a backend
    // For now, just show success message
    document.getElementById('message').innerText = 'Phone number submitted successfully!';
    document.getElementById('phoneNumber').value = '';
}
