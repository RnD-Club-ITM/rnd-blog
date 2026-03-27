"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { toast } from "sonner";
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
  Workflow
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field in charCounts) {
      setCharCounts((prev) => ({ ...prev, [field]: value.length }));
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
    const w = 800; const h = 400; const p = 60;
    const cw = w - p * 2; const ch = h - p * 2;
    const safeData = graphData.filter(d => d.label && !isNaN(Number(d.value)));
    const maxV = Math.max(...safeData.map(d => Number(d.value)), 1);

    let svg = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="background-color: white;">\n<rect width="100%" height="100%" fill="white" />\n${graphTitle ? `<text x="${w/2}" y="30" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="#000">${graphTitle}</text>` : ""}\n<line x1="${p}" y1="${p}" x2="${p}" y2="${h - p}" stroke="#000" stroke-width="2" />\n<text x="20" y="${h/2}" transform="rotate(-90, 20, ${h/2})" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#000">${yAxisLabel}</text>\n<line x1="${p}" y1="${h - p}" x2="${w - p}" y2="${h - p}" stroke="#000" stroke-width="2" />\n<text x="${w/2}" y="${h - 15}" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#000">${xAxisLabel}</text>\n`;

    if (graphType === "Bar Chart" && safeData.length > 0) {
        const bw = (cw / safeData.length) * 0.6;
        safeData.forEach((d, i) => {
            const bh = (Number(d.value) / maxV) * ch;
            const x = p + (i * (cw / safeData.length)) + ((cw / safeData.length) * 0.2);
            const y = h - p - bh;
            svg += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="#3b82f6" rx="4" />\n<text x="${x + bw/2}" y="${h - p + 20}" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#000">${d.label}</text>\n<text x="${x + bw/2}" y="${y - 10}" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#666">${d.value}</text>\n`;
        });
    } else if (graphType === "Line Chart" && safeData.length > 0) {
        const space = cw / Math.max(safeData.length - 1, 1);
        const pts = safeData.map((d, i) => `${p + (i * space)},${h - p - ((Number(d.value) / maxV) * ch)}`).join(" ");
        svg += `<polyline points="${pts}" fill="none" stroke="#ef4444" stroke-width="3" />\n`;
        safeData.forEach((d, i) => {
            const cx = p + (i * space);
            const cy = h - p - ((Number(d.value) / maxV) * ch);
            svg += `<circle cx="${cx}" cy="${cy}" r="5" fill="#ef4444" />\n<text x="${cx}" y="${h - p + 20}" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#000">${d.label}</text>\n<text x="${cx}" y="${cy - 12}" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#666">${d.value}</text>\n`;
        });
    }
    svg += `</svg>`;
    setGeneratedGraphSvg(svg);
  }, [graphData, graphType, graphTitle, xAxisLabel, yAxisLabel, isGraphModalOpen]);

  // Flowchart GUI State
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [flowDirection, setFlowDirection] = useState("horizontal");
  const [flowSteps, setFlowSteps] = useState([{ label: "Data Prep", desc: "Clean Logs" }, { label: "Train", desc: "Neural Net" }]);
  const [generatedFlowSvg, setGeneratedFlowSvg] = useState("");

  // Table GUI State
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableData, setTableData] = useState<string[][]>([
    ["Model", "Accuracy", "F1"],
    ["SVM", "88%", "0.86"],
    ["Random Forest", "92%", "0.91"]
  ]);

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
      const svgGraph = `\n\n\`\`\`svg\n${generatedGraphSvg}\n\`\`\`\n\n`;
      if (activeTab !== 'results') setActiveTab('results');
      setSections((prev) => ({ ...prev, [activeTab]: prev[activeTab] + svgGraph }));
      toast.success("Graph added successfully!");
      setIsGraphModalOpen(false);
  };

  const handleInsertFlow = () => {
      if (!generatedFlowSvg) return;
      const svgCode = `\n\n\`\`\`svg\n${generatedFlowSvg}\n\`\`\`\n\n`;
      if (activeTab !== 'methods') setActiveTab('methods'); // Process flows naturally fit Methods
      setSections((prev) => ({ ...prev, [activeTab]: prev[activeTab] + svgCode }));
      toast.success("Flowchart added successfully!");
      setIsFlowModalOpen(false);
  };

  const insertMarkdownTable = () => {
    if (tableData.length === 0 || tableData[0].length === 0) return;
    let md = "\n\n";
    md += "| " + tableData[0].join(" | ") + " |\n"; // Header
    md += "| " + tableData[0].map(() => "---").join(" | ") + " |\n"; // Separator
    for (let i = 1; i < tableData.length; i++) {
        md += "| " + tableData[i].join(" | ") + " |\n"; // Body
    }
    md += "\n";
    if (activeTab !== 'results') setActiveTab('results');
    setSections((prev) => ({ ...prev, [activeTab]: prev[activeTab] + md }));
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
              <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
                <h3 className="font-head text-xl font-bold">
                  Research Details
                </h3>
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
                   className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm flex items-center gap-2 text-xs"
                >
                   {isWritingPaper ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                   Auto-Generate Paper from Title
                </Button>
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
                      insertTextAtCursor("\\n```svg\\n" + data.svg + "\\n```\\n");
                      toast.success("Graph added successfully!", { id: toastId });
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

              <div className="border border-border/20 rounded-xl p-10 bg-[#292929] shadow-2xl min-h-[1056px] max-h-[calc(100vh-150px)] overflow-y-auto w-full font-serif text-[#e5e5e5]">
                {/* Header Container */}
                <div className="flex justify-end items-start mb-12 border-b border-gray-600 pb-4">
                  <div className="text-right text-[10px] text-gray-400 font-sans leading-relaxed tracking-wide">
                     Print ISSN: 2395-1990 | Online ISSN: 2394-4099<br/>
                     Themed Section: Engineering and Technology
                  </div>
                </div>

                <div className="text-center mb-10 px-8">
                  <h1 className="text-[28px] font-bold mb-6 font-serif leading-tight">
                    {formData.title || "Paper Title"}
                  </h1>
                  <div className="text-[12px] font-serif leading-relaxed mx-auto max-w-lg">
                    {authorDetails.split('\n').map((line, i) => (
                      <p key={i} className={i === 0 ? "font-bold text-[14px] mb-1 whitespace-pre-wrap" : "italic text-gray-300 whitespace-pre-wrap"}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="columns-1 md:columns-2 gap-8 text-justify text-[12px] leading-[1.6]">
                  <div className="prose prose-sm prose-invert max-w-none font-serif [&_h1]:text-[13px] [&_h1]:font-bold [&_h1]:uppercase [&_h1]:text-center [&_h1]:my-6 [&_h1]:tracking-wider [&_h2]:text-[12px] [&_h2]:italic [&_h2]:mb-2 [&_h2]:mt-4 [&_p]:mb-4 [&_p]:text-justify [&_img]:mx-auto [&_img]:my-4 [&_img]:border [&_img]:border-gray-600 [&_table]:w-full [&_table]:text-[10px] [&_table]:break-inside-avoid [&_table]:my-6 [&_th]:border-y-2 [&_th]:border-gray-500 [&_th]:py-2 [&_td]:border-b [&_td]:border-gray-700 [&_td]:py-2 [&_th]:font-bold [&_th]:uppercase [&_th]:bg-white/5 [&_svg]:break-inside-avoid [&_svg]:w-full [&_svg]:h-auto">
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
                              return <div className="my-6 flex justify-center w-full" dangerouslySetInnerHTML={{__html: String(children)}} />;
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
                        p({ node, children }) {
                          return <p className="mb-4 indent-6">{children}</p>;
                        }
                      }}
                    >
                      {`**ABSTRACT**\n\n${formData.excerpt || "*The abstract text goes here.*"}\n\n**Keywords:** *${formData.tags.length ? formData.tags.join(", ") : "Keyword1, Keyword2"}*\n\n${formData.content || "*Start writing your introduction...*"}`}
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
          <div className="bg-card w-full max-w-5xl rounded-xl shadow-2xl border-2 border-brutal p-6 flex flex-col md:flex-row gap-8 relative max-h-[90vh] overflow-hidden">
            
            {/* Left: Controls */}
            <div className="w-full md:w-1/3 flex flex-col space-y-4 h-full overflow-y-auto pr-2">
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
               
               <div className="flex-1 overflow-auto border-t border-border pt-4">
                  <div className="flex justify-between items-center mb-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Data Points</label>
                     <button type="button" onClick={() => setGraphData([...graphData, {label: "New", value: "0"}])} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                        <Plus className="w-3 h-3"/> Add
                     </button>
                  </div>
                  <div className="space-y-2">
                     {graphData.map((d, i) => (
                        <div key={i} className="flex gap-2">
                           <Input className="flex-1" placeholder="Label" value={d.label} onChange={(e) => {
                               const arr = [...graphData]; arr[i].label = e.target.value; setGraphData(arr);
                           }}/>
                           <Input className="w-20" placeholder="Value" type="number" value={d.value} onChange={(e) => {
                               const arr = [...graphData]; arr[i].value = e.target.value; setGraphData(arr);
                           }}/>
                           <button type="button" onClick={() => setGraphData(graphData.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md">
                              <Trash className="w-4 h-4" />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
               
            </div>
            
            {/* Right: Live Preview & Action */}
            <div className="w-full md:w-2/3 flex flex-col space-y-4 h-[50vh] md:h-full">
               <h3 className="font-bold text-sm uppercase text-muted-foreground tracking-widest hidden md:block">Real-Time Render</h3>
               
               <div className="flex-1 bg-[#ffffff] border-2 border-brutal rounded-xl p-4 flex items-center justify-center overflow-auto relative">
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
          <div className="bg-card w-full max-w-5xl rounded-xl shadow-2xl border-2 border-brutal p-6 flex flex-col md:flex-row gap-8 relative max-h-[90vh] overflow-hidden">
            <div className="w-full md:w-1/3 flex flex-col space-y-4 h-full overflow-y-auto pr-2">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="font-head text-xl font-bold flex items-center gap-2">
                    <Workflow className="w-5 h-5" /> Flowchart Editor
                 </h3>
                 <button type="button" onClick={() => setIsFlowModalOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground font-bold">✕</button>
               </div>
               
               <div>
                  <label className="text-xs font-bold uppercase tracking-widest block mb-2 text-muted-foreground">Orientation</label>
                  <select 
                     value={flowDirection} 
                     onChange={(e) => setFlowDirection(e.target.value)}
                     className="w-full border-2 border-brutal rounded-md p-2 bg-background text-sm font-semibold mb-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                     <option value="horizontal">Horizontal (Left to Right)</option>
                     <option value="vertical">Vertical (Top to Bottom)</option>
                  </select>
               </div>
               
               <div className="flex-1 overflow-auto border-t border-border pt-4">
                  <div className="flex justify-between items-center mb-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Process Steps</label>
                     <button type="button" onClick={() => setFlowSteps([...flowSteps, {label: "New Step", desc: ""}])} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                        <Plus className="w-3 h-3"/> Add
                     </button>
                  </div>
                  <div className="space-y-4">
                     {flowSteps.map((step, i) => (
                        <div key={i} className="flex flex-col gap-2 p-3 border-2 border-border border-dashed rounded-md relative group">
                           <Input className="font-bold text-sm" placeholder="Step Name" value={step.label} onChange={(e) => {
                               const map = [...flowSteps]; map[i].label = e.target.value; setFlowSteps(map);
                           }}/>
                           <Input className="text-xs" placeholder="Description (optional)" value={step.desc} onChange={(e) => {
                               const map = [...flowSteps]; map[i].desc = e.target.value; setFlowSteps(map);
                           }}/>
                           <button type="button" onClick={() => setFlowSteps(flowSteps.filter((_, idx) => idx !== i))} className="absolute -top-3 -right-3 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                              <Trash className="w-3 h-3" />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            
            <div className="w-full md:w-2/3 flex flex-col space-y-4 h-[50vh] md:h-full">
               <h3 className="font-bold text-sm uppercase text-muted-foreground tracking-widest hidden md:block">Real-Time Canvas</h3>
               <div className="flex-1 bg-[#ffffff] border-2 border-brutal rounded-xl p-4 flex items-center justify-center overflow-auto relative">
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
            <DialogTitle className="font-head text-2xl">
              Community Pledge ✍️
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
              <p className="items-center font-bold text-destructive mt-2">
                ⚠️ Violations will result in immediate ban.
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
