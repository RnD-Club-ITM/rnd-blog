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

In your response, you MUST include:
1. In the METHODS section: Include an SVG Process Flowchart showing the architecture/steps of your methodology. Use \`\`\`svg \\n <svg viewBox="0 0 800 400" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="background-color: white;">...</svg> \\n \`\`\`. The flowchart should be a professional block diagram with rectangular nodes, text, and arrows.
2. In the RESULTS section: Include a professional GFM Markdown Data Table (with at least 4 rows and 3 columns) comparing key metrics or hardware specifications.
3. In the RESULTS section: Include an SVG Graph (Bar chart or Line chart) visualizing the abstract data. Use \`\`\`svg \\n <svg viewBox="0 0 800 400" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="background-color: white;">...</svg> \\n \`\`\`. Give it a white background, black axes, padding margins, and use standard professional chart aesthetics.

Respond EXACTLY in this format, using the exact delimiters:

<<<ABSTRACT>>>
[The abstract text...]
<<<KEYWORDS>>>
[comma, separated, tags, here]
<<<INTRODUCTION>>>
[Introductory text...]
<<<METHODS>>>
[Methods text... Include your SVG flowchart here]
<<<RESULTS>>>
[Results text... Include your Markdown table and SVG Graph here]
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
