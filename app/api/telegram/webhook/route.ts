import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const update = await req.json();

    // 1. Safely extract message details
    const message = update.message;
    
    // Acknowledge non-text messages (like edits or system events) silently to prevent Telegram retries
    if (!message || !message.text) {
      return NextResponse.json({ ok: true }); 
    }

    const chatId = message.chat.id;
    const firstName = message.from?.first_name || 'Resident';
    const text = message.text;

    const supabase = await createClient();

    // 2. Fetch a dynamic user_id as a fallback
    let userId;
    const { data: user, error: userError } = await supabase.from('users').select('id').limit(1).single();

    if (userError || !user) {
        console.error('Error fetching a user:', userError);
        // Fallback to a default or handle error appropriately
        return NextResponse.json({ ok: true });
    }
    userId = user.id;


    // 3. Insert the pickup request into Supabase
    const { error: dbError } = await supabase.from('pickup_requests').insert([
      {
        latitude: 21.2050, // Kurud Village coordinates
        longitude: 81.3350,
        user_id: userId,
        status: 'pending',
      },
    ]);

    if (dbError) {
      console.error('Supabase Insert Error:', dbError);
      return NextResponse.json({ ok: true });
    }

    // 3. Send confirmation back via Telegram
    const botToken = '8678801136:AAEhbY9P63KbtUKpMOJtETXHeyLWioE7mV8';
    const replyText = `✅ EcoRoute: Hi ${firstName}, your pickup request has been logged! A truck has been routed to your location.`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText,
      }),
    });

    // 4. Return 200 OK so Telegram knows we got it
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ ok: true }); 
  }
}