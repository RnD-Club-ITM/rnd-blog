import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { currentUser } from '@clerk/nextjs/server'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const clerkUser = await currentUser()

        if (!clerkUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, excerpt, content, tags, coverImageUrl, videoThumbnail, videoTitle, attachResearchPaper, authorDetails } = body
 
         // Fetch the post to check ownership
         const post = await client.fetch(`*[_type == "post" && _id == $id][0] { author->{ clerkId } }`, { id })
 
         if (!post) {
             return NextResponse.json({ error: 'Post not found' }, { status: 404 })
         }
 
         // Check if the current user is the author
         if (post.author?.clerkId !== clerkUser.id) {
             return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
         }
 
         // Update post in Sanity
         const updatedPost = await client
             .patch(id)
             .set({
                 title,
                 excerpt,
                 content,
                 authorDetails,
                 tags: (tags || []).map((t: string) => t.toLowerCase()),
                 isEdited: true,
                 ...(coverImageUrl && { coverImageUrl }), 
                 ...(videoThumbnail && { videoThumbnail }),
                 ...(videoTitle && { videoTitle }),
                 attachResearchPaper: !!attachResearchPaper,
             })
            .commit()

        return NextResponse.json({
            message: 'Post updated successfully',
            post: updatedPost,
        })
    } catch (error) {
        console.error('Error updating post:', error)
        return NextResponse.json(
            { error: 'Failed to update post' },
            { status: 500 }
        )
    }
}
