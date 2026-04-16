const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendPICNotification = async (picEmail, visitorName, company, purpose, date) => {
    try {
        const mailOptions = {
            from: `"Visitor Management System" <${process.env.EMAIL_USER}>`,
            to: picEmail,
            subject: 'Persetujuan Kunjungan Tamu Baru',
            html: `
                <h2>Permintaan Kunjungan Tamu</h2>
                <p>Anda memiliki permintaan kunjungan baru yang menunggu persetujuan:</p>
                <ul>
                    <li><strong>Nama Tamu:</strong> ${visitorName}</li>
                    <li><strong>Perusahaan:</strong> ${company}</li>
                    <li><strong>Keperluan:</strong> ${purpose}</li>
                    <li><strong>Tanggal:</strong> ${new Date(date).toLocaleDateString()}</li>
                </ul>
                <p>Silakan login ke dashboard sistem untuk memberikan Appprove atau Reject.</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/" style="display:inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Buka Dashboard</a>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('PIC Notification sent:', info.messageId);
    } catch (error) {
        console.error('Error sending PIC notification:', error);
    }
};

const sendPICCheckInAlert = async (picEmail, visitorName) => {
    try {
        const mailOptions = {
            from: `"Visitor Management System" <${process.env.EMAIL_USER}>`,
            to: picEmail,
            subject: 'Tamu Anda Telah Tiba',
            html: `
                <h2>Notifikasi Kedatangan Tamu</h2>
                <p>Tamu Anda atas nama <strong>${visitorName}</strong> baru saja melakukan Check-In di loby.</p>
                <p>Saat ini tamu sedang menunggu Anda.</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('PIC Check-in alert sent:', info.messageId);
    } catch (error) {
        console.error('Error sending Check-in alert:', error);
    }
};

module.exports = {
    sendPICNotification,
    sendPICCheckInAlert
};