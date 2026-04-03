import { Theme } from '@clerk/types';

export const neobrutalAuth: Theme = {
    layout: {
        socialButtonsPlacement: 'bottom',
        socialButtonsVariant: 'blockButton',
        logoPlacement: 'inside',
    },
    variables: {
        colorPrimary: '#FF6B35',
        colorBackground: '#ffffff',
        colorText: '#000000',
        borderRadius: '0px',
    },
    elements: {
        card: 'border-[3px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-none bg-white p-8 relative overflow-visible transition-all duration-300 hover:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)]',
        headerTitle: 'font-head font-black text-3xl tracking-tight mb-2 uppercase text-black italic',
        headerSubtitle: 'text-muted-foreground font-sans text-sm mb-8 font-medium border-l-4 border-[#FF6B35] pl-4 italic bg-muted/5 py-1',
        socialButtonsBlockButton: 'border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 transition-all duration-100 rounded-none bg-white text-black font-head font-black h-12 mb-3 uppercase tracking-widest',
        socialButtonsBlockButtonText: 'font-head font-black text-xs text-black',
        formButtonPrimary: 'bg-black hover:bg-black/95 text-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(255,107,53,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-100 rounded-none h-14 font-head font-black uppercase text-lg tracking-[0.15em] mt-6',
        formFieldInput: 'border-[2px] border-black rounded-none shadow-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:border-black transition-all duration-100 font-sans h-12 font-black bg-white px-4',
        footerActionLink: 'text-black hover:text-[#FF6B35] font-black decoration-2 underline-offset-4 underline uppercase tracking-tighter text-sm',
        identityPreviewEditButtonIcon: 'text-[#FF6B35]',
        formFieldLabel: 'font-head font-black text-[10px] uppercase tracking-[0.2em] text-black/60 mb-2',
        dividerText: 'font-head font-black text-[10px] uppercase text-muted-foreground/50 px-4',
        dividerLine: 'bg-black/10 h-[1px]',
        formResendCodeLink: 'text-[#FF6B35] font-black hover:underline uppercase italic',
        otpCodeFieldInput: 'border-[3px] border-black rounded-none h-14 w-12 font-head font-black text-2xl focus:shadow-[4px_4px_0px_0px_rgba(255,107,53,1)]',
        footer: 'hidden',
        formHeaderTitle: 'hidden',
        formHeaderSubtitle: 'hidden',
        
        // User Button / Popover Styling
        userButtonPopoverCard: 'border-[3px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-none bg-white overflow-hidden',
        userButtonPopoverActions: 'p-2',
        userButtonPopoverActionButton: 'hover:bg-[#FF6B35]/5 py-3 px-4 transition-colors rounded-none border-b border-black/5 last:border-0',
        userButtonPopoverActionButtonText: 'font-head font-black text-xs uppercase tracking-wider text-black',
        userButtonPopoverActionButtonIcon: 'text-black w-4 h-4',
        userButtonPopoverFooter: 'hidden',
        userPreviewMainIdentifier: 'font-head font-black text-lg text-black',
        userPreviewSecondaryIdentifier: 'font-sans font-bold text-xs text-muted-foreground',
        userButtonAvatarBox: 'w-8 h-8 sm:w-10 sm:h-10 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
    }
}
