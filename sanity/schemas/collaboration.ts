import { defineType, defineField, defineArrayMember } from 'sanity'

export const collaborationSchema = defineType({
    name: 'collaboration',
    title: 'Collaboration',
    type: 'document',
    fields: [
        defineField({
            name: 'projectName',
            title: 'Project Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 5,
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'skillsNeeded',
            title: 'Skills Needed',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                list: [
                    'React',
                    'Node.js',
                    'Python',
                    'Machine Learning',
                    'Data Science',
                    'DevOps',
                    'UI/UX',
                    'Mobile Development',
                    'Blockchain',
                    'IoT',
                ],
            },
        }),
        defineField({
            name: 'duration',
            title: 'Duration',
            type: 'string',
            options: {
                list: [
                    '1-2 weeks',
                    '3-4 weeks',
                    '1-2 months',
                    '3+ months',
                ],
            },
        }),
        defineField({
            name: 'commitment',
            title: 'Time Commitment',
            type: 'string',
            description: 'Hours per week',
        }),
        defineField({
            name: 'maxPositions',
            title: 'Max Positions',
            type: 'number',
            description: 'Maximum number of collaborators allowed (excluding owner)',
            initialValue: 3,
            validation: (Rule) => Rule.min(1).max(20),
        }),
        defineField({
            name: 'postedBy',
            title: 'Posted By',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'teamMembers',
            title: 'Team Members',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'reference',
                    to: [{ type: 'user' }],
                }),
            ],
        }),
        defineField({
            name: 'applicants',
            title: 'Applicants',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'object',
                    fields: [
                        { name: 'user', type: 'reference', to: [{ type: 'user' }], title: 'User' },
                        { name: 'applicationText', type: 'text', title: 'Application Text', rows: 3 },
                        { name: 'appliedAt', type: 'datetime', title: 'Applied At' },
                        {
                            name: 'status',
                            type: 'string',
                            title: 'Status',
                            options: { list: ['pending', 'accepted', 'rejected'] },
                            initialValue: 'pending',
                        },
                    ],
                }),
            ],
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Open', value: 'open' },
                    { title: 'In Progress', value: 'in-progress' },
                    { title: 'Completed', value: 'completed' },
                ],
            },
            initialValue: 'open',
        }),
        defineField({
            name: 'githubRepo',
            title: 'GitHub Repository',
            type: 'url',
        }),
        defineField({
            name: 'designDoc',
            title: 'Design Document',
            type: 'url',
        }),
        defineField({
            name: 'messages',
            title: 'Chat Messages',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'object',
                    fields: [
                        { name: 'text', type: 'text', title: 'Message Text' },
                        { name: 'user', type: 'reference', to: [{ type: 'user' }], title: 'Sender' },
                        { name: 'timestamp', type: 'datetime', title: 'Timestamp', initialValue: () => new Date().toISOString() },
                    ],
                }),
            ],
        }),
    ],
    preview: {
        select: {
            title: 'projectName',
            status: 'status',
            postedBy: 'postedBy.name',
        },
        prepare(selection) {
            const { title, status, postedBy } = selection
            return {
                title,
                subtitle: `${(status || 'open').toUpperCase()} - by ${postedBy || 'Unknown'}`,
            }
        },
    },
})
