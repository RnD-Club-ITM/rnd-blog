import React from 'react'
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
import { Zap, Eye, Flame, Settings, Trophy } from 'lucide-react'

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
  
  const getTierIcon = (tier: number) => {
    switch (tier) {
      case 1: return <Zap className="w-4 h-4 inline text-yellow-500" />;
      case 2: return <Flame className="w-4 h-4 inline text-orange-500" />;
      case 3: return <Settings className="w-4 h-4 inline text-slate-500" />;
      case 4: return <Trophy className="w-4 h-4 inline text-yellow-600" />;
      default: return null;
    }
  };

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
                    Tier {post.author.tier} {getTierIcon(post.author.tier)} •{' '}
                    <span className="whitespace-nowrap">{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t border-black/5 sm:border-0">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Zap className="w-4 h-4 text-primary" /> {post.sparkCount}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Eye className="w-4 h-4" /> {post.viewCount}
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

            {/* Video Hero or Excerpt */}
            {post.videoThumbnail ? (
               <div className="mb-10 w-full rounded-2xl overflow-hidden border-4 border-slate-900 shadow-2xl bg-black aspect-video relative group flex items-center justify-center">
                  <video 
                     key={post.videoThumbnail} 
                     autoPlay 
                     loop 
                     controls
                     playsInline
                     preload="auto"
                     className="w-full h-full object-cover group-hover:opacity-100 transition-opacity"
                  >
                     <source 
                        src={post.videoThumbnail} 
                        type="video/mp4" 
                     />
                     Your browser does not support the video tag.
                  </video>
               </div>
            ) : post.excerpt && (
              <p className="text-lg text-muted-foreground italic mb-8 border-l-4 border-primary pl-4">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Content replaced as A4 Research Paper */}
            <div id="research-paper-container" className="bg-[#ffffff] w-full text-[#000000] p-6 md:p-10 shadow-[8px_8px_0px_#000000] border-4 border-black relative mx-auto mb-12 font-serif overflow-y-auto overflow-x-hidden" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
              {/* Inner top meta line mapping to match Editor preview */}
              <div className="mb-6 pb-4 border-b-2 border-gray-200">
                 <h1 className="text-[24px] font-bold text-center mb-4 text-[#000000] leading-tight font-serif uppercase tracking-tight">
                   {post.title}
                 </h1>
                  <div className="text-center text-[11px] text-gray-700 mb-6 font-serif">
                    {post.authorDetails?.split('\n').map((line: string, i: number) => (
                      <p key={i} className="whitespace-pre-wrap mb-1">
                        {line}
                      </p>
                    ))}
                  </div>
              </div>

              <div className="columns-1 md:columns-2 gap-8 text-justify text-[11px] leading-[1.4] font-serif">
                <div className="prose prose-sm max-w-none font-serif [&_h1]:text-[12px] [&_h1]:font-bold [&_h1]:uppercase [&_h1]:text-center [&_h1]:my-4 [&_h1]:tracking-wide [&_h2]:text-[11px] [&_h2]:font-bold [&_h2]:italic [&_h2]:mb-1 [&_h2]:mt-3 [&_p]:mb-2 [&_p]:text-justify [&_img]:mx-auto [&_img]:my-3 [&_img]:border [&_img]:border-gray-200 [&_table]:w-full [&_table]:text-[9px] [&_table]:break-inside-avoid [&_table]:my-4 [&_th]:border-y-2 [&_th]:border-gray-800 [&_th]:py-1 [&_td]:border-b [&_td]:border-gray-300 [&_td]:py-1 [&_th]:font-bold [&_th]:uppercase [&_th]:bg-black/5 [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:block">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img({ node, ...props }: any) {
                        if (props.alt === 'Video') {
                          return <video src={props.src} controls className="w-full my-4" />
                        }
                        return (
                          <span className="block text-center text-[9px] italic text-[#6b7280] mb-4 mt-2 break-inside-avoid">
                            <img {...props} className="w-full mb-1" alt={props.alt} />
                            {props.alt}
                          </span>
                        )
                      },
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        if (!inline && match && match[1] === "svg") {
                            return <div className="my-4 block text-center break-inside-avoid w-full overflow-hidden border border-gray-100 rounded-md p-1 bg-white" dangerouslySetInnerHTML={{__html: String(children)}} />;
                        }
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={match[1]}
                            PreTag="div"
                            className="w-full text-[9px]"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={`${className} text-[9px] bg-gray-50 border border-gray-100 px-1 rounded`} {...props}>
                            {children}
                          </code>
                        )
                      },
                      p({ node, children }: any) {
                        const childrenArray = React.Children.toArray(children);
                        const firstChild = childrenArray[0];
                        const text = typeof firstChild === 'string' ? firstChild : '';
                        const isCaption = text.startsWith("Fig") || text.startsWith("Table") || text.startsWith("Flowchart");
                        if (isCaption) {
                           return <p className="mb-4 mt-1 text-center font-bold text-[11px] uppercase tracking-tight">{children}</p>;
                        }
                        return <p className="mb-2 indent-4 text-justify leading-relaxed tracking-tight">{children}</p>;
                      }
                    }}
                  >
                    {`**ABSTRACT**\n\n${post.excerpt || "*No abstract provided.*"}\n\n${post.content}`}
                </ReactMarkdown>
              </div>
            </div>
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
                    {tierNames[post.author.tier]} {getTierIcon(post.author.tier)}
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
