import { defineField, defineType } from 'sanity'
import { Calendar } from 'lucide-react'

export const eventSchema = defineType({
    name: 'event',
    title: 'Event',
    type: 'document',
    icon: Calendar,
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Pending', value: 'pending' },
                    { title: 'Approved', value: 'approved' },
                    { title: 'Rejected', value: 'rejected' },
                ],
            },
            initialValue: 'pending',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'requirements',
            title: 'Requirements',
            type: 'markdown',
            description: 'List any prerequisites or requirements for the event.',
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'markdown',
            description: 'A brief description of the event.',
        }),
        defineField({
            name: 'eventType',
            title: 'Event Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Workshop', value: 'workshop' },
                    { title: 'Hackathon', value: 'hackathon' },
                    { title: 'Lecture', value: 'lecture' },
                    { title: 'Meetup', value: 'meetup' },
                    { title: 'Other', value: 'other' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'locationType',
            title: 'Location Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Physical', value: 'physical' },
                    { title: 'Virtual', value: 'virtual' },
                    { title: 'Hybrid', value: 'hybrid' },
                ],
            },
            initialValue: 'physical',
        }),
        defineField({
            name: 'location',
            title: 'Location / Link',
            type: 'string',
            description: 'Physical address or virtual meeting link.',
        }),
        defineField({
            name: 'startTime',
            title: 'Start Time',
            type: 'datetime',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'endTime',
            title: 'End Time',
            type: 'datetime',
        }),
        defineField({
            name: 'registrationLink',
            title: 'Registration Link',
            type: 'url',
        }),
        defineField({
            name: 'image',
            title: 'Event Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'organizer',
            title: 'Organizer',
            type: 'reference',
            to: [{ type: 'user' }],
        }),
        defineField({
            name: 'notificationsSent24h',
            title: 'Sent 24h Reminder',
            type: 'boolean',
            initialValue: false,
        }),
        defineField({
            name: 'notificationsSent1h',
            title: 'Sent 1h Reminder',
            type: 'boolean',
            initialValue: false,
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'startTime',
            media: 'image',
        },
    },
})
