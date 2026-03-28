
import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity/client';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

// Re-use the cron secret logic if you want to secure this endpoint
// e.g. check for Authorization: Bearer process.env.CRON_SECRET

export async function GET(req: NextRequest) {
    console.log('[Cron] Starting reminder check...');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.error('[Cron] Missing email credentials');
        return NextResponse.json({ error: 'Missing email credentials' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    try {
        const now = new Date();
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h from now
        const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 1h window

        const in1Hour = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1h from now
        const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 1h window

        // -------------------------------------------------------------
        //  1. Check for 24h Reminders
        // -------------------------------------------------------------
        // Find events starting between 24h and 25h from now, AND haven't sent 24h reminder
        // Note: GROQ date comparison strings needs ISO format
        const query24h = `*[_type == "event" && startTime >= $start24 && startTime < $end24 && notificationsSent24h != true]{
            _id,
            title,
            startTime,
            location,
            locationType
        }`;

        const events24h = await client.withConfig({ useCdn: false }).fetch(query24h, {
            start24: in24Hours.toISOString(),
            end24: in25Hours.toISOString()
        });

        console.log(`[Cron] Found ${events24h.length} events for 24h reminder.`);

        for (const event of events24h) {
            await sendReminders(event, '24h', transporter);
            // Mark event as sent
            await client.patch(event._id).set({ notificationsSent24h: true }).commit();
        }

        // -------------------------------------------------------------
        //  2. Check for 1h Reminders
        // -------------------------------------------------------------
        const query1h = `*[_type == "event" && startTime >= $start1 && startTime < $end1 && notificationsSent1h != true]{
            _id,
            title,
            startTime,
            location,
            locationType
        }`;

        const events1h = await client.withConfig({ useCdn: false }).fetch(query1h, {
            start1: in1Hour.toISOString(),
            end1: in2Hours.toISOString()
        });

        console.log(`[Cron] Found ${events1h.length} events for 1h reminder.`);

        for (const event of events1h) {
            await sendReminders(event, '1h', transporter);
            // Mark event as sent
            await client.patch(event._id).set({ notificationsSent1h: true }).commit();
        }

        return NextResponse.json({ success: true, events24h: events24h.length, events1h: events1h.length });

    } catch (error) {
        console.error('[Cron] Error running reminders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

async function sendReminders(event: any, type: '24h' | '1h', transporter: any) {
    console.log(`[Cron] Sending ${type} reminders for event: ${event.title}`);

    // Fetch approved attendees
    // We strictly want ONLY approved registrations
    const attendeesQuery = `*[_type == "eventRegistration" && event._ref == $eventId && status == "approved"]{
        name,
        "email": user->email,
        ticketId
    }`;

    const attendees = await client.withConfig({ useCdn: false }).fetch(attendeesQuery, { eventId: event._id });

    console.log(`[Cron] Found ${attendees.length} approved attendees.`);

    if (attendees.length === 0) return;

    for (const attendee of attendees) {
        if (!attendee.email) continue;

        const subject = type === '24h'
            ? `Reminder: ${event.title} is tomorrow! ⏰`
            : `Hurry! ${event.title} starts in 1 hour! 🚀`;

        const timeString = type === '24h' ? 'tomorrow' : 'in 1 hour';

        try {
            // Generate QR Code Buffer
            const qrCodeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-tickets/${attendee.ticketId}`;
            const qrCodeBuffer = await QRCode.toBuffer(qrCodeUrl);

            await transporter.sendMail({
                from: `"Rnd Club" <${process.env.EMAIL_USER}>`,
                to: attendee.email,
                subject: subject,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Event Reminder 🔔</h2>
                        <p>Hi ${attendee.name},</p>
                        <p>This is a friendly reminder that <strong>${event.title}</strong> is happening <strong>${timeString}</strong>.</p>
                        
                        <div style="border: 2px solid #eee; padding: 20px; margin: 20px 0; border-radius: 8px; background-color: #f9f9f9;">
                            <p><strong>Time:</strong> ${new Date(event.startTime).toLocaleString()}</p>
                            <p><strong>Location:</strong> ${event.locationType === 'virtual' ? 'Virtual Event' : event.location}</p>
                            <p><strong>Ticket ID:</strong> ${attendee.ticketId}</p>
                            <div style="margin-top: 20px; text-align: center;">
                                <img src="cid:ticket-qr-code" alt="Ticket QR Code" style="margin: 0 auto; display: block;" />
                            </div>
                        </div>

                        <p>Be sure to arrive (or join) on time!</p>
                        <br/>
                        <p>See you soon,</p>
                        <p>Rnd Club Team</p>
                    </div>
                `,
                attachments: [
                    {
                        filename: 'ticket-qr.png',
                        content: qrCodeBuffer,
                        cid: 'ticket-qr-code'
                    }
                ]
            });
            console.log(`[Cron] Sent to ${attendee.email}`);
        } catch (err) {
            console.error(`[Cron] Failed to send to ${attendee.email}:`, err);
        }
    }
}
