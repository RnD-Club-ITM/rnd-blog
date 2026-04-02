'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/retroui/Button'
import { Zap } from 'lucide-react'
import { toast } from 'sonner'

export function SparkButton({
  postId,
  initialSparkCount,
}: {
  postId: string
  initialSparkCount: number
}) {
  const { user } = useUser()
  const [sparkCount, setSparkCount] = useState(initialSparkCount)
  const [isSparked, setIsSparked] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleSpark = async () => {
    if (!user) {
      toast.error('Please sign in to spark posts!')
      return
    }

    if (isSparked) {
      return // Already sparked
    }

    // Trigger animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 450)

    // Optimistic update
    setIsSparked(true)
    setSparkCount((prev) => prev + 1)

    try {
      const response = await fetch('/api/posts/spark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        // Revert on error
        setIsSparked(false)
        setSparkCount((prev) => prev - 1)
        toast.error('Failed to spark post. Please try again.')
      }
    } catch (error) {
      console.error('Error sparking post:', error)
      setIsSparked(false)
      setSparkCount((prev) => prev - 1)
    }
  }

  return (
    <div className="relative">
      <Button
        onClick={handleSpark}
        disabled={isSparked}
        className={`rounded px-4 py-2 transition-all active:scale-95 border-2 ${isSparked
          ? 'bg-primary text-primary-foreground border-black shadow-brutal cursor-not-allowed'
          : 'bg-background text-foreground border-black shadow-brutal hover:shadow-brutal-sm hover:bg-primary/10'
          }`}
      >
        <div className={`flex items-center gap-2 ${isAnimating ? 'animate-spark-pulse' : ''}`}>
          <Zap className={`w-5 h-5 ${isSparked ? 'fill-primary-foreground text-primary-foreground' : 'text-muted-foreground'}`} />
          <span className="font-head font-bold text-lg">
            {sparkCount}
          </span>
        </div>
      </Button>
    </div>
  )
}
