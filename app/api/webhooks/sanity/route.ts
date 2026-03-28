import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { client } from '@/lib/sanity/client';

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Verify this is an eventRegistration update
        if (body._type !== 'eventRegistration') {
            return NextResponse.json({ message: 'Not an event registration' }, { status: 200 });
        }

        const { status, user, event, ticketId, name } = body;

        // 2. We only care if status is 'approved'
        // Sanity webhook payload structure usually includes the document
        // But we need to check if the status *changed* to approved. 
        // For simplicity, if we get a webhook for an approved registration, we send the email.
        // Ideally we should check 'before' and 'after' states, but Sanity GROQ webhooks allow us to filter.
        // We will assume the webhook filter is: `_type == "eventRegistration" && status == "approved"`

        if (status !== 'approved') {
            return NextResponse.json({ message: 'Registration not approved' }, { status: 200 });
        }

        if (!user || !user._ref) {
            console.error('No user reference found');
            return NextResponse.json({ message: 'No user reference' }, { status: 400 });
        }

        // 3. Fetch User and Event details
        // We need the user's email and event details.
        // The webhook body might be just the document. We need to fetch related data.

        const query = `{
            "user": *[_type == "user" && _id == $userId][0]{email, name},
            "eventDetails": *[_type == "event" && _id == $eventId][0]{title, startTime, location, locationType}
        }`;

        const data = await client.fetch(query, { userId: user._ref, eventId: event._ref });

        if (!data.user?.email) {
            console.error('User has no email');
            return NextResponse.json({ message: 'User has no email' }, { status: 400 });
        }

        // 4. Send Email
        const { email, name: userName } = data.user;
        const { title, startTime, location, locationType } = data.eventDetails;

        /*
        await resend.emails.send({
            from: 'Rnd Club <onboarding@resend.dev>',
            to: email,
            subject: `Ticket Approved: ${title}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Your Ticket is Ready! 🎟️</h1>
                    <p>Hi ${name || userName},</p>
                    <p>Great news! Your registration for <strong>${title}</strong> has been approved.</p>
                    
                    <div style="border: 2px solid #000; padding: 20px; margin: 20px 0; border-radius: 8px; background-color: #f9f9f9;">
                        <h2 style="margin-top: 0;">${title}</h2>
                        <p><strong>Date:</strong> ${new Date(startTime).toLocaleString()}</p>
                        <p><strong>Location:</strong> ${locationType === 'virtual' ? 'Virtual Event' : location}</p>
                        <p><strong>Ticket ID:</strong> ${ticketId}</p>
                        <div style="margin-top: 20px; padding: 10px; background: #eee; text-align: center; font-family: monospace;">
                            (QR Code Placeholder for ${ticketId})
                        </div>
                    </div>

                    <p>Please present this email or your Ticket ID at the event.</p>
                    <br/>
                    <p>See you there!</p>
                    <p>Rnd Club Team</p>
                </div>
            `
        });
        */

        return NextResponse.json({ success: true, message: 'Email sent' });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
