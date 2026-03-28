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
        const container = document.getElementById('research-paper-container');
        if (!container) {
            toast.error("Could not find the paper container!");
            return;
        }
        
        toast.info("Preparing isolated vector PDF...");
        
        // Setup hidden iframe to fully isolate the paper print dialog
        // CRITICAL: We MUST give the iframe a desktop width (e.g. 1024px) 
        // so Tailwind's 'md:columns-2' media query respects the IEEE format!
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '-2000px'; // Push way off screen
        iframe.style.bottom = '0';
        iframe.style.width = '1024px';  // Desktop width to trigger MD breakpoints
        iframe.style.height = '1024px';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        
        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) return;
        
        // Grab all current stylesheets (Tailwind + Custom)
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(node => node.outerHTML)
            .join('');
            
        // Clone the structured container securely
        const printContent = container.outerHTML;
        
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${post.title}</title>
                    ${styles}
                    <style>
                        /* Complete Isolation Print Override CSS */
                        @page { margin: 15mm; }
                        body { 
                           background-color: white !important; 
                           margin: 0 !important; 
                           padding: 0 !important;
                           -webkit-print-color-adjust: exact !important;
                           print-color-adjust: exact !important;
                        }
                        
                        /* Strips the drop-shadow strictly inside the print renderer */
                        #research-paper-container {
                            box-shadow: none !important;
                            border: none !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 100% !important;
                            max-width: 100% !important;
                            height: auto !important;
                        }
                        
                        /* Bulletproof vertical gap slicing overrides */
                        svg, img, table, blockquote, pre {
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                            display: block;
                        }
                        h1, h2, h3, h4, table > thead {
                            page-break-after: avoid !important;
                            break-after: avoid !important;
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
            </html>
        `);
        iframeDoc.close();
        
        // Process styles & assets natively, then safely invoke nested iframe print prompt
        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            
            // Garbage cleanup
            setTimeout(() => document.body.removeChild(iframe), 3000);
        }, 1000);
        
    }, [post.title])

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
