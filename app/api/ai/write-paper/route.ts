import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { topic, existingContent } = await req.json();

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Config missing' }, { status: 500 });
        }

        const contextInfo = existingContent ? `Here are my notes/draft so far:\n${existingContent}` : '';

        const aiPrompt = `You are an expert researcher writing a paper on the topic: "${topic}".
${contextInfo}
Write a COMPLETE research paper perfectly structured for IEEE format. Make the content dense and professional, at least 1500 words total across the sections. The user expects a fully formatted, publication-ready paper with visuals.

CRITICAL CAPTIONING RULES:
1. FIGURES (Graphs/Flowcharts): The caption MUST follow the visual (Graph or Flowchart) and be formatted exactly as: **Fig X.Y [Concise Title]**.
2. TABLES: The caption MUST precede the table and be formatted exactly as: **Table X.Y [Concise Title]**.

In your response, you MUST include:
1. In the METHODS section: Include an SVG Process Flowchart. Use \`\`\`svg \\n <svg viewBox="0 0 1000 400" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="background-color: white;">...</svg> \\n \`\`\`. 
   Follow it immediately with: **Fig 2.1 Process Flowchart of [Process Name]**.
   - CRITICAL: Use a viewBox height of 400 and place all boxes at y="150" with h="100". This ensures they are vertically centered and visible.
   - Draw standard boxes: \`<rect x="..." y="150" width="200" height="100" fill="#f8fafc" stroke="#3b82f6" stroke-width="3" rx="12"/>\`.
   - Space the boxes out evenly (e.g., x=20, 260, 500, 740). 
   - CRITICAL TEXT WRAPPING: SVG \`<text>\` doesn't wrap! For any labels over 20 characters, you MUST break it manually using \`<tspan>\`: \`<text x="120" y="200" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#000"><tspan x="120" dy="0">Line 1</tspan><tspan x="120" dy="25">Line 2</tspan></text>\`.
2. In the RESULTS section: Include a professional GFM Markdown Data Table (with at least 4 rows and 3 columns) comparing key metrics.
   Precede it immediately with: **Table 3.1 Experimental Metrics and Comparative Analysis**.
3. In the RESULTS section: Include an SVG Graph (Bar chart or Line chart) visualizing the data. 
   Follow it immediately with: **Fig 3.1 Graphical Analysis of [Variables]**.
   - Ensure the \`viewBox="0 0 800 400"\` correctly frames the chart. Don't crowd labels.

Respond EXACTLY in this format, using the exact delimiters:

<<<ABSTRACT>>>
[The abstract text...]
<<<KEYWORDS>>>
[comma, separated, tags, here]
<<<INTRODUCTION>>>
[Introductory text...]
<<<METHODS>>>
[Methods text... Include Fig 2.1 here]
<<<RESULTS>>>
[Results text... Include Table 3.1 and Fig 3.1 here]
<<<CONCLUSION>>>
[Conclusion text...]`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [{ "role": "user", "content": aiPrompt }]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`AI Request failed: ${response.status} - ${errText}`);
        }
        
        const data = await response.json();
        let content = data.choices[0].message.content.trim();

        const parseSection = (block: string, marker: string) => {
             const regex = new RegExp(`<<<${marker}>>>\\n*([\\s\\S]*?)(?=\\n*<<<|$)`);
             const match = block.match(regex);
             return match ? match[1].trim() : "";
        };

        const abstract = parseSection(content, "ABSTRACT");
        const keywords = parseSection(content, "KEYWORDS");
        const introduction = parseSection(content, "INTRODUCTION");
        const methods = parseSection(content, "METHODS");
        const results = parseSection(content, "RESULTS");
        const conclusion = parseSection(content, "CONCLUSION");

        if (!abstract && !introduction) {
             console.error("Failed to parse delimiters", content);
             throw new Error("AI failed to output valid formatted sections");
        }

        return NextResponse.json({
             abstract,
             keywords,
             introduction,
             methods,
             results,
             conclusion
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
