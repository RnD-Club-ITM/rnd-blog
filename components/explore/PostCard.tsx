'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getImageUrl, urlFor } from '@/lib/sanity/client'
import { Badge } from '@/components/retroui/Badge'
import { Card } from '@/components/retroui/Card'
import { Button } from '@/components/retroui/Button'
// import { FaBolt, FaEye } from 'react-icons/fa6'
import { SignedOut, SignedIn } from '@clerk/nextjs'
import * as Dialog from '@radix-ui/react-dialog'
import { BookmarkButton } from '@/components/collections/BookmarkButton'
import { X, Lock, Zap, Flame, Settings, Trophy, Eye, Zap as BoltIcon } from 'lucide-react'

interface PostCardProps {
  post: {
    _id: string
    title: string
    slug: { current: string }
    excerpt?: string
    thumbnail?: any
    coverImageUrl?: string
    videoThumbnail?: string
    tags?: string[]
    sparkCount: number
    viewCount: number
    publishedAt: string
    isEdited?: boolean
    author: {
      name: string
      avatar?: any
      tier: number
    }
    isBookmarked?: boolean
  }
}

export function PostCard({ post }: PostCardProps) {
  const tierEmojis = ['', '⚡', '🔥', '⚙️', '🏆']
  const tagColors: Record<string, string> = {
    'ai-ml': 'bg-accent text-accent-foreground',
    'iot': 'bg-secondary text-secondary-foreground',
    'web3': 'bg-primary text-primary-foreground',
    'security': 'bg-destructive text-white',
    'devops': 'bg-muted text-foreground',
  }

  return (
    <>
      <Card className="border-brutal hover:shadow-brutal transition-all overflow-hidden group relative flex flex-col h-full bg-card">
        {/* Signed In Logic: Normal Navigation */}
        <SignedIn>
          <Link href={`/post/${post.slug.current}`} className="block h-full flex flex-col">
            <PostCardContent post={post} tierEmojis={tierEmojis} tagColors={tagColors} />
          </Link>
        </SignedIn>

        {/* Signed Out Logic: Gated Modal */}
        <SignedOut>
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <div className="cursor-pointer h-full flex flex-col">
                <PostCardContent post={post} tierEmojis={tierEmojis} tagColors={tagColors} />
              </div>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
              <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] border-brutal bg-background p-6 shadow-brutal animate-in zoom-in-95 duration-200">
                <div className="flex flex-col gap-4 text-center">
                  <div className="flex justify-end">
                    <Dialog.Close asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <div className="text-4xl mb-2 flex justify-center"><Lock className="w-12 h-12 text-primary" /></div>
                  <Dialog.Title className="text-2xl font-head font-bold">
                    Get Started to View Full Project
                  </Dialog.Title>
                  <Dialog.Description className="text-muted-foreground">
                    Sign in to explore full project details and collaborate with other engineers.
                  </Dialog.Description>
                  <div className="mt-4">
                    <Link href="/sign-in">
                      <Button className="w-full bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </SignedOut>
      </Card>
    </>
  )
}

function VideoPreview({ src, poster, title }: { src: string, poster?: string | null, title: string }) {
  return (
    <div className="relative w-full aspect-video rounded-md overflow-hidden border-2 border-black mb-3 sm:mb-4 bg-muted/20 group/video">
      <video
        src={src.includes('#t=') ? src : `${src}#t=0.1`}
        poster={poster || undefined}
        muted
        playsInline
        preload="metadata"
        className="w-full h-full object-cover transition-transform duration-500 group-hover/video:scale-105"
      />
      {/* Play icon overlay to indicate it's a video post without playing it on the card */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity bg-black/20">
         <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-brutal border-2 border-black">
            <BoltIcon className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-0.5" />
         </div>
      </div>
    </div>
  )
}

function PostCardContent({ post, tierEmojis, tagColors }: { post: any, tierEmojis: string[], tagColors: Record<string, string> }) {
  const coverImage = post.coverImageUrl || (post.thumbnail ? getImageUrl(post.thumbnail) : null)

  return (
    <>
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 sm:mb-3">
            {post.tags.slice(0, 2).map((tag: string) => (
              <Badge
                key={tag}
                className={`${tagColors[tag] || 'bg-muted'} text-[10px] sm:text-xs`}
              >
                {tag.toUpperCase().replace('-', '/')}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
          <h3 className="font-head text-lg sm:text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors flex-1 leading-tight">
            {post.title}
          </h3>
          <div onClick={(e) => e.preventDefault()} className="shrink-0 scale-90 sm:scale-100">
            <BookmarkButton postId={post._id} isBookmarked={post.isBookmarked} />
          </div>
        </div>

        {/* Cover Video (Under Title) */}
        {post.videoThumbnail && (
          <VideoPreview 
            src={post.videoThumbnail} 
            poster={coverImage} 
            title={post.title} 
          />
        )}

        {/* Excerpt/Abstract visible ONLY if Research Paper is attached */}
        {post.attachResearchPaper && post.excerpt && (
          <p className="text-muted-foreground text-xs sm:text-sm mb-4 line-clamp-3 flex-1 leading-relaxed border-l-2 border-primary/30 pl-3 italic">
            <span className="font-bold text-[10px] uppercase block mb-1 not-italic">Abstract</span>
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        {/* Author and Stats */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t-2 border-black/5">
          {/* Author */}
          <div className="flex items-center gap-2">
            {post.author.avatar && getImageUrl(post.author.avatar) && (
              <div className="relative w-6 h-6 sm:w-8 sm:h-8 shrink-0">
                <Image
                  src={getImageUrl(post.author.avatar)!}
                  alt={post.author.name}
                  fill
                  className="rounded-full border border-black object-cover"
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate max-w-[80px] sm:max-w-none">{post.author.name}</p>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                  T{post.author.tier} {post.author.tier === 1 && <Zap className="w-3 h-3 inline text-yellow-500" />}
                  {post.author.tier === 2 && <Flame className="w-3 h-3 inline text-orange-500" />}
                  {post.author.tier === 3 && <Settings className="w-3 h-3 inline text-slate-500" />}
                  {post.author.tier === 4 && <Trophy className="w-3 h-3 inline text-yellow-600" />}
                </p>
                {post.isEdited && <span className="text-[8px] sm:text-[10px] bg-muted px-1 py-0.5 rounded text-muted-foreground font-medium uppercase">(edited)</span>}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 sm:gap-3 font-medium text-[10px] sm:text-sm">
            <span className="flex items-center gap-1 text-primary">
              <BoltIcon className="w-3 h-3 sm:w-4 sm:h-4" /> {post.sparkCount || 0}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> {post.viewCount || 0}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
