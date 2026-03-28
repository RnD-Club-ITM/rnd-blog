
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
    console.log('Sending test email...');
    try {
        const { data, error } = await resend.emails.send({
            from: 'Rnd Club <onboarding@resend.dev>',
            to: ['dakshshrivastava288@gmail.com'], // Using one of the emails found in registrations
            subject: 'Test Email from Script',
            html: '<strong>It works!</strong>',
        });

        if (error) {
            console.error('Email failed:', error);
        } else {
            console.log('Email sent successfully:', data);
        }
    } catch (err) {
        console.error('Script error:', err);
    }
}

sendTestEmail();
