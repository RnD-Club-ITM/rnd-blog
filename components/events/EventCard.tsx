import Link from 'next/link'
import { Calendar, MapPin, ExternalLink, Clock, User } from 'lucide-react'
import { Button } from '@/components/retroui/Button'
import { getImageUrl } from '@/lib/sanity/client'

import { RegisterButton } from './RegisterButton'

interface EventProps {
    event: {
        _id: string
        title: string
        slug: { current: string }
        description: string
        eventType: string
        locationType: string
        location?: string
        startTime: string
        endTime?: string
        registrationLink?: string
        image?: any
        organizer?: {
            name: string
            avatar?: any
        }
    }
}

export function EventCard({ event }: EventProps) {
    const startDate = new Date(event.startTime)
    const endDate = event.endTime ? new Date(event.endTime) : new Date(startDate.getTime() + 60 * 60 * 1000) // Default 1 hour

    const formatGoogleCalendarDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, "")
    }

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatGoogleCalendarDate(startDate)}/${formatGoogleCalendarDate(endDate)}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.location || "")}`

    return (
        <div className="bg-card text-card-foreground border-2 border-border shadow-brutal hover:shadow-brutal-sm transition-all rounded-xl overflow-hidden flex flex-col h-full group">
            {/* Image Section */}
            <div className="h-96 bg-black relative overflow-hidden border-b-2 border-border flex items-center justify-center">
                {event.image ? (
                    <img
                        src={getImageUrl(event.image) || ""}
                        alt={event.title}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                        <Calendar className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-background border-2 border-black px-3 py-1 font-bold text-sm shadow-[2px_2px_0_0_rgba(0,0,0,1)] uppercase tracking-wider">
                    {event.eventType}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-medium">
                    <Clock className="h-4 w-4" />
                    {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>

                <h3 className="font-head text-2xl font-bold mb-3 line-clamp-2 min-h-[4rem]">
                    {event.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{event.locationType === 'virtual' ? 'Virtual Event' : event.location || 'TBA'}</span>
                </div>

                {event.organizer && (
                    <div className="flex items-center gap-2 mb-6">
                        <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden border border-black">
                            {getImageUrl(event.organizer.avatar) ? (
                                <img src={getImageUrl(event.organizer.avatar) || ""} alt={event.organizer.name} className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-4 w-4 m-1 text-gray-500" />
                            )}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">By {event.organizer.name}</span>
                    </div>
                )}


                <div className="mt-auto flex gap-3 flex-wrap">
                    <div className="flex-1">
                        {event.registrationLink ? (
                            <Link href={event.registrationLink} target="_blank" className="block w-full">
                                <Button className="w-full bg-primary text-primary-foreground border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all font-bold">
                                    Register Now (External)
                                </Button>
                            </Link>
                        ) : (
                            <RegisterButton
                                eventSlug={event.slug.current}
                                isPast={new Date(event.startTime) < new Date()}
                            />
                        )}
                    </div>

                    <Link href={googleCalendarUrl} target="_blank">
                        <Button variant="outline" className="px-3 border-2 border-foreground bg-card hover:bg-muted shadow-brutal transition-all" title="Add to Google Calendar">
                            <Calendar className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
