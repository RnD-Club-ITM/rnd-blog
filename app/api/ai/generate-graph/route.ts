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
        The output MUST be a JSON object with two fields: 
        1. "svg": The full valid SVG code (100% responsive). 
        2. "title": A concise, formal academic title for this graph (e.g., "Accuracy Comparison Across Models").

        SVG DESIGN SPECIFICATIONS (BOUTIQUE ACADEMIC STYLE):
        - ViewBox: "0 0 800 450". Use Inter or sans-serif fonts.
        - Background: <rect width="100%" height="100%" fill="white" rx="12" />.
        - Palette: Use HSL high-contrast professional colors (Blue: hsl(217, 91%, 60%), Emerald: hsl(142, 71%, 45%), Orange: hsl(32, 95%, 44%)).
        - Aesthetics: Use rounded corners (rx="6") for bars, thick stroke-width (3px) for lines, and clean dashed grid lines (#cbd5e1).
        - Labels: Ensure all axes are clearly labeled with bold, large text. Data values should be visible above points/bars.
        - Structure: Ensure generous padding (min 60px) so no labels are cut off.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [{ "role": "user", "content": aiPrompt }],
                "response_format": { "type": "json_object" }
            })
        });

        if (!response.ok) throw new Error("AI Request failed");
        
        const resData = await response.json();
        const content = JSON.parse(resData.choices[0].message.content);
        let svg = content.svg.trim();
        let title = content.title.trim();
        
        // Cleanup if markdown still present in the svg field
        svg = svg.replace(/^```(svg|xml)?\s*/i, '').replace(/```\s*$/, '').trim();

        return NextResponse.json({ svg, title });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
