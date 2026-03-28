
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_APP_PASSWORD;

console.log(`Testing Gmail SMTP for user: ${user}`);
console.log(`Using App Password (first 4 chars): ${pass?.substring(0, 4)}...`);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: user,
        pass: pass,
    },
});

async function sendTestEmail() {
    try {
        const info = await transporter.sendMail({
            from: `"Test Script" <${user}>`,
            to: user, // Send to self
            subject: 'Gmail SMTP Test',
            text: 'If you receive this, the credentials are correct!',
        });
        console.log('Test email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('Error sending test email:', error);
    }
}

sendTestEmail();
