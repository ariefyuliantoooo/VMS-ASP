const axios = require('axios');

const test = async () => {
    try {
        console.log("Step 1: Requesting Forgot Password for admin@vms.com...");
        const res1 = await axios.post('http://localhost:5006/api/auth/forgot-password', {
            email: 'admin@vms.com'
        });
        console.log("Response:", res1.data);
        console.log("\nNote: Check terminal logs for the reset link.\n");

    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
    }
};

test();
