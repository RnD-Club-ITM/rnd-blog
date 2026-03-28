'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/retroui/Button';
import { registerForEvent } from '@/app/actions/event';
import { toast } from 'sonner';
import { Loader2, Ticket, User, GraduationCap, Calendar } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Navigation } from '@/components/layout/Navigation';

interface PageProps {
    params: Promise<{
        slug: string;
    }>
}

export default function EventRegistrationPage({ params }: PageProps) {
    const { slug } = use(params);
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!isLoaded || !user) {
            toast.error("Please sign in to register.");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);

        formData.append('eventSlug', slug);

        try {
            const result = await registerForEvent(formData);

            if (result.error) {
                toast.error(result.error);
                setIsSubmitting(false);
            } else {
                toast.success(result.message || "Registration successful!");
                router.push('/events');
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-background py-16 px-4">
                <div className="max-w-md mx-auto bg-card border-2 border-black p-8 rounded-xl shadow-brutal">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4 border-2 border-black">
                            <Ticket className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="font-head text-3xl font-bold mb-2">Event Registration</h1>
                        <p className="text-muted-foreground">
                            Complete your details to secure your spot.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="font-bold flex items-center gap-2">
                                <User className="h-4 w-4" /> Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                defaultValue={user?.fullName || ''}
                                className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="cohort" className="font-bold flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" /> Cohort / Branch
                            </label>
                            <input
                                type="text"
                                name="cohort"
                                id="cohort"
                                required
                                placeholder="e.g. CSE, AIML, B.Tech CS"
                                className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="batch" className="font-bold flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Batch / Year
                            </label>
                            <select
                                name="batch"
                                id="batch"
                                required
                                defaultValue=""
                                className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                            >
                                <option value="" disabled>Select Batch</option>
                                <option value="2023-2027">2023-2027</option>
                                <option value="2024-2028">2024-2028</option>
                                <option value="2025-2029">2025-2029</option>
                                <option value="2026-2030">2026-2030</option>
                            </select>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full font-bold text-lg py-4 bg-primary text-primary-foreground border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Registering...
                                </>
                            ) : (
                                "Complete Registration 🚀"
                            )}
                        </Button>
                    </form>
                </div>
            </main>
        </>
    );
}
