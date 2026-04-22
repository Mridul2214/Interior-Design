// No require needed for fetch in modern Node

const testLogin = async () => {
    try {
        console.log('Testing Admin login with admin123...');
        const resAdmin = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@interiordesign.com', password: 'admin123' })
        });
        const dataAdmin = await resAdmin.json();
        console.log('Admin123 Result:', dataAdmin);

        console.log('\nTesting Admin login with password123...');
        const resPass = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@interiordesign.com', password: 'password123' })
        });
        const dataPass = await resPass.json();
        console.log('Password123 Result:', dataPass);
    } catch (err) {
        console.error('Error:', err.message);
    }
};

testLogin();
