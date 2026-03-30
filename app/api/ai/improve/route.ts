import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { content } = await req.json();

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

        const prompt = `You are an expert academic editor and research mentor.
    
    Your task is to review and guide the user in structuring their writing for a formal IEEE Research Paper.
    
    1. **Grammar & Polish**: Correct grammatical, spelling, and punctuation errors. Elevate the tone to be formal, academic, and professional.
       - If there is informal language or slang, **rewrite those specific parts** into clear academic English.
       - Do not change the underlying technical logic or meaning.
    2. **Structure Analysis**: Analyze the content formatting against an ideal IEEE research paper structure (Abstract, Keywords, Introduction, Methods, Results, Conclusion).
    
    3. **Preserve Markdown**:
       - **CRITICAL**: Do NOT remove, break, or modify any Markdown syntax for images (e.g., "![alt](url)"), SVGs, links, or code blocks.
       - Ensure all image links and graphs remain exactly where they were relative to the surrounding text.
    
    **OUTPUT FORMAT**:
    Return the **polished academic content first**.
    Then, append this exact separator: <<<SUGGESTIONS>>>
    Then, list specific, actionable suggestions for the user to improve their research paper formatting and academic depth.
    - Use simple circular bullet points (•). 
    - Keep suggestions focused on improving the scientific rigor and structure.
    
    **CRITICAL RULES:**
    - Do NOT add H1/H2 if the user hasn't implied a section, but IF they have, encourage standardizing them (e.g., "# I. INTRODUCTION").
    - Do NOT include the suggestions in the first part.
    - Verify that all "![Image](...)" and "\`\`\`svg" tags present in the input are present in the output.
    
    Content to improve:
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

        // Clean up markdown code blocks if present
        if (fullResponse.startsWith('```markdown')) {
            fullResponse = fullResponse.replace(/^```markdown\s*/, '').replace(/```\s*$/, '');
        } else if (fullResponse.startsWith('```')) {
            fullResponse = fullResponse.replace(/^```\s*/, '').replace(/```\s*$/, '');
        }

        // Split content and suggestions
        const parts = fullResponse.split('<<<SUGGESTIONS>>>');
        const improvedContent = parts[0].trim();
        const suggestions = parts[1] ? parts[1].trim() : null;

        return NextResponse.json({
            content: improvedContent,
            suggestions: suggestions
        });
    } catch (error: any) {
        console.error('AI Improvement Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to improve content with AI' },
            { status: 500 }
        );
    }
}
