import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { currentUser } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
    try {
        const clerkUser = await currentUser()

        if (!clerkUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, excerpt, content, tags, userId, coverImageUrl, videoThumbnail, videoTitle, attachResearchPaper, authorDetails } = body

        // Create post object
        const postDoc = {
            _type: 'post',
            title,
            excerpt,
            content,
            authorDetails,
            tags: (tags || []).map((t: string) => t.toLowerCase()),
            slug: {
                _type: 'slug',
                current: title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, ''),
            },
            author: {
                _type: 'reference',
                _ref: userId,
            },
            status: 'pending',
            sparkCount: 0,
            viewCount: 0,
            publishedAt: new Date().toISOString(),
            ...(coverImageUrl && { coverImageUrl }), // Only add if present
            ...(videoThumbnail && { videoThumbnail }),
            ...(videoTitle && { videoTitle }),
            attachResearchPaper: !!attachResearchPaper,
        }

        const post = await client.create(postDoc)

        return NextResponse.json({
            message: 'Post created successfully',
            slug: post.slug.current,
        })
    } catch (error: any) {
        console.error('Error creating post:', JSON.stringify(error, null, 2))
        return NextResponse.json(
            { error: error.message || 'Failed to create post' },
            { status: 500 }
        )
    }
}
