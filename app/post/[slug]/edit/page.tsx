import { getOrCreateUser } from '@/lib/auth/user'
import { redirect, notFound } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { PostForm } from '@/components/create/CreatePostForm'
import { client, queries } from '@/lib/sanity/client'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const user = await getOrCreateUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Fetch post data
  const post = await client.fetch(queries.getPostBySlug(slug))

  if (!post) {
    notFound()
  }

  // Verify ownership
  // Check if current user's Clerk ID matches post author's Clerk ID
  if (post.author.clerkId !== user.clerkId) {
    redirect('/') // Or some access denied page
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-head text-4xl font-bold mb-2">
              Edit Your <span className="text-primary">Post</span> ✍️
            </h1>
            <p className="text-muted-foreground">
              Update your research, fix typos, or add new findings.
            </p>
          </div>

          {/* Form */}
          <PostForm 
            userId={user._id} 
            initialData={{
              title: post.title,
              excerpt: post.excerpt,
              content: post.content,
              tags: post.tags,
              coverImageUrl: post.coverImageUrl,
              videoThumbnail: post.videoThumbnail,
              videoTitle: post.videoTitle,
              attachResearchPaper: post.attachResearchPaper,
            }}
            postId={post._id}
          />
        </div>
      </main>
    </>
  )
}
