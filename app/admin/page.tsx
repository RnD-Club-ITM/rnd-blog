"use client";

import { useState, useEffect } from "react";
import { client } from "@/lib/sanity/client";
import {
    approvePost,
    rejectPost,
    toggleQuestStatus,
    approveCollaboration,
    rejectCollaboration,
    approveEventRegistration,
    rejectEventRegistration,
    getAdminData
} from "../actions/admin";
import { Button } from "@/components/retroui/Button";
import { toast } from "sonner";
import Link from "next/link";
import { FaCheck, FaXmark, FaEye, FaScroll, FaHandshake, FaNewspaper, FaTicket, FaPaperclip, FaTrash } from "react-icons/fa6";
import * as Tabs from "@radix-ui/react-tabs";
import * as Dialog from "@radix-ui/react-dialog";

export interface EmailAttachment {
    filename: string;
    content: string; // Base64
    contentType: string;
}

export default function AdminPage() {
    const [password, setPassword] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState("");

    const [posts, setPosts] = useState<any[]>([]);
    const [quests, setQuests] = useState<any[]>([]);
    const [collaborations, setCollaborations] = useState<any[]>([]);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Email Modal State
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<any | null>(null);
    const [selectedAction, setSelectedAction] = useState<"approve" | "reject" | null>(null);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [emailAttachments, setEmailAttachments] = useState<EmailAttachment[]>([]);
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    // Check session storage on mount
    useEffect(() => {
        const storedAuth = sessionStorage.getItem("admin_auth");
        if (storedAuth === "true") {
            setIsAuthenticated(true);
            fetchAllData();
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "333444") {
            setIsAuthenticated(true);
            sessionStorage.setItem("admin_auth", "true");
            fetchAllData();
        } else {
            setError("Incorrect password");
        }
    };

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const result = await getAdminData();
            if (result.success && result.data) {
                setPosts(result.data.posts);
                setQuests(result.data.quests);
                setCollaborations(result.data.collaborations);
                setRegistrations(result.data.registrations);
            } else {
                toast.error(result.error || "Failed to fetch data");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Actions ---

    const handlePostAction = async (id: string, action: "approve" | "reject") => {
        const fn = action === "approve" ? approvePost : rejectPost;
        const promise = fn(id);
        toast.promise(promise, {
            loading: "Updating post...",
            success: () => {
                fetchAllData();
                return `Post ${action}d!`;
            },
            error: "Failed to update post",
        });
    };

    const handleQuestStatus = async (id: string, status: string) => {
        const promise = toggleQuestStatus(id, status);
        toast.promise(promise, {
            loading: "Updating quest...",
            success: () => {
                fetchAllData();
                return "Quest updated!";
            },
            error: "Failed to update quest",
        });
    };

    const handleCollabAction = async (id: string, action: "approve" | "reject") => {
        const fn = action === "approve" ? approveCollaboration : rejectCollaboration;
        const promise = fn(id);
        toast.promise(promise, {
            loading: "Updating collaboration...",
            success: () => {
                fetchAllData();
                return `Collaboration ${action}d!`;
            },
            error: "Failed to update collaboration",
        });
    };

    const openEmailModal = (reg: any, action: "approve" | "reject") => {
        setSelectedRegistration(reg);
        setSelectedAction(action);

        if (action === "approve") {
            setEmailSubject(`Ticket Approved: ${reg.eventName}`);
            setEmailBody(`
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h1>Your Ticket is Ready! 🎟️</h1>
    <p>Hi ${reg.name},</p>
    <p>Great news! Your registration for <strong>${reg.eventName}</strong> has been approved.</p>
    
    <div style="border: 2px solid #000; padding: 20px; margin: 20px 0; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="margin-top: 0;">${reg.eventName}</h2>
        <p><strong>Ticket ID:</strong> ${reg.ticketId || "Will be generated"}</p>
        <div style="margin-top: 20px; padding: 10px; background: #eee; text-align: center; font-family: monospace;">
            <img src="cid:ticket-qr-code" alt="Ticket QR Code" style="margin: 0 auto; display: block;" />
        </div>
    </div>

    <p>Please present this email or your Ticket ID at the event.</p>
    <br/>
    <p>See you there!</p>
    <p>Rnd Club Team</p>
</div>
            `.trim());
        } else {
            setEmailSubject(`Update on your registration: ${reg.eventName}`);
            setEmailBody(`
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Registration Update</h2>
    <p>Hi ${reg.name},</p>
    <p>Thank you for your interest in <strong>${reg.eventName}</strong>.</p>
    <p>Unfortunately, we are unable to approve your registration at this time. This could be due to capacity limits or specific eligibility criteria for this event.</p>
    <br/>
    <p>We hope to see you at our future events!</p>
    <p>Best regards,</p>
    <p>Rnd Club Team</p>
</div>
            `.trim());
        }

        setEmailAttachments([]);
        setEmailModalOpen(true);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && event.target.result) {
                    setEmailAttachments(prev => [...prev, {
                        filename: file.name,
                        contentType: file.type,
                        content: event.target!.result as string // This will be a data URL
                    }]);
                }
            };
            reader.readAsDataURL(file);
        });

        // Reset input so the same file can be selected again if removed
        e.target.value = '';
    };

    const removeAttachment = (indexToRemove: number) => {
        setEmailAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleEmailSubmit = async () => {
        if (!selectedRegistration || !selectedAction) return;

        setIsSendingEmail(true);
        const fn = selectedAction === "approve" ? approveEventRegistration : rejectEventRegistration;

        const payload = {
            registrationId: selectedRegistration._id,
            customSubject: emailSubject,
            customHtml: emailBody,
            attachments: emailAttachments
        };

        const toastId = toast.loading(selectedAction === "approve" ? "Approving & Sending Email..." : "Rejecting...");

        try {
            const result: any = await fn(payload);
            if (result.success) {
                fetchAllData();
                setEmailModalOpen(false);
                if (result.warning) {
                    toast.warning("Action Completed with Issue", {
                        description: result.warning,
                        id: toastId,
                        duration: 8000
                    });
                } else {
                    toast.success(`Registration ${selectedAction}d and email sent!`, { id: toastId });
                }
            } else {
                toast.error(result.error || "Failed to update registration", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred", { id: toastId });
        } finally {
            setIsSendingEmail(false);
        }
    };


    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-full max-w-md p-8 border-2 border-border bg-card rounded-lg shadow-brutal">
                    <h1 className="text-2xl font-black mb-6 text-center">Admin Access</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border-2 border-border rounded bg-muted/20 focus:outline-none focus:border-primary transition-colors"
                                placeholder="Enter admin password"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black">Admin Dashboard</h1>
                    <div className="flex gap-4">
                        <Button onClick={fetchAllData} variant="outline" disabled={isLoading}>
                            Refresh Data
                        </Button>
                        <Button
                            onClick={() => {
                                setIsAuthenticated(false);
                                sessionStorage.removeItem("admin_auth");
                            }}
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                <Tabs.Root defaultValue="registrations" className="flex flex-col gap-6">
                    <Tabs.List className="flex gap-2 border-b-2 border-border pb-px overflow-x-auto">
                        <Tabs.Trigger
                            value="registrations"
                            className="px-4 py-2 font-bold text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary -mb-[3px] transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <FaTicket /> Registrations ({registrations.length})
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="posts"
                            className="px-4 py-2 font-bold text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary -mb-[3px] transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <FaNewspaper /> Posts ({posts.length})
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="quests"
                            className="px-4 py-2 font-bold text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary -mb-[3px] transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <FaScroll /> Quests ({quests.length})
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="collabs"
                            className="px-4 py-2 font-bold text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary -mb-[3px] transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <FaHandshake /> Collaborations ({collaborations.length})
                        </Tabs.Trigger>
                    </Tabs.List>

                    {/* REGISTRATIONS TAB */}
                    <Tabs.Content value="registrations" className="bg-card border-2 border-border rounded-lg shadow-brutal overflow-hidden">
                        <div className="p-4 border-b-2 border-border bg-muted/20">
                            <h2 className="font-bold">All Event Registrations</h2>
                        </div>
                        {registrations.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No pending registrations.</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {registrations.map((reg) => (
                                    <div key={reg._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-muted/10 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{reg.name} </h3>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block
                                                    ${reg.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        reg.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {reg.status || 'pending'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground"> {reg.userEmail || `Clerk: ${reg.clerkId}`}</p>
                                            <p className="font-medium text-primary mt-1">{reg.eventName}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {reg.cohort} • Batch {reg.batch} • {reg.ticketId ? `Ticket: ${reg.ticketId} • ` : ''} {new Date(reg.registeredAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {reg.status !== 'approved' && (
                                                <Button size="sm" className="bg-green-500 text-white border-green-700 hover:bg-green-600" onClick={() => openEmailModal(reg, "approve")}>
                                                    <FaCheck /> {reg.status === 'rejected' ? 'Re-Approve' : 'Approve'}
                                                </Button>
                                            )}
                                            {reg.status !== 'rejected' && (
                                                <Button size="sm" className="bg-red-500 text-white border-red-700 hover:bg-red-600" onClick={() => openEmailModal(reg, "reject")}>
                                                    <FaXmark /> {reg.status === 'approved' ? 'Revoke' : 'Reject'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Tabs.Content>

                    {/* POSTS TAB */}
                    <Tabs.Content value="posts" className="bg-card border-2 border-border rounded-lg shadow-brutal overflow-hidden">
                        <div className="p-4 border-b-2 border-border bg-muted/20">
                            <h2 className="font-bold">Pending Review</h2>
                        </div>
                        {posts.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No pending posts.</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {posts.map((post) => (
                                    <div key={post._id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                                        <div>
                                            <h3 className="font-bold">{post.title}</h3>
                                            <p className="text-xs text-muted-foreground">by {post.author?.name} • {new Date(post._createdAt).toLocaleDateString()}</p>
                                            <span className="text-[10px] uppercase font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                {post.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/post/${post.slug?.current}`}
                                                target="_blank"
                                                className="p-2 hover:bg-muted rounded-md border border-transparent hover:border-border transition-all"
                                            >
                                                <FaEye />
                                            </Link>
                                            <Button size="sm" className="bg-green-500 text-white border-green-700 hover:bg-green-600" onClick={() => handlePostAction(post._id, "approve")}>
                                                <FaCheck /> Approve
                                            </Button>
                                            <Button size="sm" className="bg-red-500 text-white border-red-700 hover:bg-red-600" onClick={() => handlePostAction(post._id, "reject")}>
                                                <FaXmark /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Tabs.Content>

                    {/* QUESTS TAB */}
                    <Tabs.Content value="quests" className="bg-card border-2 border-border rounded-lg shadow-brutal overflow-hidden">
                        <div className="p-4 border-b-2 border-border bg-muted/20">
                            <h2 className="font-bold">Manage Quests</h2>
                        </div>
                        {quests.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No quests found.</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {quests.map((quest) => (
                                    <div key={quest._id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                                        <div>
                                            <h3 className="font-bold">{quest.title}</h3>
                                            <p className="text-xs text-muted-foreground">Proposed by {quest.proposedBy?.name} • {new Date(quest._createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <select
                                                value={quest.status}
                                                onChange={(e) => handleQuestStatus(quest._id, e.target.value)}
                                                className="p-1 border-2 border-border rounded bg-muted/20 text-xs font-bold"
                                            >
                                                <option value="open">Open</option>
                                                <option value="active">Active</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            <Link
                                                href={`/quests/${quest.slug?.current}`}
                                                target="_blank"
                                                className="p-2 hover:bg-muted rounded-md border border-transparent hover:border-border transition-all"
                                            >
                                                <FaEye />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Tabs.Content>

                    {/* COLLABORATIONS TAB */}
                    <Tabs.Content value="collabs" className="bg-card border-2 border-border rounded-lg shadow-brutal overflow-hidden">
                        <div className="p-4 border-b-2 border-border bg-muted/20">
                            <h2 className="font-bold">Pending Collaborations</h2>
                        </div>
                        {collaborations.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No active collaborations.</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {collaborations.map((collab) => (
                                    <div key={collab._id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                                        <div>
                                            <h3 className="font-bold">{collab.projectName}</h3>
                                            <p className="text-xs text-muted-foreground">Posted by {collab.postedBy?.name} • {new Date(collab._createdAt).toLocaleDateString()}</p>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-1 inline-block
                        ${collab.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {collab.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            {collab.status !== "open" && (
                                                <Button size="sm" className="bg-green-500 text-white border-green-700 hover:bg-green-600" onClick={() => handleCollabAction(collab._id, "approve")}>
                                                    <FaCheck /> Open
                                                </Button>
                                            )}
                                            <Button size="sm" className="bg-red-500 text-white border-red-700 hover:bg-red-600" onClick={() => handleCollabAction(collab._id, "reject")}>
                                                <FaXmark /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Tabs.Content>

                </Tabs.Root>
            </div>

            {/* Email Modal Dialog */}
            <Dialog.Root open={emailModalOpen} onOpenChange={setEmailModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 animate-in fade-in" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border-4 border-black bg-background p-6 shadow-brutal sm:rounded-xl">
                        <Dialog.Title className="text-2xl font-black mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-border pb-4">
                            <span>
                                {selectedAction === 'approve' ? 'Approve Registration' : 'Reject Registration'}
                            </span>
                            <span className="text-sm font-bold bg-muted px-3 py-1 rounded-full border-2 border-border">
                                {selectedRegistration?.name}
                            </span>
                        </Dialog.Title>

                        <div className="space-y-4 py-2 mt-2">
                            <p className="text-sm text-muted-foreground font-bold italic">
                                Customize the email that will be sent to the attendee.
                            </p>

                            <div className="space-y-2">
                                <label className="text-sm font-bold">Email Subject</label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="w-full p-2 border-2 border-border rounded-lg bg-background focus:border-primary outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold">Email HTML Body</label>
                                <textarea
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    rows={10}
                                    className="w-full p-2 border-2 border-border rounded-lg bg-background focus:border-primary outline-none font-mono text-xs md:text-sm resize-y"
                                />
                            </div>

                            <div className="space-y-2 p-4 bg-muted/20 border-2 border-border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold flex items-center gap-2">
                                        <FaPaperclip /> Attachments
                                    </label>
                                    <label className="cursor-pointer bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-bold border border-black hover:opacity-90">
                                        Choose File
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {emailAttachments.length > 0 ? (
                                    <ul className="space-y-2 max-h-32 overflow-y-auto">
                                        {emailAttachments.map((att, i) => (
                                            <li key={i} className="flex items-center justify-between bg-background p-2 border rounded text-xs">
                                                <span className="truncate max-w-[80%] font-mono">{att.filename}</span>
                                                <button
                                                    onClick={() => removeAttachment(i)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">No custom attachments added.</p>
                                )}

                                {selectedAction === 'approve' && (
                                    <p className="text-xs text-green-600 font-bold mt-2">
                                        * The Ticket QR Code will be automatically attached and embedded.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t-2 border-border">
                            <Button
                                variant="outline"
                                onClick={() => setEmailModalOpen(false)}
                                disabled={isSendingEmail}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleEmailSubmit}
                                disabled={isSendingEmail || !emailSubject || !emailBody}
                                className={selectedAction === 'approve' ? 'bg-green-500 hover:bg-green-600 text-white border-green-700' : 'bg-red-500 hover:bg-red-600 text-white border-red-700'}
                            >
                                {isSendingEmail ? 'Sending...' : `Confirm ${selectedAction === 'approve' ? 'Approval' : 'Rejection'}`}
                            </Button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
