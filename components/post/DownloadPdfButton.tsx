'use client'

import { Button } from '@/components/retroui/Button'
import { Download } from 'lucide-react'
import { useCallback } from 'react'
import { toast } from 'sonner'

interface DownloadPdfButtonProps {
    post: {
        title: string
        content: string
        author: {
            name: string
        }
    }
}

export function DownloadPdfButton({ post }: DownloadPdfButtonProps) {
    const handleDownload = useCallback(() => {
        // Using native browser print engine leverages the @media print CSS overrides 
        // to organically paginate columns flawlessly without slicing SVGs!
        toast.info("Preparing native vector PDF...");
        setTimeout(() => {
             window.print()
        }, 500);
    }, [])

    return (
        <Button
            variant="outline"
            size="sm"
            className="border-brutal shadow-brutal hover:shadow-brutal-sm flex items-center gap-2"
            onClick={handleDownload}
        >
            <Download className="w-4 h-4" />
            Save as PDF
        </Button>
    )
}
