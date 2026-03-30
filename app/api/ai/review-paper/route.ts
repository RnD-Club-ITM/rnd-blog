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
    2. SAFETY CHECK FIRST: If you detect any vulgarity, hate speech, trolling, unprofessional rants, or inappropriate attacks targeted at any specific organizations, people, or groups, you MUST immediately respond exactly with the string "VIOLATION" and nothing else.
    3. Provide a strict, professional academic review emphasizing areas of improvement.
    4. CRITICAL: If you find that the research paper is already extremely high quality, well-structured, logically sound, and perfectly formatted for IEEE with no flaws, you MUST respond exactly with the string "PERFECT" and nothing else.
    5. Otherwise, return your response purely as a Markdown formatted list of 2-4 specific, actionable recommendations on how the author can improve the credibility, structure, or rigorousness of this paper.
    6. Do not include any conversational filler. Just return "VIOLATION", "PERFECT", or the Markdown bullet points.
    
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
