
import { client } from "@/lib/sanity/client";
import { notFound } from "next/navigation";
import { FaCheckCircle, FaTimesCircle, FaClock, FaMapMarkerAlt, FaCalendarAlt, FaUser } from "react-icons/fa";
import Link from "next/link";
import { Button } from "@/components/retroui/Button";
import { TicketActionsClient } from "@/components/events/TicketActionsClient";

interface TicketPageProps {
    params: {
        ticketId: string;
    }
}

async function getTicketDetails(ticketId: string) {
    const query = `*[_type == "eventRegistration" && ticketId == $ticketId][0]{
        _id,
        ticketId,
        name,
        status,
        "eventName": event->title,
        "eventSlug": event->slug.current,
        "startTime": event->startTime,
        "location": event->location,
        "locationType": event->locationType,
        "description": event->description,
        registeredAt
    }`;

    return client.withConfig({ useCdn: false }).fetch(query, { ticketId });
}

export default async function TicketPage(props: TicketPageProps) {
    const params = await props.params;
    const ticket = await getTicketDetails(params.ticketId);

    if (!ticket) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
                <h1 className="text-4xl font-black mb-4">Ticket Not Found 😢</h1>
                <p className="mb-8 text-muted-foreground">The ticket ID <strong>{params.ticketId}</strong> does not exist.</p>
                <Link href="/">
                    <Button>Go Home</Button>
                </Link>
            </div>
        );
    }

    const isApproved = ticket.status === 'approved';
    const isRejected = ticket.status === 'rejected';
    const isPending = ticket.status === 'pending';

    return (
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
            <div className={`
                max-w-md w-full bg-card border-4 rounded-xl shadow-brutal overflow-hidden relative
                ${isApproved ? 'border-green-500' : isRejected ? 'border-red-500' : 'border-yellow-500'}
            `}>
                {/* Status Banner */}
                <div className={`p-6 text-center text-white
                    ${isApproved ? 'bg-green-500' : isRejected ? 'bg-red-500' : 'bg-yellow-500'}
                `}>
                    <div className="text-6xl mb-4 flex justify-center">
                        {isApproved && <FaCheckCircle />}
                        {isRejected && <FaTimesCircle />}
                        {isPending && <FaClock />}
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-wider">
                        {isApproved ? 'Valid Ticket' : isRejected ? 'Ticket Invalid' : 'Processing'}
                    </h1>
                    <p className="font-bold opacity-90 mt-1 uppercase text-sm tracking-widest">
                        Status: {ticket.status}
                    </p>
                </div>

                {/* Ticket Details */}
                <div className="p-8 space-y-6 bg-white dark:bg-zinc-900">
                    <div className="text-center pb-6 border-b-2 border-dashed border-border">
                        <h2 className="text-2xl font-bold mb-2">{ticket.eventName}</h2>
                        <Link href={`/events/${ticket.eventSlug}`} className="text-primary hover:underline text-sm font-bold">
                            View Event Details
                        </Link>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center text-primary">
                                <FaUser />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">Attendee</p>
                                <p className="font-bold text-lg">{ticket.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center text-primary">
                                <FaCalendarAlt />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">Date & Time</p>
                                <p className="font-bold">{new Date(ticket.startTime).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center text-primary">
                                <FaMapMarkerAlt />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">Location</p>
                                <p className="font-bold">
                                    {ticket.locationType === 'virtual' ? 'Virtual Event' : ticket.location}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t-2 border-dashed border-border text-center">
                        <p className="text-xs font-mono text-muted-foreground mb-1">Ticket ID</p>
                        <code className="bg-muted px-2 py-1 rounded font-bold text-sm select-all">
                            {ticket.ticketId}
                        </code>
                    </div>

                    {isApproved && (
                        <div className="pt-2">
                            <TicketActionsClient
                                eventName={ticket.eventName}
                                startTime={ticket.startTime}
                                description={ticket.description}
                                location={ticket.location}
                                locationType={ticket.locationType}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-muted/20 text-center border-t-2 border-border">
                    <p className="text-xs font-bold text-muted-foreground">Rnd Club • Verify at the entrance</p>
                </div>
            </div>
        </div>
    );
}
