'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitEventProposal } from '@/app/actions/event';
import { Button } from '@/components/retroui/Button';
import { Navigation } from '@/components/layout/Navigation';
import { Calendar, MapPin, Link as LinkIcon, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ProposeEventPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);

        // Add logic to handle the submission result
        const result = await submitEventProposal(formData); // Use server action wrapper

        if (result && result.error) {
            toast.error(result.error);
            setIsSubmitting(false);
        } else {
            toast.success("Event proposal submitted successfully! Waiting for approval.");
            router.push('/events');
        }
    }

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-background py-12 px-4">
                <div className="max-w-2xl mx-auto bg-card border-2 border-black p-8 rounded-xl shadow-brutal">
                    <div className="text-center mb-8">
                        <h1 className="font-head text-4xl font-bold mb-2">Propose an Event</h1>
                        <p className="text-muted-foreground">
                            Share your knowledge with the community. All events are reviewed before publishing.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="title" className="font-bold flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Event Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="e.g., Intro to Neural Networks Workshop"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="eventType" className="font-bold">Type</label>
                                <select
                                    name="eventType"
                                    id="eventType"
                                    className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                                >
                                    <option value="workshop">Workshop</option>
                                    <option value="hackathon">Hackathon</option>
                                    <option value="lecture">Guest Lecture</option>
                                    <option value="meetup">Meetup</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="locationType" className="font-bold">Location Type</label>
                                <select
                                    name="locationType"
                                    id="locationType"
                                    className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                                >
                                    <option value="physical">Physical (On Campus)</option>
                                    <option value="virtual">Virtual (Online)</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="startTime" className="font-bold flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Start Time
                                </label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    id="startTime"
                                    required
                                    className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="endTime" className="font-bold flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> End Time (Optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    id="endTime"
                                    className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="location" className="font-bold flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Venue / Meeting Link
                            </label>
                            <input
                                type="text"
                                name="location"
                                id="location"
                                placeholder="e.g., Room 304, CS Hall OR Zoom Link"
                                className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="image" className="font-bold flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Event Cover Image
                            </label>
                            <input
                                type="file"
                                name="image"
                                id="image"
                                accept="image/*"
                                className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="requirements" className="font-bold">Requirements / Prerequisites</label>
                            <textarea
                                name="requirements"
                                id="requirements"
                                rows={3}
                                className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                                placeholder="e.g., Bring your own laptop, Install Python 3.9..."
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="font-bold">Description</label>
                            <textarea
                                name="description"
                                id="description"
                                rows={5}
                                required
                                className="w-full p-3 rounded-lg border-2 border-border bg-background focus:border-primary outline-none"
                                placeholder="Describe what attendees will learn..."
                            ></textarea>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full font-bold text-lg py-4 bg-primary text-primary-foreground border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Proposal 🚀'}
                        </Button>
                    </form>
                </div >
            </main >
        </>
    );
}
