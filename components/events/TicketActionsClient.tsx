'use client';

import { Button } from "@/components/retroui/Button";
import { FaCalendarPlus, FaGoogle } from "react-icons/fa";

interface TicketActionsProps {
    eventName: string;
    startTime: string;
    description?: string;
    location?: string;
    locationType?: string;
}

export function TicketActionsClient({ eventName, startTime, description, location, locationType }: TicketActionsProps) {

    const eventDate = new Date(startTime);
    const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000); // Assume 1 hr default

    const generateIcsFile = () => {
        const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

        const locString = locationType === 'virtual' ? 'Virtual Event' : location || 'TBA';
        const descString = description || `Ticket for ${eventName}`;

        // Simple ICS formatting
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Rnd Club//Digital Ticket//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${eventName}
DTSTART:${formatDate(eventDate)}
DTEND:${formatDate(endDate)}
LOCATION:${locString}
DESCRIPTION:${descString.replace(/\n/g, '\\n')}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `${eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_ticket.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getGoogleCalendarLink = () => {
        const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        const locString = locationType === 'virtual' ? 'Virtual Event' : location || '';
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventName)}&dates=${formatDate(eventDate)}/${formatDate(endDate)}&details=${encodeURIComponent(description || "")}&location=${encodeURIComponent(locString)}`;
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            <Button
                onClick={generateIcsFile}
                className="w-full bg-foreground text-background hover:opacity-95 font-bold border-2 border-foreground flex items-center justify-center gap-2 py-6 text-lg"
            >
                <FaCalendarPlus /> Add to Apple Wallet / Calendar
            </Button>

            <a href={getGoogleCalendarLink()} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button
                    variant="outline"
                    className="w-full bg-card text-foreground hover:bg-muted font-bold border-2 border-border flex items-center justify-center gap-2 py-4"
                >
                    <FaGoogle /> Add to Google Calendar
                </Button>
            </a>
        </div>
    );
}
