import { defineType, defineField } from 'sanity'

export const postSchema = defineType({
    name: 'post',
    title: 'Post',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required().min(10).max(100),
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
            name: 'author',
            title: 'Author',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'excerpt',
            title: 'Excerpt',
            type: 'text',
            rows: 3,
            validation: (Rule) => Rule.max(200),
        }),
        defineField({
            name: 'content',
            title: 'Content',
            type: 'markdown',
            validation: (Rule) => Rule.required().min(200),
        }),
        defineField({
            name: 'thumbnail',
            title: 'Thumbnail Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'coverImageUrl',
            title: 'Cover Image URL',
            type: 'url',
        }),
        defineField({
            name: 'videoThumbnail',
            title: 'Video Thumbnail URL (CDN)',
            type: 'url',
        }),
        defineField({
            name: 'authorDetails',
            title: 'Custom Author & Affiliations',
            type: 'text',
        }),
        defineField({
            name: 'tags',
            title: 'Tags',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                list: [
                    { title: 'AI/ML', value: 'ai-ml' },
                    { title: 'IoT', value: 'iot' },
                    { title: 'Web3', value: 'web3' },
                    { title: 'Security', value: 'security' },
                    { title: 'DevOps', value: 'devops' },
                    { title: 'Mobile', value: 'mobile' },
                    { title: 'Cloud', value: 'cloud' },
                ],
            },
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Draft', value: 'draft' },
                    { title: 'Pending Review', value: 'pending' },
                    { title: 'Approved', value: 'approved' },
                    { title: 'Rejected', value: 'rejected' },
                ],
            },
            initialValue: 'draft',
        }),
        defineField({
            name: 'sparkCount',
            title: 'Spark Count',
            type: 'number',
            initialValue: 0,
            readOnly: true,
        }),
        defineField({
            name: 'viewCount',
            title: 'View Count',
            type: 'number',
            initialValue: 0,
            readOnly: true,
        }),
        defineField({
            name: 'quest',
            title: 'Associated Quest',
            type: 'reference',
            to: [{ type: 'quest' }],
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            author: 'author.name',
            media: 'thumbnail',
            status: 'status',
        },
        prepare(selection) {
            const { title, author, status } = selection
            return {
                title,
                subtitle: `by ${author || 'Unknown'} - ${status}`,
            }
        },
    },
})
