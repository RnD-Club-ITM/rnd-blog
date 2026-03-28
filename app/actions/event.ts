'use server'

import { client } from "@/lib/sanity/client"
import { auth, currentUser } from "@clerk/nextjs/server"
// import { Resend } from 'resend';

// Initialize Resend with API key
// const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitEventProposal(formData: FormData) {
    const { userId } = await auth();

    if (!userId) {
        return { error: 'You must be logged in to propose an event.' }
    }

    // Get user's reference ID
    const userQuery = `*[_type == "user" && clerkId == "${userId}"][0]._id`;
    const sanityUserId = await client.withConfig({ useCdn: false }).fetch(userQuery);

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const requirements = formData.get('requirements') as string
    const eventType = formData.get('eventType') as string
    const locationType = formData.get('locationType') as string
    const location = formData.get('location') as string
    const startTime = formData.get('startTime') as string
    const endTime = formData.get('endTime') as string
    const image = formData.get('image') as File | null;

    if (!title || !startTime) {
        return { error: 'Title and Start Time are required.' }
    }

    const slug = title.toLowerCase().replace(/\s+/g, '-').slice(0, 96);
    let imageAsset = null;

    try {
        if (image && image.size > 0 && image.name !== 'undefined') {
            // Upload image to Sanity
            const buffer = await image.arrayBuffer();
            const asset = await client.assets.upload('image', Buffer.from(buffer), {
                filename: image.name,
                contentType: image.type,
            });
            imageAsset = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
        }

        const doc = {
            _type: 'event',
            title,
            slug: { _type: 'slug', current: `${slug}-${Date.now()}` },
            description,
            requirements,
            eventType,
            locationType,
            location,
            startTime: new Date(startTime).toISOString(),
            endTime: endTime ? new Date(endTime).toISOString() : undefined,
            image: imageAsset,
            status: 'pending',
            organizer: sanityUserId ? { _type: 'reference', _ref: sanityUserId } : undefined, // Link to user
        }

        await client.create(doc, { token: process.env.SANITY_API_TOKEN })

        return { success: true }
    } catch (error) {
        console.error('Failed to submit event proposal:', error)
        return { error: 'Failed to submit proposal. Please try again.' }
    }
}

export async function registerForEvent(formData: FormData) {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        return { error: 'You must be logged in to register.' }
    }

    const eventSlug = formData.get('eventSlug') as string;
    const name = formData.get('name') as string;
    const cohort = formData.get('cohort') as string;
    const batch = formData.get('batch') as string;

    if (!eventSlug || !name || !cohort || !batch) {
        return { error: 'All fields are required.' }
    }

    try {
        // 1. Get Event Details & ID by Slug
        const eventQuery = `*[_type == "event" && slug.current == "${eventSlug}"][0]{_id, title, location, startTime}`;
        const event = await client.withConfig({ useCdn: false }).fetch(eventQuery);

        if (!event) {
            return { error: 'Event not found.' }
        }

        const eventId = event._id;

        // 2. Get Sanity User ID
        const userQuery = `*[_type == "user" && clerkId == "${userId}"][0]._id`;
        const sanityUserId = await client.withConfig({ useCdn: false }).fetch(userQuery);

        if (!sanityUserId) {
            return { error: 'User profile not found. Please complete your profile first.' }
        }

        // 3. Check if already registered
        const existingRegistration = await client.fetch(
            `*[_type == "eventRegistration" && event._ref == $eventId && user._ref == $userId][0]`,
            { eventId, userId: sanityUserId }
        );

        if (existingRegistration) {
            return { error: 'You are already registered for this event.' }
        }

        // 4. Create Registration in Sanity
        const ticketId = `TICKET-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        const doc = {
            _type: 'eventRegistration',
            event: { _type: 'reference', _ref: eventId },
            user: { _type: 'reference', _ref: sanityUserId },
            clerkId: userId,
            name,
            cohort,
            batch,
            status: 'pending', // Default to pending until approved
            ticketId,
            registeredAt: new Date().toISOString(),
        }

        await client.create(doc, { token: process.env.SANITY_API_TOKEN });

        return { success: true, message: 'Registration submitted! You will receive your ticket once approved.' }

    } catch (error) {
        console.error('Registration failed:', error);
        return { error: 'Registration failed. Please try again.' }
    }
}
