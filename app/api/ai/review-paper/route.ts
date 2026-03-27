import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { content, title } = await req.json();

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'OPENROUTER_API_KEY is not configured in .env' },
                { status: 500 }
            );
        }

        const prompt = `You are a peer-reviewer for a prestigious IEEE academic journal evaluating a manuscript titled "${title}".
    
    1. Read the provided research paper content carefully.
    2. Provide a strict, professional academic review emphasizing areas of improvement.
    3. Return your response purely as a Markdown formatted list of 3-5 specific, actionable recommendations on how the author can improve the credibility, structure, or rigorousness of this paper.
    4. Do not include any conversational filler like "Here is your review". Just return the Markdown bullet points.
    
    Paper Content:
    ${content}`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    { "role": "user", "content": prompt }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        let fullResponse = data.choices[0].message.content;

        return NextResponse.json({
            recommendations: fullResponse.trim()
        });
    } catch (error: any) {
        console.error('AI Review Error:', error);
        return NextResponse.json(
            { error: error.message || 'An error occurred during paper review' },
            { status: 500 }
        );
    }
}
