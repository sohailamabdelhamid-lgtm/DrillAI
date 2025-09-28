import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    console.log('Test OpenAI API endpoint called');
    console.log('Environment check:', {
      hasKey: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY?.length,
      keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10)
    });

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-api-key-here') {
      return NextResponse.json({ 
        success: false, 
        error: 'OpenAI API key not configured',
        hasKey: !!process.env.OPENAI_API_KEY,
        keyLength: process.env.OPENAI_API_KEY?.length
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say 'Hello from OpenAI!' if you can hear me." }
      ],
      max_tokens: 50,
    });

    const response = completion.choices[0]?.message?.content;

    return NextResponse.json({ 
      success: true, 
      response,
      model: completion.model,
      usage: completion.usage
    });
    
  } catch (error) {
    console.error('Test OpenAI error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    });
  }
}
