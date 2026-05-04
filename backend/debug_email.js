const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.production
dotenv.config({ path: path.resolve(__dirname, '.env.production') });

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

const createTransporter = async () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    throw new Error('No EMAIL_USER/PASS found in env');
};

const sendTest = async () => {
    try {
        const transporter = await createTransporter();
        console.log('Transporter created. Sending test email...');
        const info = await transporter.sendMail({
            from: `"Test Debug" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // send to self
            subject: "Debug Mailer",
            text: "This is a debug test.",
        });
        console.log('SUCCESS:', info.messageId);
    } catch (error) {
        console.error('FAILED:', error);
    }
};

sendTest();
