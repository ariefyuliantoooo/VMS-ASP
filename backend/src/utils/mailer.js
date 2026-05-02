const nodemailer = require('nodemailer');

const createTransporter = async () => {
    // If SMTP_HOST is explicitly provided, use custom SMTP
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // If EMAIL_USER is provided but no SMTP_HOST, fallback to Gmail Service
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const user = process.env.EMAIL_USER.trim();
        const pass = process.env.EMAIL_PASS.trim();
        
        // Debug logging (redacted)
        console.log(`Mailer using Gmail: ${user[0]}...${user.slice(-8)} (Pass length: ${pass.length})`);
        
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: pass
            }
        });
    }

    // If no config found, use Ethereal (dummy email service) for dev
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

const sendRegistrationEmail = async (to, password) => {
    try {
        const transporter = await createTransporter();
        
        const info = await transporter.sendMail({
            from: `"Visitor Management System" <${process.env.EMAIL_USER || 'noreply@vms.local'}>`,
            to: to,
            subject: "AKUN VISITOR TELAH AKTIF - Visitor Management System",
            text: `Sistem telah membuat akun Visitor Anda. Silakan login menggunakan email dan kata sandi berikut: ${password}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #2563eb; padding: 20px; text-align: center; color: white;">
                    <h2 style="margin: 0;">Visitor Management System</h2>
                </div>
                <div style="padding: 30px;">
                    <h3 style="color: #333; margin-top: 0;">Pendaftaran Visitor Berhasil</h3>
                    <p style="color: #555; font-size: 16px;">Sistem telah membuat akun Visitor Anda dan sekarang sudah aktif.</p>
                    
                    <p style="color: #555; font-size: 16px; margin-top: 25px;">Silakan login menggunakan email dan kata sandi berikut untuk kunjungan berikutnya:</p>
                    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 6px; margin: 15px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #1f2937;">${password}</span>
                    </div>
                </div>
                <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} PT Asia Surya Persada. All rights reserved.</p>
                </div>
            </div>
            `,
        });

        console.log("Registration email sent: %s", info.messageId);
        if (!process.env.SMTP_HOST && !process.env.EMAIL_USER) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        return info;

        console.log("Verification email sent: %s", info.messageId);
        if (!process.env.SMTP_HOST && !process.env.EMAIL_USER) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

const sendPasswordResetOTP = async (to, otp) => {
    try {
        const transporter = await createTransporter();
        
        const info = await transporter.sendMail({
            from: `"Visitor Management System" <${process.env.EMAIL_USER || 'noreply@vms.local'}>`,
            to: to,
            subject: "KODE OTP RESET PASSWORD ANDA",
            text: `Kode OTP Anda adalah: ${otp}. Kode ini berlaku selama 15 menit.`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #2563eb; padding: 20px; text-align: center; color: white;">
                    <h2 style="margin: 0;">Visitor Management System</h2>
                </div>
                <div style="padding: 30px;">
                    <h3 style="color: #333; margin-top: 0;">Reset Password</h3>
                    <p style="color: #555; font-size: 16px;">Anda telah meminta untuk mereset password akun Anda. Silakan gunakan kode OTP berikut:</p>
                    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 6px; margin: 25px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
                    </div>
                    <p style="color: #555; font-size: 14px;">Kode OTP ini hanya berlaku selama <strong>15 menit</strong>. Jangan bagikan kode ini kepada siapapun.</p>
                </div>
                <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} PT Asia Surya Persada. All rights reserved.</p>
                </div>
            </div>
            `,
        });

        console.log("OTP Message sent: %s", info.messageId);
        if (!process.env.SMTP_HOST && !process.env.EMAIL_USER) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        return info;
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw error;
    }
};

const sendPasswordResetLink = async (to, link) => {
    try {
        const transporter = await createTransporter();
        
        const info = await transporter.sendMail({
            from: `"Visitor Management System" <${process.env.EMAIL_USER || 'noreply@vms.local'}>`,
            to: to,
            subject: "RESET PASSWORD ANDA - Visitor Management System",
            text: `Anda telah meminta untuk mereset password. Silakan klik tautan berikut untuk mendapatkan password baru Anda: ${link}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #2563eb; padding: 20px; text-align: center; color: white;">
                    <h2 style="margin: 0;">Visitor Management System</h2>
                </div>
                <div style="padding: 30px;">
                    <h3 style="color: #333; margin-top: 0;">Permintaan Reset Password</h3>
                    <p style="color: #555; font-size: 16px;">Kami menerima permintaan untuk mereset password akun Anda. Silakan klik tombol di bawah ini untuk mengonfirmasi dan mendapatkan password baru Anda:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${link}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password Sekarang</a>
                    </div>
                    
                    <p style="color: #555; font-size: 14px;">Atau salin dan tempel tautan berikut di browser Anda:</p>
                    <p style="color: #2563eb; font-size: 13px; word-break: break-all;">${link}</p>
                    
                    <p style="color: #9ca3af; font-size: 13px; margin-top: 25px;">Tautan ini hanya berlaku selama <strong>1 jam</strong>. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
                </div>
                <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} PT Asia Surya Persada. All rights reserved.</p>
                </div>
            </div>
            `,
        });

        console.log("Reset Link email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending reset link email:", error);
        throw error;
    }
};

module.exports = {
    sendRegistrationEmail,
    sendPasswordResetOTP,
    sendPasswordResetLink
};
