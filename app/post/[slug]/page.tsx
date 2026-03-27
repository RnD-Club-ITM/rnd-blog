import { client, queries, getImageUrl, urlFor } from '@/lib/sanity/client'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Navigation } from '@/components/layout/Navigation'
import { SparkButton } from '@/components/post/SparkButton'
import { ShareButton } from '@/components/post/ShareButton'
import { Comments } from '@/components/post/Comments'
import { CommentButton } from '@/components/post/CommentButton'
import { EditAction } from '@/components/post/EditAction'
import { Badge } from '@/components/retroui/Badge'
import { Button } from '@/components/retroui/Button'
import { DownloadPdfButton } from '@/components/post/DownloadPdfButton'
import { BookmarkButton } from '@/components/collections/BookmarkButton'

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await client.fetch(queries.getPostBySlug(slug))

  if (!post) {
    notFound()
  }

  // Increment view count
  await client.patch(post._id).inc({ viewCount: 1 }).commit()

  const tierNames = ['', 'Spark Initiate', 'Idea Igniter', 'Forge Master', 'RnD Fellow']
  const tierEmojis = ['', '⚡', '🔥', '⚙️', '🏆']

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header */}
          <header className="mb-8">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag: string) => (
                  <Badge key={tag} className="bg-primary text-primary-foreground">
                    {tag.toUpperCase().replace('-', '/')}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <h1 className="font-head text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                {post.title}
              </h1>
              <div className="shrink-0 self-end sm:self-start">
                <BookmarkButton postId={post._id} />
              </div>
            </div>

            {/* Author & Meta */}
            <div className="flex flex-col gap-4 border-y-2 border-black py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {post.author.avatar && getImageUrl(post.author.avatar) && (
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                    <Image
                      src={getImageUrl(post.author.avatar)!}
                      alt={post.author.name}
                      fill
                      className="rounded-full border-2 border-black object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-head font-bold text-base sm:text-lg truncate">{post.author.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Tier {post.author.tier} {tierEmojis[post.author.tier]} •{' '}
                    <span className="whitespace-nowrap">{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t border-black/5 sm:border-0">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-bold">
                    ⚡ {post.sparkCount}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    👁 {post.viewCount}
                  </span>
                </div>
                <EditAction authorClerkId={post.author.clerkId} slug={post.slug.current} />
              </div>
            </div>

            {/* Featured Image */}
            {(post.coverImageUrl || post.thumbnail) && (
              <div className="my-8 border-brutal overflow-hidden">
                <Image
                  src={post.coverImageUrl || urlFor(post.thumbnail).width(800).height(450).url()}
                  alt={post.title}
                  width={800}
                  height={450}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg text-muted-foreground italic mb-8 border-l-4 border-primary pl-4">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-brutal prose-lg max-w-none mb-12 break-words overflow-hidden">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img({ node, ...props }: any) {
                  if (props.alt === 'Video') {
                    return (
                      <video
                        src={props.src}
                        controls
                        className="w-full rounded-md border-2 border-black my-4"
                      />
                    )
                  }
                  return (
                    <img
                      {...props}
                      className="w-full rounded-md border-2 border-black my-4"
                      alt={props.alt}
                    />
                  )
                },
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  if (!inline && match && match[1] === "svg") {
                      return <div className="my-8 flex justify-center w-full overflow-x-auto" dangerouslySetInnerHTML={{__html: String(children)}} />;
                  }
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      className="border-2 border-black overflow-x-auto"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className="bg-muted border border-black px-1 py-0.5 break-all"
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                h1: ({ children }) => (
                  <h1 className="font-head text-3xl font-bold mt-8 mb-4 border-b-2 border-black pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-head text-2xl font-bold mt-6 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-head text-xl font-bold mt-4 mb-2">
                    {children}
                  </h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary bg-primary/5 pl-4 py-2 my-4">
                    {children}
                  </blockquote>
                ),
                table: ({ children, ...props }: any) => (
                  <div className="w-full overflow-x-auto my-8 border-2 border-black break-inside-avoid shadow-[4px_4px_0_0_#000]">
                    <table className="w-full text-left border-collapse bg-card" {...props}>
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children, ...props }: any) => (
                  <th className="border-b-2 border-black py-4 px-6 bg-primary/10 font-head font-bold text-lg" {...props}>
                    {children}
                  </th>
                ),
                td: ({ children, ...props }: any) => (
                  <td className="border-b border-black/20 py-3 px-6 align-top" {...props}>
                    {children}
                  </td>
                ),
                p: ({ children }) => (
                  <p className="break-words overflow-wrap-break-word">
                    {children}
                  </p>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Engagement Actions */}
          <div className="border-y-2 border-black py-6 mb-8">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-4">
              <div className="contents sm:block">
                <SparkButton postId={post._id} initialSparkCount={post.sparkCount} />
              </div>
              <div className="contents sm:block">
                <CommentButton postId={post._id} />
              </div>
              <div className="contents sm:block">
                <ShareButton title={post.title} slug={slug} />
              </div>
              <div className="contents sm:block">
                <DownloadPdfButton post={post} />
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <Comments postId={post._id} initialComments={post.comments || []} />

          {/* Author Bio */}
          {post.author.bio && (
            <div className="border-brutal p-5 sm:p-6 bg-card mb-8">
              <h3 className="font-head text-xl font-bold mb-4">About the Author</h3>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {post.author.avatar && getImageUrl(post.author.avatar) && (
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 shrink-0">
                    <Image
                      src={getImageUrl(post.author.avatar)!}
                      alt={post.author.name}
                      fill
                      className="rounded-full border-2 border-black object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-lg mb-1">{post.author.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                    {tierNames[post.author.tier]} {tierEmojis[post.author.tier]}
                  </p>
                  <p className="text-sm leading-relaxed">{post.author.bio}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quest Link */}
          {post.quest && (
            <div className="border-brutal-thick p-5 sm:p-6 bg-accent/10 mb-8">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 font-bold uppercase tracking-wider">
                Part of the Quest:
              </p>
              <h3 className="font-head text-xl sm:text-2xl font-bold mb-4">
                {post.quest.title}
              </h3>
              <Button
                className="w-full sm:w-auto bg-accent text-accent-foreground border-brutal shadow-brutal hover:shadow-brutal-sm"
              >
                View Quest →
              </Button>
            </div>
          )}
        </article>
      </main>
    </>
  )
}
