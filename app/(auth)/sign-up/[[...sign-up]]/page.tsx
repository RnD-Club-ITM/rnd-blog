import { SignUp } from '@clerk/nextjs'
import { neobrutalAuth } from '@/lib/clerk-theme'
import { Navigation } from '@/components/layout/Navigation'

export default function SignUpPage() {
  return (
    <>
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-background py-12 px-4 relative overflow-hidden transition-colors duration-500">
        {/* Dynamic Theme-Aware Grid Background */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]" style={{ 
          backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        
        {/* Adaptive Shading for Depth */}
        <div className="absolute top-20 right-10 w-24 h-24 bg-primary/20 dark:bg-primary/10 rotate-45 -z-10 blur-2xl" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-black/5 dark:bg-white/5 -rotate-12 -z-10" />

        <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <SignUp
            routing="path"
            path="/sign-up"
            appearance={neobrutalAuth}
          />
        </div>
      </div>
    </>
  )
}
