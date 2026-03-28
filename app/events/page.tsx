import { client, queries } from "@/lib/sanity/client";
import { Navigation } from "@/components/layout/Navigation";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/retroui/Button";
import Link from "next/link";
import { Calendar, Video, MapPin, Search, Filter } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function EventsPage() {
    const [events, pastEvents] = await Promise.all([
        client.withConfig({ useCdn: false }).fetch(queries.getUpcomingEvents),
        client.withConfig({ useCdn: false }).fetch(queries.getPastEvents),
    ]);

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-background">
                {/* Header Section */}
                <section className="relative overflow-hidden bg-primary/5 py-20 border-b-4 border-black">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-3xl">
                            <h1 className="font-head text-5xl md:text-7xl font-bold mb-6 relative inline-block">
                                Events & <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                                    Workshops
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8 max-w-2xl font-medium">
                                Join exclusive workshops, collaborate on projects, and learn from industry experts.
                            </p>

                            <div className="flex gap-4 flex-wrap">
                                <Link href="#events-grid">
                                    <Button className="font-bold border-2 border-black bg-primary text-primary-foreground shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all text-lg px-8 py-6 h-auto">
                                        Explore Calendar
                                    </Button>
                                </Link>
                                <Link href="/events/propose">
                                    <Button variant="outline" className="font-bold border-2 border-black bg-card text-card-foreground shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all text-lg px-8 py-6 h-auto">
                                        Host an Event
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Background Decorations */}
                    <div className="absolute top-20 right-20 opacity-10 rotate-12 md:block hidden">
                        <Calendar size={300} strokeWidth={1} />
                    </div>
                </section>

                {/* Events Grid */}
                <section id="events-grid" className="container mx-auto px-4 py-16">
                    <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
                        <h2 className="font-head text-3xl font-bold flex items-center gap-3">
                            Upcoming Sessions <div className="h-1 w-20 bg-primary/50 rounded-full mt-2 ml-4"></div>
                        </h2>

                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    className="pl-10 pr-4 py-2 rounded-lg border-2 border-border focus:border-primary outline-none transition-colors w-64 text-sm"
                                />
                            </div>
                            <Button variant="outline" size="icon" className="border-2 border-border">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.map((event: any) => (
                                <div key={event._id} className="h-full">
                                    <EventCard event={event} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-card border-2 border-dashed border-border rounded-3xl flex flex-col items-center">
                            <div className="inline-flex justify-center items-center h-20 w-20 rounded-full bg-muted mb-6">
                                <Calendar className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="font-head text-2xl font-bold mb-2">No upcoming events</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                We're currently planning the next big thing! Check back soon or propose your own event.
                            </p>
                            <Link href="/events/propose">
                                <Button className="font-bold border-2 border-black bg-primary text-primary-foreground">
                                    Propose an Event
                                </Button>
                            </Link>
                        </div>
                    )}
                </section>

                {/* Past Events Grid */}
                {pastEvents.length > 0 && (
                    <section className="container mx-auto px-4 pb-16">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="font-head text-3xl font-bold flex items-center gap-3">
                                Past Events <div className="h-1 w-20 bg-muted-foreground/50 rounded-full mt-2 ml-4"></div>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-80 hover:opacity-100 transition-opacity">
                            {pastEvents.map((event: any) => (
                                <div key={event._id} className="h-full grayscale hover:grayscale-0 transition-all duration-300">
                                    <EventCard event={event} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Newsletter / Notifications */}
                <section className="container mx-auto px-4 pb-20">
                    <div className="bg-zinc-900 rounded-3xl p-12 text-white relative overflow-hidden border-2 border-black shadow-brutal">
                        <div className="relative z-10 text-center max-w-2xl mx-auto">
                            <h2 className="font-head text-3xl md:text-4xl font-bold mb-4">Never Miss an Update</h2>
                            <p className="text-zinc-400 mb-8 text-lg">
                                Get notified about new workshops, hackathons, and guest lectures directly in your inbox.
                            </p>
                            <div className="flex gap-2 max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-3 rounded-lg border-2 border-zinc-700 bg-zinc-800 focus:border-white outline-none transition-colors"
                                />
                                <Button className="bg-white text-black font-bold px-6 border-2 border-transparent hover:border-black/20 hover:bg-gray-200">
                                    Subscribe
                                </Button>
                            </div>
                        </div>

                        {/* Abstract shapes */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full translate-x-1/2 translate-y-1/2"></div>
                    </div>
                </section>
            </main>
        </>
    );
}
