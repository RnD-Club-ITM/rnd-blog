import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Config missing' }, { status: 500 });
        }

        const aiPrompt = `You are a talented data visualization expert. 
Generate a valid SVG illustrating: "${prompt}". 
The output MUST be ONLY valid SVG code. DO NOT wrap it in backticks, markdown, or any explanation text.
Start exactly with <svg> and end with </svg>. 

CRITICAL REQUIREMENTS:
- Use a 100% fully responsive viewport with viewBox="0 0 800 500" or similar, DO NOT set rigid width/height attributes on the <svg> tag that squish it! Use width="100%" height="auto".
- Structure the chart professionally with generous margins/padding so text NEVER overlaps the edges or other text.
- Use font-family="sans-serif", and rotate x-axis labels if they are long.
- Include a crisp white background <rect width="100%" height="100%" fill="white" rx="8" />.
- Use modern, beautiful, vibrant colors (Tailwind-like palettes) and smooth lines or polished bar shapes.`;

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

        if (!response.ok) throw new Error("AI Request failed");
        
        const data = await response.json();
        let svg = data.choices[0].message.content.trim();
        
        // Cleanup if the AI still included markdown
        if (svg.startsWith('```svg')) {
            svg = svg.replace(/^```svg\s*/i, '');
        } else if (svg.startsWith('```xml')) {
             svg = svg.replace(/^```xml\s*/i, '');
        } else if (svg.startsWith('```')) {
            svg = svg.replace(/^```\s*/, '');
        }
        svg = svg.replace(/```\s*$/, '');
        svg = svg.trim();

        return NextResponse.json({ svg });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
