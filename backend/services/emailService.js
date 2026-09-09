
const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        if (process.env.EMAIL_HOST) {
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT, 10) || 587,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS
                }
            });
        }
    }

    async sendMail(to, subject, html) {
        if (this.transporter) {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to,
                subject,
                html
            });
        } else {
            console.log('Sending email to:', to);
            console.log('Subject:', subject);
            console.log('Body:', html);
        }
    }

    async sendPasswordReset(email, token, frontendUrl) {
        const url = `${frontendUrl}/reset-password?token=${token}`;
        const html = `<p>You requested a password reset. Click <a href="${url}">here</a> to reset your password.</p>`;
        return this.sendMail(email, 'Password Reset Request', html);
    }

    async sendWelcome(email, name) {
        const html = `<p>Welcome to Krishi Sahayak, ${name}!</p>`;
        return this.sendMail(email, 'Welcome to Krishi Sahayak', html);
    }

    async sendAdvisoryAlert(email, advisory) {
        const html = `<p>New Advisory Alert: ${advisory.title}</p><p>${advisory.message}</p>`;
        return this.sendMail(email, 'Agricultural Advisory Alert', html);
    }
}
module.exports = new EmailService();
