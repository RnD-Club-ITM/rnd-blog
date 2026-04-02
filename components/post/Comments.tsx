'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { useUser } from '@clerk/nextjs'
import { getImageUrl } from '@/lib/sanity/client'
import { toast } from 'sonner'
import { Send, MessageSquare, Flame } from 'lucide-react'
import { Button } from '@/components/retroui/Button'
import { Card } from '@/components/retroui/Card'

interface Comment {
  _key: string
  text: string
  createdAt: string
  sparkCount: number
  user: {
    name: string
    avatar?: any
    tier?: number
  }
}

interface CommentsProps {
  postId: string
  initialComments?: Comment[]
}

export function Comments({ postId, initialComments }: CommentsProps) {
  const { user } = useUser()
  const [comments, setComments] = useState<Comment[]>(initialComments || [])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to comment')
      return
    }
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/posts/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, text: newComment })
      })

      if (!res.ok) throw new Error('Failed to comment')

      // Optimistic update
      const optimisticComment: Comment = {
        _key: Math.random().toString(),
        text: newComment,
        createdAt: new Date().toISOString(),
        sparkCount: 0,
        user: {
          name: user.fullName || 'User',
          avatar: user.imageUrl,
        }
      }

      setComments([optimisticComment, ...comments])
      setNewComment('')
    } catch (error) {
      console.error(error)
      toast.error('Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div  id="comments-section" className="border-2 border-black bg-card p-6">
      <h3 className="font-head text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="text-primary w-6 h-6" /> Comments <span className="text-muted-foreground text-sm font-normal">({comments.length})</span>
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? "Share your thoughts..." : "Sign in to share your thoughts..."}
          disabled={!user || isSubmitting}
          className="w-full p-4 border-2 border-black rounded-lg min-h-[100px] mb-4 focus:shadow-brutal-sm outline-none transition-all resize-none bg-background disabled:bg-muted"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!user || isSubmitting || !newComment.trim()}
            className="font-bold border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] bg-primary text-primary-foreground disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Posting...' : <><Send size={18} /> Post Comment</>}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment._key} className="flex gap-4 group">
            <div className="flex-shrink-0">
               {comment.user.avatar ? (
                  // Handle both Sanity images and generic URLs (like optimistic Clerk ones)
                  typeof comment.user.avatar === 'string' ? (
                     <Image
                      src={comment.user.avatar}
                      alt={comment.user.name}
                      width={40}
                      height={40}
                      className="rounded-full border border-black"
                    />
                  ) : (
                    getImageUrl(comment.user.avatar) && (
                      <Image
                        src={getImageUrl(comment.user.avatar)!}
                        alt={comment.user.name}
                        width={40}
                        height={40}
                        className="rounded-full border border-black"
                      />
                    )
                  )
               ) : (
                 <div className="w-10 h-10 rounded-full bg-accent border border-black flex items-center justify-center font-bold">
                    {comment.user.name[0]}
                 </div>
               )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">{comment.user.name}</span>
                <span className="text-xs text-muted-foreground">• {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-muted-foreground py-8 italic">
            <span className="flex items-center justify-center gap-2">No comments yet. Be the first to spark a discussion! <Flame className="w-5 h-5 text-orange-500" /></span>
          </p>
        )}
      </div>
    </div>
  )
}
