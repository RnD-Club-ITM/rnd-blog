'use client'

import { Button } from '@/components/retroui/Button'
import { Link2 } from 'lucide-react'
import { toast } from 'sonner'

export function ShareButton({ title, slug }: { title: string; slug: string }) {
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${slug}`
    
    if (navigator.share) {
      // Use native share on mobile
      try {
        await navigator.share({
          title: title,
          text: `Check out this post on SPARK: ${title}`,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled share
        console.log('Share cancelled')
      }
    } else {
      // Fallback to copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard!')
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        toast.success('Link copied to clipboard!')
      }
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleShare}
      className="border-2 border-black hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
    >
      <Link2 className="w-5 h-5 mr-2" /> Share
    </Button>
  )
}
