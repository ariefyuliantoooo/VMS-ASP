const nodemailer = require('nodemailer');

const createTransporter = async () => {
    // For development, use Ethereal (dummy email service)
    // If you have real SMTP, put those in process.env
    if (!process.env.SMTP_HOST) {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const sendVerificationEmail = async (to, token) => {
    try {
        const transporter = await createTransporter();
        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
        
        const info = await transporter.sendMail({
            from: '"Visitor Management System" <noreply@vms.local>',
            to: to,
            subject: "MOHON VERIFIKASI EMAIL ANDA",
            text: `Silakan klik link berikut untuk memverifikasi akun Anda: ${verifyUrl}`,
            html: `<p>Terima kasih telah mendaftar.</p><p>Silakan klik link berikut untuk memverifikasi akun Anda:</p><a href="${verifyUrl}">${verifyUrl}</a>`,
        });

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        if (!process.env.SMTP_HOST) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = {
    sendVerificationEmail
};
