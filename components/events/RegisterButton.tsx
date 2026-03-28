'use client';

import { Button } from '@/components/retroui/Button';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

interface RegisterButtonProps {
    eventSlug: string;
    isPast: boolean;
}

export function RegisterButton({ eventSlug, isPast }: RegisterButtonProps) {
    const { isSignedIn, isLoaded } = useUser();
    const router = useRouter();

    const handleClick = () => {
        if (!isLoaded) return;

        if (!isSignedIn) {
            toast.error("Please sign in to register for this event");
            router.push('/sign-in');
            return;
        }

        router.push(`/events/${eventSlug}/register`);
    };

    if (isPast) {
        return (
            <Button disabled className="w-full flex-1 opacity-50 cursor-not-allowed border-2 border-black bg-muted font-bold">
                Event Ended
            </Button>
        );
    }

    return (
        <Button
            onClick={handleClick}
            className="w-full flex-1 bg-primary text-primary-foreground border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all font-bold"
        >
            Register Now
        </Button>
    );
}
