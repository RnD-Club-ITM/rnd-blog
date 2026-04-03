'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Loader2, Play } from 'lucide-react'

interface VideoHeroProps {
  src: string
  poster?: string
  autoPlay?: boolean
}

export function VideoHero({ src, poster, autoPlay = true }: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (videoRef.current && autoPlay) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn("Autoplay blocked:", e)
          setIsPlaying(false)
        })
    }
  }, [src, autoPlay])

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(console.error)
    }
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted gap-2 border-2 border-dashed border-border p-4">
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Video Unavailable</p>
        <p className="text-[10px] text-muted-foreground/60 break-all max-w-[80%] text-center">{src}</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full group/hero overflow-hidden bg-black flex items-center justify-center">
      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-[2px] z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Manual Play Overlay - Only shows if not autoplaying or blocked */}
      {!isPlaying && isLoaded && (
        <div 
          onClick={handlePlay}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 cursor-pointer group-hover/hero:bg-black/50 transition-colors"
        >
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-brutal border-4 border-black transform group-hover/hero:scale-110 transition-transform">
             <Play className="w-10 h-10 text-primary-foreground fill-primary-foreground ml-1" />
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        key={src}
        autoPlay={autoPlay}
        loop
        muted
        controls
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        poster={poster}
        onLoadedData={() => setIsLoaded(true)}
        onError={() => setError(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      >
        <source src={src} />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
