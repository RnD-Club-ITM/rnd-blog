"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { toast } from "sonner";
import { Link2 } from "lucide-react";
import {
  Code,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  FileText,
  Eye,
  EyeOff,
  LayoutTemplate,
  Bot,
  BarChart,
  Plus,
  Trash,
  Table as TableIcon,
  Workflow,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  FileCheck2,
  Video,
  PenLine,
  AlertTriangle,
  Trophy
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const TAGS = ["ai-ml", "iot", "web3", "security", "devops", "mobile", "cloud"];

interface PostFormProps {
  userId: string;
  initialData?: {
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
    coverImageUrl?: string;
    videoTitle?: string;
    attachResearchPaper?: boolean;
  };
  postId?: string; // If present, it's an edit
}

export function PostForm({ userId, initialData, postId }: PostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true); // Default to true
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [signature, setSignature] = useState("");

  const isEditing = !!postId;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [authorDetails, setAuthorDetails] = useState("First Author*1\nDepartment, University/Institute, City, State, Country\nexample@ijsset.com");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    tags: initialData?.tags || [],
    coverImageUrl: initialData?.coverImageUrl || "",
    videoThumbnail: "", // New field for Cloudinary CDN URL
    videoTitle: initialData?.videoTitle || "",
    attachResearchPaper: initialData?.attachResearchPaper || false,
  });

  type SectionType = 'introduction' | 'methods' | 'results' | 'conclusion';
  const [activeTab, setActiveTab] = useState<SectionType>('introduction');
  const [sections, setSections] = useState({
    introduction: initialData?.content || "",
    methods: "",
    results: "",
    conclusion: "",
  });

  useEffect(() => {
    if (isEditing && !sections.methods && !sections.results && !sections.conclusion) {
      // Avoid overwriting a unified edit string if they are just loading
      return; 
    }
    const combinedContent = `# I. INTRODUCTION\n\n${sections.introduction}\n\n# II. METHODS AND MATERIAL\n\n${sections.methods}\n\n# III. RESULTS AND DISCUSSION\n\n${sections.results}\n\n# IV. CONCLUSION\n\n${sections.conclusion}`;
    setFormData((prev) => ({ ...prev, content: combinedContent }));
  }, [sections]);

  // Initialize char counts based on initialData
  const [charCounts, setCharCounts] = useState({
    title: initialData?.title?.length || 0,
    excerpt: initialData?.excerpt?.length || 0,
    content: initialData?.content?.length || 0,
  });

  const handleChange = async (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field in charCounts) {
      setCharCounts((prev) => ({ ...prev, [field]: value.length }));
    }

    // Auto-Sync Drive to CDN
    if (field === 'videoThumbnail' && value.includes('drive.google.com') && !value.includes('cloudinary.com')) {
       setIsUploadingVideoThumbnail(true);
       const toastId = toast.loading("Syncing Drive video to CDN Cache...");
       try {
          const res = await fetch(`/api/upload?url=${encodeURIComponent(value)}`, { method: 'POST' });
          if (!res.ok) throw new Error("Sync failed. Check Drive sharing settings.");
          const data = await res.json();
          if (data.secure_url) {
             setFormData(prev => ({ ...prev, videoThumbnail: data.secure_url }));
             toast.success("Drive video linked to CDN successfully!", { id: toastId });
          }
       } catch (err: any) {
          toast.error(err.message, { id: toastId });
       } finally {
          setIsUploadingVideoThumbnail(false);
       }
    }
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
  
  // Peer Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStepsCompleted, setReviewStepsCompleted] = useState<number>(0);
  const [reviewRecommendations, setReviewRecommendations] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const REVIEW_STEPS = [
    "Scanning Abstract & Keywords...",
    "Validating IEEE Structures...",
    "Checking Logic and Rigorous Academic Tone...",
    "Verifying Component Metrics & Output Flow...",
    "Synthesizing Peer Review Report..."
  ];

  const handleReviewPaper = async () => {
    if (formData.content.length < 500) {
      toast.error("Please add more content to the paper before submitting for peer review.");
      return;
    }
    setIsReviewModalOpen(true);
    setIsReviewing(true);
    setReviewStepsCompleted(0);
    setReviewRecommendations(null);

    // Simulate ticking animation (fires every ~800ms)
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= 5) {
        setReviewStepsCompleted(currentStep);
      }
    }, 800);

    try {
      const res = await fetch("/api/ai/review-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formData.title, content: formData.content }),
      });

      if (!res.ok) throw new Error("Peer Review Engine failed to respond.");
      const data = await res.json();
      
      clearInterval(interval);
      setReviewStepsCompleted(5); // Ensure fully checked visually
      setReviewRecommendations(data.recommendations);
      toast.success("Peer Review finalized!");
    } catch (e: any) {
      clearInterval(interval);
      toast.error(e.message);
      setIsReviewModalOpen(false);
    } finally {
      setIsReviewing(false);
    }
  };

  
  // Graph GUI State
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [graphType, setGraphType] = useState("Bar Chart");
  const [graphTitle, setGraphTitle] = useState("Research Findings");
  const [xAxisLabel, setXAxisLabel] = useState("Models");
  const [yAxisLabel, setYAxisLabel] = useState("Accuracy");
  const [graphData, setGraphData] = useState<{label: string, value: string}[]>([
      {label: "Model A", value: "85"},
      {label: "Model B", value: "92"},
      {label: "Model C", value: "88"}
  ]);
  const [generatedGraphSvg, setGeneratedGraphSvg] = useState<string>("");

  useEffect(() => {
    if (!isGraphModalOpen) return;
    const w = 800; const h = 500; const p = 80;
    const cw = w - p * 2; const ch = h - p * 2.5;
    const parseV = (v: string) => parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0;
    const safeData = graphData.filter(d => d.label && !isNaN(parseV(d.value)));
    const maxV = Math.max(...safeData.map(d => parseV(d.value)), 1);

        let svg = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="background-color: white; border-radius: 8px;">\n<rect width="100%" height="100%" fill="#ffffff" />\n${graphTitle ? `<text x="${w/2}" y="35" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-weight="800" font-size="22" fill="#1e293b">${graphTitle.toUpperCase()}</text>` : ""}\n`;
    
    const colors = ["hsl(217, 91%, 60%)", "hsl(142, 71%, 45%)", "hsl(32, 95%, 44%)", "hsl(262, 83%, 58%)", "hsl(350, 89%, 60%)", "hsl(199, 89%, 48%)"];

    if (graphType === "Pie Chart" && safeData.length > 0) {
        const cx = w/2.8; const cy = h/2 + 20; const r = 130;
        const total = safeData.reduce((acc, d) => acc + parseV(d.value), 0) || 1;
        let startAngle = 0;
        safeData.forEach((d, i) => {
            const val = parseV(d.value);
            const sliceAngle = (val / total) * 360;
            const endAngle = startAngle + sliceAngle;
            const x1 = cx + r * Math.cos(Math.PI * (startAngle-90) / 180);
            const y1 = cy + r * Math.sin(Math.PI * (startAngle-90) / 180);
            const x2 = cx + r * Math.cos(Math.PI * (endAngle-90) / 180);
            const y2 = cy + r * Math.sin(Math.PI * (endAngle-90) / 180);
            const largeArc = sliceAngle > 180 ? 1 : 0;
            svg += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${colors[i % colors.length]}" stroke="white" stroke-width="2" />\n`;
            const ly = h/2 - (safeData.length * 15) + (i * 30) + 40;
            svg += `<rect x="${w - 220}" y="${ly}" width="15" height="15" fill="${colors[i % colors.length]}" rx="3" />\n<text x="${w - 195}" y="${ly + 12}" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#475569">${d.label} (${Math.round(val/total*100)}%)</text>\n`;
            startAngle += sliceAngle;
        });
    } else {
        svg += `<line x1="${p}" y1="${p + 20}" x2="${p}" y2="${h - p * 1.5}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4" />\n<text x="30" y="${(h - p * 1.5)/2 + p/2}" transform="rotate(-90, 30, ${(h - p * 1.5)/2 + p/2})" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="12" fill="#64728b" letter-spacing="1">{ ${yAxisLabel.toUpperCase()} }</text>\n<line x1="${p}" y1="${h - p * 1.5}" x2="${w - p}" y2="${h - p * 1.5}" stroke="#1e293b" stroke-width="2" />\n<text x="${w/2}" y="${h - 15}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="12" fill="#64728b" letter-spacing="1">{ ${xAxisLabel.toUpperCase()} }</text>\n`;
        const rotationVal = safeData.length > 3 ? 45 : 0;
        if (graphType === "Bar Chart") {
            const bw = (cw / safeData.length) * 0.6;
            safeData.forEach((d, i) => {
                const val = parseV(d.value);
                const bh = (val / maxV) * ch;
                const x = p + (i * (cw / safeData.length)) + ((cw / safeData.length) * 0.2);
                const y = h - p * 1.5 - bh;
                svg += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${colors[i % colors.length]}" rx="4" />\n<text x="${x + bw/2}" y="${h - p * 1.5 + 20}" ${rotationVal ? `transform="rotate(${rotationVal}, ${x+bw/2}, ${h-p*1.5+20})"` : ""} text-anchor="${rotationVal ? 'start' : 'middle'}" font-family="Inter, sans-serif" font-weight="600" font-size="11" fill="#1e293b">${d.label}</text>\n<text x="${x + bw/2}" y="${y - 10}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="12" fill="#1e293b">${d.value}</text>\n`;
            });
        } else if (graphType === "Line Chart") {
            const space = cw / Math.max(safeData.length - 1, 1);
            const pts = safeData.map((d, i) => `${p + (i * space)},${h - p - ((parseV(d.value) / maxV) * ch)}`).join(" ");
            svg += `<polyline points="${pts}" fill="none" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" />\n`;
            safeData.forEach((d, i) => {
                const val = parseV(d.value); const cx = p + (i * space); const cy = h - p * 1.5 - ((val / maxV) * ch);
                svg += `<circle cx="${cx}" cy="${cy}" r="6" fill="white" stroke="#3b82f6" stroke-width="3" />\n<text x="${cx}" y="${h - p * 1.5 + 20}" ${rotationVal ? `transform="rotate(${rotationVal}, ${cx}, ${h-p*1.5+20})"` : ""} text-anchor="${rotationVal ? 'start' : 'middle'}" font-family="Inter, sans-serif" font-weight="600" font-size="11" fill="#1e293b">${d.label}</text>\n<text x="${cx}" y="${cy - 15}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="12" fill="#1e293b">${d.value}</text>\n`;
            });
        }
    }
    svg += `</svg>`;
    setGeneratedGraphSvg(svg);
  }, [graphData, graphType, graphTitle, xAxisLabel, yAxisLabel, isGraphModalOpen]);

  // Flowchart GUI State
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [flowTitle, setFlowTitle] = useState("System Architecture");
  const [flowDirection, setFlowDirection] = useState("horizontal");
  const [flowSteps, setFlowSteps] = useState([{ label: "Data Prep", desc: "Clean Logs" }, { label: "Train", desc: "Neural Net" }]);
  const [generatedFlowSvg, setGeneratedFlowSvg] = useState("");

  // Table GUI State
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableTitle, setTableTitle] = useState("Experimental Results");
  const [tableData, setTableData] = useState<string[][]>([
    ["Model", "Accuracy", "F1"],
    ["SVM", "88%", "0.86"],
    ["Random Forest", "92%", "0.91"]
  ]);

  // Caption Helper Logic
  const sectionNumMap: Record<string, number> = {
    introduction: 1,
    methods: 2,
    results: 3,
    conclusion: 4
  };

  const getNextItemNumber = (type: 'Fig' | 'Table', targetSection: string) => {
    const text = sections[targetSection as keyof typeof sections] || "";
    const prefix = type === 'Fig' ? 'Fig' : 'Table';
    const regex = new RegExp(`\\*\\*${prefix} \\d+\\.\\d+`, 'g');
    const matches = text.match(regex);
    return (matches?.length || 0) + 1;
  };

  useEffect(() => {
     if (!isFlowModalOpen) return;
     const p = 40; const bw = 160; const bh = 80; const gap = 60;
     let svg = "";
     if (flowDirection === "horizontal") {
         const w = p * 2 + flowSteps.length * bw + Math.max(flowSteps.length - 1, 0) * gap;
         const h = p * 2 + bh;
         svg = `<svg viewBox="0 0 ${Math.max(w, 100)} ${Math.max(h, 100)}" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="background-color: white;">\n<rect width="100%" height="100%" fill="white" />\n<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#000" /></marker></defs>\n`;
         
         flowSteps.forEach((step, i) => {
             const x = p + i * (bw + gap);
             const y = p;
             svg += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="#f8fafc" stroke="#3b82f6" stroke-width="3" rx="8" />\n<text x="${x + bw/2}" y="${y + bh/2 - 5}" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a">${step.label}</text>\n${step.desc ? `<text x="${x + bw/2}" y="${y + bh/2 + 15}" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">${step.desc}</text>\n` : ""}`;
             if (i < flowSteps.length - 1) {
                 svg += `<line x1="${x + bw}" y1="${y + bh/2}" x2="${x + bw + gap - 4}" y2="${y + bh/2}" stroke="#000" stroke-width="2" marker-end="url(#arrow)" />\n`;
             }
         });
         svg += `</svg>`;
     } else {
         const w = p * 2 + bw;
         const h = p * 2 + flowSteps.length * bh + Math.max(flowSteps.length - 1, 0) * gap;
         svg = `<svg viewBox="0 0 ${Math.max(w, 100)} ${Math.max(h, 100)}" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="background-color: white;">\n<rect width="100%" height="100%" fill="white" />\n<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#000" /></marker></defs>\n`;
         
         flowSteps.forEach((step, i) => {
             const x = p;
             const y = p + i * (bh + gap);
             svg += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="#f8fafc" stroke="#3b82f6" stroke-width="3" rx="8" />\n<text x="${x + bw/2}" y="${y + bh/2 - 5}" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a">${step.label}</text>\n${step.desc ? `<text x="${x + bw/2}" y="${y + bh/2 + 15}" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">${step.desc}</text>\n` : ""}`;
             if (i < flowSteps.length - 1) {
                 svg += `<line x1="${x + bw/2}" y1="${y + bh}" x2="${x + bw/2}" y2="${y + bh + gap - 4}" stroke="#000" stroke-width="2" marker-end="url(#arrow)" />\n`;
             }
         });
         svg += `</svg>`;
     }
     setGeneratedFlowSvg(svg);
  }, [flowSteps, flowDirection, isFlowModalOpen]);

  const [isWritingPaper, setIsWritingPaper] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isConvertingPdf, setIsConvertingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const videoThumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoCaptureRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isUploadingVideoThumbnail, setIsUploadingVideoThumbnail] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCaptureThumbnail = async () => {
    if (!videoCaptureRef.current) return;

    try {
      setIsCapturing(true);
      const video = videoCaptureRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Failed to create blob"));
        }, "image/jpeg", 0.9);
      });

      const toastId = toast.loading("Capturing and uploading frame...");

      // Upload blob to Cloudinary
      const res = await fetch(`/api/upload?type=image`, {
        method: "POST",
        headers: {
          "Content-Type": "image/jpeg",
        },
        body: blob,
      });

      if (!res.ok) throw new Error("Failed to upload captured frame");

      const data = await res.json();
      if (data.secure_url) {
        handleChange("coverImageUrl", data.secure_url);
        toast.success("Frame captured and set as thumbnail!", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to capture frame. Ensure video is loaded.");
    } finally {
      setIsCapturing(false);
    }
  };

  // Helper to insert text at cursor position
  const insertTextAtCursor = (textToInsert: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = sections[activeTab];
    const before = currentText.substring(0, start);
    const after = currentText.substring(end, currentText.length);

    const newContent = before + textToInsert + after;

    setSections((prev) => ({ ...prev, [activeTab]: newContent }));

    // Restore cursor position after the inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = start + textToInsert.length;
        textareaRef.current.selectionEnd = start + textToInsert.length;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    const toastId = toast.loading("Uploading cover image...");

    try {
      const res = await fetch(`/api/upload?type=image`, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      if (data.secure_url) {
        handleChange("coverImageUrl", data.secure_url);
        toast.success("Cover image uploaded!", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to upload cover image", { id: toastId });
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading media...");

    try {
      // Determine type for Cloudinary
      const isVideo =
        file.type.startsWith("video/") ||
        file.name.toLowerCase().endsWith(".mov") ||
        file.name.toLowerCase().endsWith(".mp4") ||
        file.name.toLowerCase().endsWith(".avi");

      const type = isVideo ? "video" : "image";

      const res = await fetch(`/api/upload?type=${type}`, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();

      if (data.secure_url) {
        const isImage = data.resource_type === "image";
        const mediaMarkdown = isImage
          ? `\n![Image](${data.secure_url})\n`
          : `\n![Video](${data.secure_url})\n`;

        insertTextAtCursor(mediaMarkdown);
        toast.success("Media added!", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload media", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleVideoThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideoThumbnail(true);
    const toastId = toast.loading("Uploading and converting video thumbnail...");

    try {
      const res = await fetch(`/api/upload?type=video`, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.details || err.error || "Video upload failed");
      }

      const data = await res.json();
      if (data.secure_url) {
        handleChange("videoThumbnail", data.secure_url);
        toast.success("Video thumbnail converted to CDN link!", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload video thumbnail", { id: toastId });
    } finally {
      setIsUploadingVideoThumbnail(false);
      if (videoThumbnailInputRef.current) videoThumbnailInputRef.current.value = "";
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setIsConvertingPdf(true);
    const toastId = toast.loading("Reading PDF...");

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64String = (reader.result as string).split(",")[1];
          resolve(base64String);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const pdfBase64 = await base64Promise;

      toast.loading("Converting to post format (AI)...", { id: toastId });

      const convertRes = await fetch("/api/ai/pdf-convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfBase64,
          fileName: file.name,
        }),
      });

      if (!convertRes.ok) {
        const err = await convertRes.json().catch(() => ({}));
        throw new Error(err.error || "AI conversion failed");
      }

      const postData = await convertRes.json();

      setFormData({
        ...formData,
        title: postData.title || formData.title,
        excerpt: postData.excerpt || formData.excerpt,
        content: postData.content || formData.content,
        tags: postData.tags || formData.tags,
      });

      setCharCounts({
        title: postData.title?.length || 0,
        excerpt: postData.excerpt?.length || 0,
        content: postData.content?.length || 0,
      });

      toast.success("PDF successfully converted to post!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to process PDF", { id: toastId });
    } finally {
      setIsConvertingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || formData.title.length < 10) {
      toast.error("Title must be at least 10 characters");
      return;
    }

    if (!formData.content || formData.content.length < 200) {
      toast.error(
        `Content must be at least 200 characters. Current: ${formData.content.length}`,
      );
      return;
    }

    setIsTermsOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (!signature || signature.trim().length < 3) {
      toast.error("Please sign your name to agree.");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/posts/${postId}` : "/api/posts";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          authorDetails,
          userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          isEditing
            ? "Post updated successfully!"
            : "Post created successfully!",
        );
        setIsTermsOpen(false);

        setTimeout(() => {
          if (isEditing) {
            router.push(`/post/${data.post?.slug?.current || "explore"}`);
            router.refresh();
          } else {
            router.push(`/post/${data.slug}`);
          }
        }, 1000);
      } else {
        const errorData = await response.json();
        toast.error(
          `Failed to ${isEditing ? "update" : "create"} post: ${errorData.error || "Unknown error"}`,
        );
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleInsertGraph = () => {
      if (!generatedGraphSvg) return;
      const targetSection = 'results';
      const sectionNum = sectionNumMap[targetSection];
      const itemNum = getNextItemNumber('Fig', targetSection);
      const label = `Fig ${sectionNum}.${itemNum} ${graphTitle || 'Graph View'}`;
      
      const svgGraph = `\n\n\`\`\`svg\n${generatedGraphSvg}\n\`\`\`\n\n**${label}**\n\n`;
      
      if (activeTab !== targetSection) setActiveTab(targetSection as SectionType);
      setSections((prev) => ({ ...prev, [targetSection]: prev[targetSection as keyof typeof sections] + svgGraph }));
      toast.success("Graph added successfully!");
      setIsGraphModalOpen(false);
  };

  const handleInsertFlow = () => {
      if (!generatedFlowSvg) return;
      const targetSection = 'methods';
      const sectionNum = sectionNumMap[targetSection];
      const itemNum = getNextItemNumber('Fig', targetSection);
      const label = `Fig ${sectionNum}.${itemNum} ${flowTitle || 'System Architecture'}`;

      const svgCode = `\n\n\`\`\`svg\n${generatedFlowSvg}\n\`\`\`\n\n**${label}**\n\n`;
      
      if (activeTab !== targetSection) setActiveTab(targetSection as SectionType); 
      setSections((prev) => ({ ...prev, [targetSection]: prev[targetSection as keyof typeof sections] + svgCode }));
      toast.success("Flowchart added successfully!");
      setIsFlowModalOpen(false);
  };

  const insertMarkdownTable = () => {
    if (tableData.length === 0 || tableData[0].length === 0) return;
    const targetSection = 'results';
    const sectionNum = sectionNumMap[targetSection];
    const itemNum = getNextItemNumber('Table', targetSection);
    const label = `Table ${sectionNum}.${itemNum} ${tableTitle || 'Experimental Data'}`;

    let md = `\n\n**${label}**\n\n`; // Table caption ABOVE
    md += "| " + tableData[0].join(" | ") + " |\n"; // Header
    md += "| " + tableData[0].map(() => "---").join(" | ") + " |\n"; // Separator
    for (let i = 1; i < tableData.length; i++) {
        md += "| " + tableData[i].join(" | ") + " |\n"; // Body
    }
    md += "\n";
    
    if (activeTab !== targetSection) setActiveTab(targetSection as SectionType);
    setSections((prev) => ({ ...prev, [targetSection]: prev[targetSection as keyof typeof sections] + md }));
    setIsTableModalOpen(false);
  };

  return (
    <>
      <form onSubmit={handleInitialSubmit} className="max-w-7xl mx-auto">
        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT COLUMN: Editor */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="bg-card border-brutal p-6 space-y-6 rounded-lg relative overflow-hidden">
              <div className="border-b border-border pb-4 mb-4 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="font-head text-xl font-bold">
                    Research Details
                  </h3>
                  <div className="flex flex-wrap gap-2">
                     <Button 
                       type="button" 
                       onClick={async () => {
                          if (!formData.title) {
                              toast.error("Please enter a paper title first to guide the AI.");
                              return;
                          }
                          setIsWritingPaper(true);
                          const toastId = toast.loading("AI is researching and writing the paper...");
                          try {
                            const res = await fetch("/api/ai/write-paper", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ topic: formData.title, existingContent: sections.introduction }),
                            });
                            if (!res.ok) {
                               const errorData = await res.json().catch(() => ({}));
                               throw new Error(errorData.error || "Paper writing failed");
                            }
                            const data = await res.json();
                            handleChange("excerpt", data.abstract || "");
                            if (data.keywords && typeof data.keywords === 'string') {
                               const kw = data.keywords.split(",").map((k: string) => k.trim());
                               setFormData(prev => ({ ...prev, tags: kw }));
                            }
                            setSections({
                               introduction: data.introduction || "",
                               methods: data.methods || "",
                               results: data.results || "",
                               conclusion: data.conclusion || ""
                            });
                            toast.success("Paper auto-written successfully!", { id: toastId });
                          } catch (error: any) {
                            toast.error(error.message, { id: toastId });
                          } finally {
                            setIsWritingPaper(false);
                          }
                       }}
                       disabled={isWritingPaper}
                       className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-brutal-sm flex items-center gap-2 text-xs"
                     >
                       {isWritingPaper ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                       Auto-Generate Paper
                     </Button>
                     <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleReviewPaper}
                        className="border-brutal flex items-center gap-2 text-xs bg-card hover:bg-muted border-foreground text-foreground shadow-brutal-sm"
                     >
                       <ClipboardCheck className="w-4 h-4 text-primary" />
                       Review
                     </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-md border border-dashed border-border/50">
                    <input
                      type="checkbox"
                      id="attachResearchPaper"
                      checked={formData.attachResearchPaper}
                      onChange={(e) => setFormData(prev => ({ ...prev, attachResearchPaper: e.target.checked }))}
                      className="w-5 h-5 rounded border-brutal text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="attachResearchPaper" className="text-sm font-bold text-foreground cursor-pointer select-none">
                      Attach Research Paper Content
                    </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-semibold mb-2 text-sm uppercase tracking-wide">
                  Paper Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="E.g., An Approach to Neural Networks"
                  maxLength={100}
                  required
                  className="w-full text-lg font-bold"
                />
              </div>

              {/* Author Details */}
              <div>
                <label className="block font-semibold mb-2 text-sm uppercase tracking-wide">
                  Author Details
                </label>
                <textarea
                  value={authorDetails}
                  onChange={(e) => setAuthorDetails(e.target.value)}
                  placeholder="First Author*1\nDepartment, University...\nemail@example.com"
                  rows={3}
                  className="w-full border-brutal p-3 focus:ring-primary font-body text-sm resize-y bg-background text-foreground"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block font-semibold mb-2 text-sm uppercase tracking-wide">
                  Abstract
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleChange("excerpt", e.target.value)}
                  placeholder="This document provides some minimal guidelines..."
                  rows={4}
                  className="w-full border-brutal p-3 focus:ring-primary font-body text-sm resize-y bg-background text-foreground"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-semibold mb-2 text-sm uppercase tracking-wide">
                  Keywords
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-3 py-1 border-2 text-xs font-bold transition-all rounded-md uppercase tracking-wider",
                        formData.tags.includes(tag)
                          ? "bg-primary text-primary-foreground border-brutal"
                          : "bg-card text-card-foreground border-border hover:border-foreground",
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Thumbnail (Cloudinary) */}
              <div>
                <label className="block font-semibold mb-2 text-sm uppercase tracking-wide">
                   Video Thumbnail (Drive Link)
                 </label>
                <div className="flex gap-2">
                   <div className="relative flex-1">
                      <Input
                        type="text"
                        value={formData.videoThumbnail}
                        onChange={(e) => handleChange("videoThumbnail", e.target.value)}
                        placeholder="Upload a video or paste Drive URL..."
                        className="pr-10"
                      />
                      {isUploadingVideoThumbnail && (
                         <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                         </div>
                      )}
                   </div>
                   <Button 
                     type="button" 
                     variant="outline" 
                     onClick={() => videoThumbnailInputRef.current?.click()}
                     disabled={isUploadingVideoThumbnail}
                     className="border-brutal bg-card hover:bg-muted text-foreground"
                     title="Upload Video File"
                   >
                     {isUploadingVideoThumbnail ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                   </Button>
                   <input
                      type="file"
                      ref={videoThumbnailInputRef}
                      className="hidden"
                      accept="video/*"
                      onChange={handleVideoThumbnailUpload}
                   />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Upload any video format or paste a Google Drive link. It will be automatically synced and optimized for your paper's cover.</p>
              
                {formData.videoThumbnail && (
                   <div className="mt-4 space-y-3 p-4 border-2 border-brutal border-dashed rounded-lg bg-orange-50/5">
                      <div className="space-y-2 mb-4 bg-muted/20 p-2 border border-brutal">
                        <label className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                           Video Title
                        </label>
                        <Input
                          type="text"
                          value={formData.videoTitle}
                          onChange={(e) => handleChange("videoTitle", e.target.value)}
                          placeholder="What's this catch? (e.g. Prototype Walkthrough)"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                           <Video className="w-4 h-4" /> Thumbnail Selector
                        </label>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCaptureThumbnail}
                          disabled={isCapturing}
                          className="bg-primary text-white h-7 text-[10px] px-3 border-brutal"
                        >
                          {isCapturing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3 mr-1" />}
                          Set Current Frame as Thumbnail
                        </Button>
                      </div>
                      
                      <div className="relative aspect-video bg-black rounded-md overflow-hidden border-2 border-black">
                         <video
                            ref={videoCaptureRef}
                            src={formData.videoThumbnail}
                            controls
                            muted
                            playsInline
                            crossOrigin="anonymous"
                            className="w-full h-full"
                         />
                         {isCapturing && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                               <Loader2 className="w-8 h-8 animate-spin text-white" />
                            </div>
                         )}
                      </div>
                      
                      {formData.coverImageUrl && (
                         <div className="flex gap-3 items-center">
                            <div className="relative w-20 aspect-video rounded border border-border overflow-hidden">
                               <Image src={formData.coverImageUrl} alt="Current Thumbnail" fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                               <p className="text-[10px] font-bold text-success flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Custom Thumbnail Active
                                </p>
                               <p className="text-[9px] text-muted-foreground">This frame will be shown on the explore cards.</p>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleChange("coverImageUrl", "")}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                               <Trash className="w-3 h-3" />
                            </Button>
                         </div>
                      )}
                   </div>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-head font-bold text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Content
                </label>
                <span
                  className={cn(
                    "text-xs font-mono",
                    charCounts.content < 200
                      ? "text-orange-500"
                      : "text-success",
                  )}
                >
                  {charCounts.content} chars (min 200)
                </span>
              </div>

              {/* Toolbar */}
              <div className="bg-foreground text-background p-2 rounded-t-lg flex flex-wrap items-center gap-2 shadow-sm sticky top-2 z-20">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 hover:bg-background/20 rounded-md transition-colors"
                  title="Upload Media"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleUpload}
                />

                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={isConvertingPdf}
                  className="p-2 hover:bg-background/20 rounded-md transition-colors"
                  title="Import from PDF"
                >
                  {isConvertingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="file"
                  ref={pdfInputRef}
                  className="hidden"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                />

                <div className="h-4 w-px bg-background/20 mx-1"></div>

                <button
                  type="button"
                  onClick={() =>
                    insertTextAtCursor(
                      "\n```javascript\n// Your code here\n```\n",
                    )
                  }
                  className="p-2 hover:bg-background/20 rounded-md transition-colors font-mono text-xs font-bold"
                  title="Code Block"
                >
                  {`</>`}
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor("**Bold Text**")}
                  className="p-2 hover:bg-background/20 rounded-md transition-colors font-bold text-xs"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor("*Italic Text*")}
                  className="p-2 hover:bg-background/20 rounded-md transition-colors italic text-xs font-serif"
                  title="Italic"
                >
                  I
                </button>

                <div className="h-4 w-px bg-background/20 mx-1"></div>

                <button
                  type="button"
                  disabled={isGeneratingGraph}
                  onClick={async () => {
                    const prompt = window.prompt("What should the graph show? (e.g., Line chart showing accuracy over 10 epochs)");
                    if (!prompt) return;
                    setIsGeneratingGraph(true);
                    const toastId = toast.loading("Generating SVG Graph...");
                    try {
                      const res = await fetch("/api/ai/generate-graph", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ prompt }),
                      });
                      if (!res.ok) throw new Error("Graph generation failed");
                      const data = await res.json();
                      
                      const targetSection = 'results';
                      const sectionNum = sectionNumMap[targetSection];
                      const itemNum = getNextItemNumber('Fig', targetSection);
                      const label = `Fig ${sectionNum}.${itemNum} ${data.title || 'Data Analysis'}`;
                      
                      const svgMarkdown = `\n\n\`\`\`svg\n${data.svg}\n\`\`\`\n\n**${label}**\n\n`;
                      
                      if (activeTab !== targetSection) setActiveTab(targetSection as SectionType);
                      setSections((prev) => ({ ...prev, [targetSection]: prev[targetSection as keyof typeof sections] + svgMarkdown }));
                      
                      toast.success("AI Graph added successfully!", { id: toastId });
                    } catch (error: any) {
                      toast.error(error.message, { id: toastId });
                    } finally {
                      setIsGeneratingGraph(false);
                    }
                  }}
                  className="p-2 hover:bg-background/20 rounded-md transition-colors text-xs font-bold flex items-center gap-1"
                  title="Generate Graph with AI"
                >
                  {isGeneratingGraph ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart className="w-4 h-4" />}
                </button>

                  <button
                  type="button"
                  onClick={() => setIsTableModalOpen(true)}
                  className="p-2 hover:bg-background/20 rounded-md transition-colors text-xs font-bold flex items-center gap-1"
                  title="Insert Table"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFlowModalOpen(true)}
                  className="p-2 hover:bg-background/20 rounded-md transition-colors text-xs font-bold flex items-center gap-1"
                  title="Insert Flowchart"
                >
                  <Workflow className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={isGeneratingGraph}
                  onClick={() => setIsGraphModalOpen(true)}
                  className="p-2 hover:bg-background/20 rounded-md transition-colors text-xs font-bold flex items-center gap-1"
                  title="Generate Graph with AI"
                >
                  {isGeneratingGraph ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart className="w-4 h-4" />}
                </button>

                <div className="flex-1"></div>

                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.content || formData.content.length < 50) {
                      toast.error(
                        "Please write at least 50 characters before improving.",
                      );
                      return;
                    }
                    setIsImproving(true);
                    setAiSuggestions(null);
                    try {
                      const res = await fetch("/api/ai/improve", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content: sections[activeTab] }),
                      });
                      if (!res.ok) throw new Error("Failed to improve");
                      const data = await res.json();
                      setSections((prev) => ({ ...prev, [activeTab]: data.content }));
                      if (data.suggestions) {
                        setAiSuggestions(data.suggestions);
                        toast.success(
                          "Content improved! Check suggestions below.",
                        );
                      }
                    } catch (error: any) {
                      toast.error(error.message);
                    } finally {
                      setIsImproving(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white rounded-md text-xs font-bold transition-all shadow-sm"
                >
                  <Sparkles className="w-3 h-3" />
                  {isImproving ? "Fixing..." : "Fix Grammar"}
                </button>
              </div>

              <div className="flex bg-muted p-1 rounded-lg gap-1 border-2 border-brutal overflow-x-auto">
                {(['introduction', 'methods', 'results', 'conclusion'] as SectionType[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all whitespace-nowrap",
                      activeTab === tab
                        ? "bg-background shadow-brutal-sm translate-y-[-2px] border-2 border-border"
                        : "hover:bg-background/50 text-muted-foreground border-2 border-transparent"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              {isImproving ? (
                <div className="w-full border-brutal border-t-0 p-4 h-[500px] rounded-b-lg bg-muted/5">
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-muted w-3/4 rounded"></div>
                    <div className="h-4 bg-muted w-full rounded"></div>
                    <div className="h-4 bg-muted w-5/6 rounded"></div>
                  </div>
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={sections[activeTab]}
                  onChange={(e) => setSections((prev) => ({ ...prev, [activeTab]: e.target.value }))}
                  placeholder={`Write your ${activeTab} here...\n\n(No need to add the section title, it's added automatically in the preview.)`}
                  className="w-full border-2 border-brutal rounded-b-lg p-6 font-mono text-sm focus:ring-2 focus:ring-ring focus:outline-none min-h-[500px] leading-relaxed resize-y bg-background text-foreground"
                />
              )}

              {aiSuggestions && !isImproving && (
                <div className="mt-4 p-4 border-l-4 border-orange-500 bg-orange-50/10 rounded-r-md">
                  <h3 className="font-bold flex items-center gap-2 mb-2 text-orange-700 text-sm">
                    <Sparkles className="w-4 h-4" />
                    AI Suggestions
                  </h3>
                  <div className="whitespace-pre-wrap text-sm text-orange-900/80 font-mono">
                    {aiSuggestions}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.title ||
                  formData.content.length < 200
                }
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                size="lg"
              >
                {isSubmitting
                  ? isEditing
                    ? "Updating..."
                    : "Publishing..."
                  : isEditing
                    ? "Update Post"
                    : "Publish Post"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-2 border-brutal hover:bg-muted"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Preview (Sticky) */}
          <div className="hidden lg:block relative">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-head text-xl font-bold flex items-center gap-2">
                  <Eye className="w-5 h-5" /> Live Preview
                </h2>
                <div className="text-xs text-muted-foreground">
                  Markdown supported
                </div>
              </div>

                <div className="border border-border/20 rounded-xl p-8 bg-[#ffffff] shadow-2xl min-h-[1056px] max-h-[calc(100vh-150px)] overflow-y-auto overflow-x-hidden w-full font-serif text-[#000000]">
                  {/* Hero Stage (Dark Background Context) */}
                  {formData.videoThumbnail ? (
                     <div className="mb-8 w-full overflow-hidden bg-black aspect-video relative group flex items-center justify-center">
                        <video 
                           key={formData.videoThumbnail} 
                           autoPlay 
                           loop 
                           controls
                           playsInline
                           preload="auto"
                           className="w-full h-full object-cover group-hover:opacity-100 transition-opacity"
                        >
                           <source 
                              src={formData.videoThumbnail} 
                              type="video/mp4" 
                           />
                           Your browser does not support the video tag.
                        </video>
                     </div>
                  ) : (
                     <div className="mb-8 p-6 bg-slate-900/5 border-2 border-dashed border-slate-900/10 rounded-2xl text-center">
                        <p className="text-slate-900/30 font-bold uppercase tracking-widest text-[10px] italic">Research Preview Stage</p>
                     </div>
                  )}

                  {/* Paper Header Container */}

                  <div className="text-center mb-10 px-8">
                    <h1 className="text-[24px] font-bold mb-4 font-serif leading-tight">
                      {formData.title || "Paper Title"}
                    </h1>
                    <div className="text-[12px] font-serif leading-relaxed mx-auto max-w-lg">
                      {authorDetails?.split('\n').map((line, i) => (
                        <p key={i} className="whitespace-pre-wrap mb-1">
                          {line}
                        </p>
                      ))}
                    </div>

                    
                  </div>

                  <div className="columns-1 md:columns-2 gap-8 text-justify text-[11px] leading-[1.4] font-serif" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
                    <div className="prose prose-sm max-w-none font-serif [&_h1]:text-[12px] [&_h1]:font-bold [&_h1]:uppercase [&_h1]:text-center [&_h1]:my-4 [&_h1]:tracking-wide [&_h2]:text-[11px] [&_h2]:font-bold [&_h2]:italic [&_h2]:mb-1 [&_h2]:mt-3 [&_p]:mb-2 [&_p]:text-justify [&_img]:mx-auto [&_img]:my-3 [&_img]:border [&_img]:border-gray-200 [&_table]:w-full [&_table]:text-[9px] [&_table]:break-inside-avoid [&_table]:my-4 [&_th]:border-y-2 [&_th]:border-gray-800 [&_th]:py-1 [&_td]:border-b [&_td]:border-gray-300 [&_td]:py-1 [&_th]:font-bold [&_th]:uppercase [&_th]:bg-black/5 [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:block">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({
                          node,
                          inline,
                          className,
                          children,
                          ...props
                        }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          if (!inline && match && match[1] === "svg") {
                              const content = Array.isArray(children) ? children.join('') : String(children);
                              return (
                                <div 
                                  className="my-6 block text-center break-inside-avoid w-full overflow-hidden border border-gray-200 rounded-md p-1 shadow-sm bg-white" 
                                  dangerouslySetInnerHTML={{ __html: content }} 
                                />
                              );
                          }
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={tomorrow}
                              language={match[1]}
                              PreTag="div"
                              className="w-full text-[10px]"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                        table({ node, children }: any) {
                          return (
                            <div className="my-8 overflow-x-auto w-full border border-gray-200 rounded-lg shadow-sm">
                              <table className="w-full border-collapse text-[11px] font-sans">
                                {children}
                              </table>
                            </div>
                          );
                        },
                        thead({ node, children }: any) {
                          return <thead className="bg-[#f8fafc] border-b-2 border-slate-800">{children}</thead>;
                        },
                        th({ node, children }: any) {
                          return <th className="p-3 text-left font-bold uppercase tracking-wider text-slate-700">{children}</th>;
                        },
                        td({ node, children }: any) {
                          return <td className="p-3 border-b border-gray-100 text-slate-800 leading-relaxed">{children}</td>;
                        },
                        tr({ node, children }: any) {
                          return <tr className="hover:bg-slate-50 transition-colors">{children}</tr>;
                        },
                        img({ node, ...props }: any) {
                          if (props.alt === "Video") {
                            return (
                              <video
                                src={props.src}
                                controls
                                className="w-full my-4"
                              />
                            );
                          }
                          return (
                            <span className="block text-center text-[10px] italic text-gray-400 mb-6 mt-4 break-inside-avoid">
                              <img
                                {...props}
                                className="w-full mb-2"
                                alt={props.alt}
                              />
                              {props.alt}
                            </span>
                          );
                        },
                        p({ node, children }: any) {
                          const childrenArray = React.Children.toArray(children);
                          const firstChild = childrenArray[0];
                          const text = typeof firstChild === 'string' ? firstChild : '';
                          const isCaption = text.startsWith("Fig") || text.startsWith("Table") || text.startsWith("Flowchart");
                          if (isCaption) {
                            return <p className="mb-4 mt-1 text-center font-bold text-[9px] uppercase tracking-tight">{children}</p>;
                          }
                          return <p className="mb-2 indent-4 text-justify leading-relaxed tracking-tight">{children}</p>;
                        }
                      }}
                    >
                      {formData.content || "*Start writing your introduction...*"}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Local Graph Builder Modal */}
      {isGraphModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-5xl rounded-xl shadow-2xl border-2 border-brutal p-6 flex flex-col md:flex-row gap-8 relative h-[85vh] md:h-[600px] overflow-hidden">
            
            {/* Left: Controls */}
            <div className="w-full md:w-1/3 flex flex-col h-full space-y-4 pr-2 min-h-0">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="font-head text-xl font-bold flex items-center gap-2">
                    <BarChart className="w-5 h-5" /> Manual Data Canvas
                 </h3>
                 <button type="button" onClick={() => setIsGraphModalOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground font-bold">✕</button>
               </div>
               
               <div>
                  <label className="text-xs font-bold uppercase tracking-widest block mb-2 text-muted-foreground">Graph Config</label>
                  <select 
                     value={graphType} 
                     onChange={(e) => setGraphType(e.target.value)}
                     className="w-full border-2 border-brutal rounded-md p-2 bg-background text-sm font-semibold mb-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                     <option value="Bar Chart">Bar Chart</option>
                     <option value="Line Chart">Line Chart</option>
                     <option value="Pie Chart">Pie Chart</option>
                  </select>
                  
                  <div className="space-y-3">
                     <Input 
                        placeholder="Graph Title" 
                        value={graphTitle} 
                        onChange={(e) => setGraphTitle(e.target.value)} 
                     />
                     <div className="flex gap-2">
                        <Input placeholder="X-Axis" value={xAxisLabel} onChange={(e) => setXAxisLabel(e.target.value)} />
                        <Input placeholder="Y-Axis" value={yAxisLabel} onChange={(e) => setYAxisLabel(e.target.value)} />
                     </div>
                  </div>
               </div>
               
               <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 border-t border-border pt-4 pr-1 snap-y pb-2">
                  <div className="flex justify-between items-center mb-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Data Points</label>
                     <button type="button" onClick={() => setGraphData([...graphData, {label: "New", value: "0"}])} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                        <Plus className="w-3 h-3"/> Add
                     </button>
                  </div>
                  <div className="space-y-2">
                     {graphData.map((d, i) => (
                        <div key={i} className="flex gap-3 items-center">
                           <Input className="w-2/3 min-w-0" placeholder="Label" value={d.label} onChange={(e) => {
                               const arr = [...graphData]; arr[i].label = e.target.value; setGraphData(arr);
                           }}/>
                           <Input className="w-1/3 min-w-0" placeholder="Value" type="text" value={d.value} onChange={(e) => {
                               const arr = [...graphData]; arr[i].value = e.target.value; setGraphData(arr);
                           }}/>
                           <button type="button" onClick={() => setGraphData(graphData.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md shrink-0">
                              <Trash className="w-4 h-4" />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
               
            </div>
            
            {/* Right: Live Preview & Action */}
            <div className="w-full md:w-2/3 flex flex-col space-y-4 h-full min-h-0">
               <h3 className="font-bold text-sm uppercase text-muted-foreground tracking-widest hidden md:block shrink-0">Real-Time Render</h3>
               
               <div className="flex-1 bg-[#ffffff] border-2 border-brutal rounded-xl p-4 flex items-center justify-center overflow-auto relative min-h-0">
                  {generatedGraphSvg ? (
                     <div dangerouslySetInnerHTML={{ __html: generatedGraphSvg }} className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:max-h-full [&>svg]:h-auto" />
                  ) : (
                     <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Add Data to Preview</p>
                  )}
               </div>
               
               <div className="flex gap-4 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsGraphModalOpen(false)}>Cancel</Button>
                  <Button 
                    type="button"
                    disabled={!generatedGraphSvg}
                    onClick={handleInsertGraph}
                  >
                      Insert Graph into {activeTab.toUpperCase()}
                  </Button>
               </div>
            </div>
            
            <button type="button" onClick={() => setIsGraphModalOpen(false)} className="hidden md:block absolute top-6 right-6 text-muted-foreground hover:text-foreground font-bold">✕</button>
          </div>
        </div>
      )}

      {/* Manual Workflow Builder Modal */}
      {isFlowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-5xl rounded-xl shadow-2xl border-2 border-brutal p-6 flex flex-col md:flex-row gap-8 relative h-[85vh] md:h-[600px] overflow-hidden">
            <div className="w-full md:w-1/3 flex flex-col h-full space-y-4 pr-2 min-h-0">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="font-head text-xl font-bold flex items-center gap-2">
                    <Workflow className="w-5 h-5" /> Flowchart Editor
                 </h3>
                 <button type="button" onClick={() => setIsFlowModalOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground font-bold">✕</button>
               </div>
               
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest block mb-2 text-muted-foreground">Orientation & Title</label>
                  <Input 
                      placeholder="Flowchart Title" 
                      value={flowTitle} 
                      onChange={(e) => setFlowTitle(e.target.value)}
                      className="mb-3"
                  />
                  <select 
                     value={flowDirection} 
                     onChange={(e) => setFlowDirection(e.target.value)}
                     className="w-full border-2 border-brutal rounded-md p-2 bg-background text-sm font-semibold mb-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                     <option value="horizontal">Horizontal (Left to Right)</option>
                     <option value="vertical">Vertical (Top to Bottom)</option>
                  </select>
               </div>
               
               <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 border-t border-border pt-4 pr-1 snap-y pb-2">
                  <div className="flex justify-between items-center mb-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Process Steps</label>
                     <button type="button" onClick={() => setFlowSteps([...flowSteps, {label: "New Step", desc: ""}])} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                        <Plus className="w-3 h-3"/> Add
                     </button>
                  </div>
                  <div className="space-y-4">
                     {flowSteps.map((step, i) => (
                        <div key={i} className="flex flex-col gap-2 p-3 border-2 border-border border-dashed rounded-md group">
                           <div className="flex gap-2 items-center">
                             <Input className="flex-1 font-bold text-sm min-w-0" placeholder="Step Name" value={step.label} onChange={(e) => {
                                 const map = [...flowSteps]; map[i].label = e.target.value; setFlowSteps(map);
                             }}/>
                             <button type="button" onClick={() => setFlowSteps(flowSteps.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md shrink-0 transition-opacity opacity-0 group-hover:opacity-100">
                                <Trash className="w-4 h-4" />
                             </button>
                           </div>
                           <Input className="text-xs w-full" placeholder="Description (optional)" value={step.desc} onChange={(e) => {
                               const map = [...flowSteps]; map[i].desc = e.target.value; setFlowSteps(map);
                           }}/>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            
            <div className="w-full md:w-2/3 flex flex-col space-y-4 h-full min-h-0">
               <h3 className="font-bold text-sm uppercase text-muted-foreground tracking-widest hidden md:block shrink-0">Real-Time Canvas</h3>
               <div className="flex-1 bg-[#ffffff] border-2 border-brutal rounded-xl p-4 flex items-center justify-center overflow-auto relative min-h-0">
                  {generatedFlowSvg && (
                     <div dangerouslySetInnerHTML={{ __html: generatedFlowSvg }} className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:max-h-full [&>svg]:h-auto" />
                  )}
               </div>
               <div className="flex gap-4 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsFlowModalOpen(false)}>Cancel</Button>
                  <Button type="button" onClick={handleInsertFlow}>Insert Flow into {activeTab.toUpperCase()}</Button>
               </div>
            </div>
            <button type="button" onClick={() => setIsFlowModalOpen(false)} className="hidden md:block absolute top-6 right-6 text-muted-foreground hover:text-foreground font-bold">✕</button>
          </div>
        </div>
      )}

      {/* Manual Table Builder Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-4xl rounded-xl shadow-2xl border-2 border-brutal p-6 flex flex-col relative max-h-[90vh] overflow-hidden">
             <div className="flex justify-between items-center mb-6">
                  <h3 className="font-head text-xl font-bold flex items-center gap-2">
                     <TableIcon className="w-5 h-5" /> Data Table Grid
                  </h3>
                  <div className="flex-1 max-w-sm mx-4">
                     <Input 
                        placeholder="Table Title (e.g., Experimental Results)" 
                        value={tableTitle} 
                        onChange={(e) => setTableTitle(e.target.value)}
                     />
                  </div>
                  <button type="button" onClick={() => setIsTableModalOpen(false)} className="text-muted-foreground hover:text-foreground font-bold">✕</button>
              </div>
             
             <div className="flex gap-2 mb-4">
                 <Button type="button" variant="outline" onClick={() => {
                     const newRows = [...tableData];
                     newRows.forEach(r => r.push("Col"));
                     setTableData(newRows);
                 }}><Plus className="w-4 h-4 mr-1" /> Column</Button>
                 
                 <Button type="button" variant="outline" onClick={() => {
                     const newRows = [...tableData];
                     newRows.push(new Array(newRows[0].length).fill("Cell"));
                     setTableData(newRows);
                 }}><Plus className="w-4 h-4 mr-1" /> Row</Button>
             </div>
             
             <div className="flex-1 overflow-auto border-2 border-brutal">
                 <table className="w-full border-collapse">
                     <tbody>
                         {tableData.map((row, rowIndex) => (
                             <tr key={rowIndex}>
                                 {row.map((cell, colIndex) => (
                                     <td key={colIndex} className="border p-2 min-w-[120px]">
                                         <Input 
                                            value={cell} 
                                            onChange={(e) => {
                                                const newT = [...tableData];
                                                newT[rowIndex][colIndex] = e.target.value;
                                                setTableData(newT);
                                            }}
                                            className={rowIndex === 0 ? "font-bold bg-muted/30" : "bg-transparent"}
                                         />
                                     </td>
                                 ))}
                                 <td className="w-10 text-center border p-2">
                                     <button type="button" onClick={() => setTableData(tableData.filter((_, i) => i !== rowIndex))} className="text-red-500 hover:text-red-600"><Trash className="w-4 h-4 mx-auto"/></button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
             
             <div className="flex justify-between items-center mt-6">
                 <Button type="button" variant="outline" onClick={() => {
                     if (tableData[0].length > 1) {
                         setTableData(tableData.map(r => r.slice(0, -1)));
                     }
                 }} className="text-red-500 hover:text-red-600 border-red-200">Remove Last Column</Button>
                 
                 <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setIsTableModalOpen(false)}>Cancel</Button>
                    <Button type="button" onClick={insertMarkdownTable}>Insert Markdown Table</Button>
                 </div>
             </div>
          </div>
        </div>
      )}

      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className="max-w-md border-brutal bg-card">
          <DialogHeader>
            <DialogTitle className="font-head text-2xl flex items-center gap-2">
              Community Pledge <PenLine className="w-6 h-6 text-primary" />
            </DialogTitle>
            <DialogDescription className="font-sans text-muted-foreground">
              Before publishing, please agree to our community guidelines.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/20 border-2 border-black/10 rounded-md text-sm space-y-2">
              <p>I certify that this post:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Contains{" "}
                  <strong>NO vulgarity, hate speech, or harassment</strong>.
                </li>
                <li>Is original content or properly cited.</li>
                <li>Respects the intellectual property of others.</li>
              </ul>
              <p className="flex items-center gap-1.5 font-bold text-destructive mt-2">
                <AlertTriangle className="w-4 h-4" /> Violations will result in immediate ban.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">
                Sign with your name to agree:
              </label>
              <Input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your full name..."
                className="font-cursive text-2xl text-primary border-b-2 border-primary border-t-0 border-x-0 rounded-none px-0 focus:ring-0 focus:border-b-4 transition-all placeholder:font-sans placeholder:text-base placeholder:text-muted-foreground/50"
                style={{
                  fontFamily: '"Brush Script MT", "Comic Sans MS", cursive',
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTermsOpen(false)}
              className="border-brutal"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting || signature.length < 3}
              className="bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm"
            >
              {isSubmitting ? "Publishing..." : "I Agree & Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-2 border-brutal shadow-brutal font-serif p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 flex flex-col items-center justify-center text-white border-b-2 border-black">
            <ClipboardCheck className="w-12 h-12 mb-2 opacity-90" />
            <DialogTitle className="font-head text-2xl font-bold uppercase tracking-wider text-center m-0">
              Review
            </DialogTitle>
            <p className="text-sm font-sans font-medium text-white/80 max-w-sm text-center">
              Our automated reviewer is actively verifying your manuscript format, constraints, and academic rigorousness against standards.
            </p>
          </div>

          <div className="p-8 max-h-[60vh] overflow-y-auto overflow-x-hidden border-b-2 border-black">
            <div className="space-y-4 mb-8">
               {REVIEW_STEPS.map((step, index) => {
                 const isCompleted = reviewStepsCompleted > index;
                 const isCurrent = reviewStepsCompleted === index && isReviewing;
                 return (
                   <div key={index} className={cn("flex items-center gap-3 transition-opacity duration-500", !isCompleted && !isCurrent ? "opacity-30" : "opacity-100")}>
                     {isCompleted ? (
                       <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                     ) : isCurrent ? (
                       <Loader2 className="w-5 h-5 text-orange-500 animate-spin shrink-0" />
                     ) : (
                       <div className="w-5 h-5 border-2 border-gray-300 rounded-full shrink-0" />
                     )}
                     <span className={cn(
                       "font-sans font-medium",
                       isCompleted ? "text-green-800" : isCurrent ? "text-orange-800" : "text-gray-500"
                     )}>
                       {step}
                     </span>
                   </div>
                 );
               })}
            </div>

            {reviewRecommendations && reviewRecommendations.trim().toUpperCase() === "VIOLATION" ? (
               <div className="border-t-4 border-red-600 pt-8 animate-in slide-in-from-bottom-4 duration-700 fade-in mt-4">
                  <h3 className="font-head text-2xl font-black uppercase flex items-center gap-3 mb-6 tracking-wide text-red-600">
                     <XCircle className="w-8 h-8" /> Policy Violation Detected
                  </h3>
                  <div className="bg-[#fef2f2] text-red-900 p-8 border-4 border-red-700 shadow-[8px_8px_0_0_#b91c1c] rounded-none">
                     <p className="font-sans font-bold text-lg leading-relaxed">
                        ⚠️ The AI Peer Reviewer detected vulgarity, trolling, or targeted harassment directed at specific individuals or organizations within your paper. Our community strictly prohibits this. Please revise your content immediately.
                     </p>
                  </div>
               </div>
            ) : reviewRecommendations && reviewRecommendations.trim().toUpperCase() === "PERFECT" ? (
               <div className="border-t-4 border-green-600 pt-8 animate-in slide-in-from-bottom-4 duration-700 fade-in mt-4">
                  <h3 className="font-head text-2xl font-black uppercase flex items-center gap-3 mb-6 tracking-wide text-green-600">
                     <Sparkles className="w-8 h-8" /> Flawless Manuscript
                  </h3>
                  <div className="bg-[#f0fdf4] text-green-900 p-8 border-4 border-green-700 shadow-[8px_8px_0_0_#15803d] rounded-none">
                     <p className="font-sans font-bold text-lg leading-relaxed">
                        Outstanding work! 🏆 The AI Peer Reviewer found your research paper to be exceptionally rigorous, logically sound, and perfectly formatted to IEEE standards. No structural or academic modifications are recommended.
                     </p>
                  </div>
               </div>
            ) : reviewRecommendations && (
               <div className="border-t-4 border-black pt-8 animate-in slide-in-from-bottom-4 duration-700 fade-in mt-4">
                  <h3 className="font-head text-2xl font-black uppercase flex items-center gap-3 mb-6 tracking-wide text-[#ff6b35]">
                     <FileCheck2 className="w-8 h-8" /> Actionable Feedback
                  </h3>
                  
                  {/* High Contrast NeoBrutalist Output Block */}
                  <div className="bg-[#fff8f3] text-black p-8 border-4 border-black shadow-[8px_8px_0_0_#000000] rounded-none">
                    <div className="prose prose-sm max-w-none font-sans font-medium leading-relaxed [&_h1]:text-black [&_h2]:text-black [&_h3]:text-black [&_strong]:text-black [&_strong]:font-black [&_li]:text-black [&_p]:text-black [&_ul]:my-4 [&_ul]:space-y-3 [&_ul]:pl-6 [&_li::marker]:text-[#ff6b35] [&_code]:text-red-600 [&_code]:bg-red-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:border [&_code]:border-black">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {reviewRecommendations}
                      </ReactMarkdown>
                    </div>
                  </div>
               </div>
            )}
          </div>

          <DialogFooter className="bg-muted p-4 border-t-2 border-black/10">
            <Button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="bg-black text-white px-8 uppercase font-bold tracking-widest shadow-brutal hover:shadow-brutal-sm border border-transparent hover:translate-y-[2px] transition-all"
            >
              {isReviewing ? "Cancel Review" : "Close Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TrashIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
