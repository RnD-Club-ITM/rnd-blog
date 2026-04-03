'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBolt } from 'react-icons/fa6'

export function IntroAnimation({ children }: { children: React.ReactNode }) {
    const [showIntro, setShowIntro] = useState(false)
    const [animationComplete, setAnimationComplete] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Check if intro has already played in this session
        const introPlayed = sessionStorage.getItem('introPlayed')
        if (!introPlayed) {
            setShowIntro(true)
            // Lock scrolling while animation is playing
            document.body.style.overflow = 'hidden'
        } else {
            setAnimationComplete(true)
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            document.body.style.overflow = 'unset'
        }
    }, [])

    const handleAnimationComplete = () => {
        sessionStorage.setItem('introPlayed', 'true')
        setAnimationComplete(true)
        setShowIntro(false)
        // Restore scrolling
        document.body.style.overflow = 'unset'
    }

    // Generate random spark particles
    const sparks = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        angle: (i / 12) * Math.PI * 2,
        distance: Math.random() * 60 + 80,
        size: Math.random() * 4 + 2,
        delay: 0.1 * i,
    }))

    return (
        <>
            <AnimatePresence mode="wait">
                {showIntro && (
                    <motion.div
                        key="intro-overlay"
                        layout
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-background overflow-hidden"
                    >
                        <motion.div 
                            layout
                            className="relative flex items-center justify-center px-8"
                        >
                            {/* Logo + Sparks Group */}
                            <motion.div layout className="relative flex items-center justify-center">
                                {/* Sparks Burst */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        {sparks.map((spark) => (
                                            <motion.div
                                                key={spark.id}
                                                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                                                animate={{
                                                    x: Math.cos(spark.angle) * spark.distance,
                                                    y: Math.sin(spark.angle) * spark.distance,
                                                    opacity: [0, 1, 1, 0],
                                                    scale: [0, 1.2, 1, 0],
                                                }}
                                                transition={{
                                                    duration: 1.2,
                                                    delay: 1.0 + spark.delay,
                                                    ease: "easeOut",
                                                    repeat: Infinity,
                                                    repeatDelay: 2.5
                                                }}
                                                className="absolute w-1 h-1 bg-primary rounded-full blur-[1px]"
                                                style={{ width: spark.size, height: spark.size }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Logo (FaBolt) */}
                                <motion.div
                                    layout
                                    initial={{ scale: 0, opacity: 0, filter: 'drop-shadow(0 0 0px var(--primary))' }}
                                    animate={{
                                        scale: [0, 1.3, 1],
                                        opacity: 1,
                                        filter: [
                                            'drop-shadow(0 0 0px var(--primary))',
                                            'drop-shadow(0 0 30px var(--primary))',
                                            'drop-shadow(0 0 0px var(--primary))'
                                        ]
                                    }}
                                    transition={{
                                        layout: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                                        scale: { duration: 2.0, times: [0, 0.6, 1], ease: [0.16, 1, 0.3, 1] },
                                        opacity: { duration: 1.0 }
                                    }}
                                    className="text-primary text-7xl sm:text-9xl shrink-0 z-10"
                                >
                                    <FaBolt />
                                </motion.div>
                            </motion.div>

                            {/* Text "SPARK" */}
                            <motion.div
                                layout
                                initial={{ width: 0, opacity: 0 }}
                                animate={{
                                    width: "auto",
                                    opacity: 1,
                                }}
                                transition={{
                                    layout: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                                    width: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1.5 },
                                    opacity: { duration: 0.8, delay: 1.8 }
                                }}
                                onAnimationComplete={() => {
                                    timerRef.current = setTimeout(handleAnimationComplete, 1800)
                                }}
                                className="font-head text-6xl sm:text-8xl font-black tracking-tighter overflow-hidden whitespace-nowrap"
                            >
                                <span className="pl-4 sm:pl-8 inline-block">SPARK</span>
                            </motion.div>
                        </motion.div>

                        {/* Energy Line */}
                        <motion.div
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: [0, 1, 0.5, 1] }}
                            transition={{ duration: 2.5, delay: 0.5 }} // Slowed down
                            className="absolute bottom-1/2 translate-y-[100px] w-64 sm:w-80 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent blur-[1px]"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={false}
                animate={{
                    opacity: animationComplete ? 1 : 0,
                    scale: animationComplete ? 1 : 0.98,
                    filter: animationComplete ? 'blur(0px)' : 'blur(5px)'
                }}
                transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                }}
                className="w-full h-full origin-top"
            >
                {children}
            </motion.div>
        </>
    )
}

