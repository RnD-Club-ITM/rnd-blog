import { defineField, defineType } from 'sanity'

export const eventRegistrationSchema = defineType({
    name: 'eventRegistration',
    title: 'Event Registration',
    type: 'document',
    fields: [
        defineField({
            name: 'event',
            title: 'Event',
            type: 'reference',
            to: [{ type: 'event' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'user',
            title: 'User',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'clerkId',
            title: 'Clerk User ID',
            type: 'string', // Store for easier query if user reference is slow to populate
        }),
        defineField({
            name: 'name',
            title: 'Full Name',
            type: 'string',
        }),
        defineField({
            name: 'cohort',
            title: 'Cohort/Branch',
            type: 'string',
        }),
        defineField({
            name: 'batch',
            title: 'Batch',
            type: 'string',
            options: {
                list: [
                    { title: '2023-2027', value: '2023-2027' },
                    { title: '2024-2028', value: '2024-2028' },
                    { title: '2025-2029', value: '2025-2029' },
                    { title: '2026-2030', value: '2026-2030' },
                ]
            }
        }),
        defineField({
            name: 'status',
            title: 'Registration Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Pending', value: 'pending' },
                    { title: 'Approved', value: 'approved' },
                    { title: 'Rejected', value: 'rejected' },
                    { title: 'Waitlisted', value: 'waitlisted' },
                ],
            },
            initialValue: 'pending',
        }),
        defineField({
            name: 'ticketId',
            title: 'Ticket ID (Unique)',
            type: 'string',
            readOnly: true,
        }),
        defineField({
            name: 'qrCode',
            title: 'QR Code',
            type: 'image',
        }),
        defineField({
            name: 'registeredAt',
            title: 'Registered At',
            type: 'datetime',
        })
    ],
    preview: {
        select: {
            eventName: 'event.title',
            userName: 'user.name',
            status: 'status',
        },
        prepare(selection) {
            const { eventName, userName, status } = selection
            return {
                title: `${userName} - ${eventName}`,
                subtitle: `Status: ${status}`,
            }
        },
    },
})
