'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { getImageUrl, urlFor } from '@/lib/sanity/client'
import { toast } from 'sonner'
import { Rocket, Clock, Trophy, Users } from 'lucide-react'
import { Badge } from '@/components/retroui/Badge'
import { Card } from '@/components/retroui/Card'
import { Button } from '@/components/retroui/Button'

interface QuestCardProps {
  quest: {
    _id: string
    title: string
    slug: { current: string }
    description?: string
    status: 'open' | 'active'
    difficulty: 'easy' | 'medium' | 'hard'
    rewardPoints: number
    daysRemaining?: number
    proposedBy: {
      name: string
      avatar?: any
      clerkId?: string
    }
    participantCount: number
  }
}

export function QuestCard({ quest, isJoined }: QuestCardProps & { isJoined: boolean }) {
  const { user } = useUser()
  const router = useRouter()
  const [isJoining, setIsJoining] = useState(false)

  // Author Rule: If I am the author, I am implicitly joined (Dashboard State)
  // The Data Consistency (creation of participant doc) happens when I enter the workspace
  const isAuthor = user?.id === quest.proposedBy?.clerkId
  const effectiveIsJoined = isJoined || isAuthor

  const [hasJoinedOptimistic, setHasJoinedOptimistic] = useState(effectiveIsJoined)

  const handleAction = async () => {
    console.log('[QuestCard] Action Triggered', {
      questId: quest._id,
      user: user?.id,
      isJoined: effectiveIsJoined
    })

    // 1. Navigation: Enter Quest (for already joined users AND authors)
    if (hasJoinedOptimistic) {
      router.push(`/quests/${quest.slug.current}`)
      return
    }

    // 2. Auth: Redirect to Sign In (for guests)
    if (!user) {
      toast.error('Please sign in to join a quest')
      return
    }

    // 3. Mutation: Join Quest (for new participants)
    if (!confirm('Are you sure you want to join this quest?')) return

    setIsJoining(true)
    try {
      const res = await fetch('/api/quests/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: quest._id })
      })

      const data = await res.json()
      console.log('[QuestCard] Join Response', data)

      if (!res.ok) throw new Error(data.error || 'Failed to join quest')

      setHasJoinedOptimistic(true)
      toast.success('You have joined the quest! Redirecting...')
      router.push(`/quests/${quest.slug.current}`)
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  const difficultyColors = {
    easy: 'bg-success text-white',
    medium: 'bg-accent text-accent-foreground',
    hard: 'bg-destructive text-white',
  }

  const statusColors = {
    open: 'bg-primary text-primary-foreground',
    active: 'bg-secondary text-secondary-foreground',
  }

  return (
    <Card className="border-brutal hover:shadow-brutal transition-all overflow-hidden flex flex-col h-full bg-card">
      <div className="p-6 flex-1">
        {/* Status & Difficulty */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className={statusColors[quest.status]}>
            {quest.status.toUpperCase()}
          </Badge>
          <Badge className={difficultyColors[quest.difficulty]}>
            {quest.difficulty.toUpperCase()}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-head text-xl font-bold mb-3 line-clamp-2">
          {quest.title}
        </h3>

        {/* Description */}
        {quest.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {quest.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between py-3 border-t-2 border-black mb-4">
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Trophy className="w-3 h-3" /> Reward</p>
            <p className="font-bold text-primary">+{quest.rewardPoints} pts</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Participants</p>
            <p className="font-bold">{quest.participantCount + (hasJoinedOptimistic && !isJoined ? 1 : 0)}</p>
          </div>
          {quest.daysRemaining && (
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Time Left</p>
              <p className="font-bold">{quest.daysRemaining}d</p>
            </div>
          )}
        </div>

        {/* Proposed By */}
        <div className="flex items-center gap-2 mb-4">
          {quest.proposedBy?.avatar && getImageUrl(quest.proposedBy.avatar) ? (
            <Image
              src={getImageUrl(quest.proposedBy.avatar)!}
              alt={quest.proposedBy?.name || 'Unknown'}
              width={24}
              height={24}
              className="rounded-full border border-black"
            />
          ) : null}
          <p className="text-xs text-muted-foreground">
            by <span className="font-semibold">{quest.proposedBy?.name || 'Mystery Sparker'}</span>
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="p-6 pt-0">
        <Button
          onClick={handleAction}
          disabled={isJoining}
          className={`w-full border-brutal shadow-brutal hover:shadow-brutal-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${hasJoinedOptimistic
            ? 'bg-accent text-accent-foreground'
            : 'bg-primary text-primary-foreground'
            }`}
        >
          {isJoining ? (
            'Joining...'
          ) : hasJoinedOptimistic ? (
            <span className="flex items-center gap-2">Enter Quest <Rocket className="w-4 h-4" /></span>
          ) : (
            <><Rocket className="w-4 h-4" /> Join Quest</>
          )}
        </Button>
      </div>
    </Card>
  )
}
