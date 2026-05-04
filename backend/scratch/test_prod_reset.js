async function test() {
    try {
        const response = await fetch('https://backend-gamma-nine-87.vercel.app/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@gmail.com' })
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Body:', data);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
