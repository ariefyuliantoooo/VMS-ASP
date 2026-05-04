async function test() {
    const token = '65c1532016cfa20d8269679fb9ff3590e66cd2c0f61a1fbb49bba74e8f26ed9d';
    const email = 'admin@vms.com';
    try {
        const response = await fetch('http://localhost:5006/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token })
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Body:', data);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
