import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';
import { SHGS } from '@/src/lib/demoData';

// Bot token — prefer env var, fall back to hard-coded for local dev
const BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ?? '8678801136:AAEhbY9P63KbtUKpMOJtETXHeyLWioE7mV8';

// In-memory Set tracking SHG IDs already assigned via Telegram this session.
// Resets on server cold-start — acceptable for demo use.
const usedSHGIds = new Set<string>();

/** Helper: send a plain-text reply back to a Telegram chat */
async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

/**
 * POST /api/telegram/webhook
 * Receives Telegram Bot updates. Always returns HTTP 200 so Telegram never retries.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // 1. Parse Telegram update payload
    const update = await req.json();
    console.log('[Telegram Webhook] Received update:', JSON.stringify(update));

    const message = update?.message;

    // Silently acknowledge non-text events (edits, reactions, polls…)
    if (!message?.text) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const chatId: number = message.chat.id;
    const rawText: string = message.text;
    const text: string = rawText.trim().toLowerCase();
    const firstName: string = message.from?.first_name ?? 'SHG Member';

    console.log(`[Telegram] chat_id=${chatId} | text="${rawText}"`);

    // 2. Only act on pickup-intent messages / commands
    const isPickupRequest =
      text.includes('pickup') ||
      text.includes('collect') ||
      text.includes('garbage') ||
      text.includes('waste') ||
      text.startsWith('/start') ||
      text.startsWith('/request');

    if (!isPickupRequest) {
      await sendTelegramMessage(
        chatId,
        `Hi ${firstName}! 👋\n\nSend "request pickup" or tap /request to log a plastic collection request.\n\nAvailable commands:\n/request — Log a new pickup\n/start — Get started`
      );
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // 3. Pick a random unused SHG from the Raipur pool
    const available = SHGS.filter((s) => !usedSHGIds.has(s.id));

    if (available.length === 0) {
      await sendTelegramMessage(
        chatId,
        `⚠️ All SHG collection points have already been assigned in this session. Please try again after a server restart.`
      );
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const randomSHG = available[Math.floor(Math.random() * available.length)];
    usedSHGIds.add(randomSHG.id);

    // 4. Insert pickup request into Supabase — mirrors ResidentMap simulateMissedCall
    const supabase = await createClient();

    const { error: dbError } = await supabase.from('pickup_requests').insert([
      {
        user_id: randomSHG.id,  // e.g. "Res-Pandri-A"
        latitude: randomSHG.lat,
        longitude: randomSHG.lng,
        status: 'pending',
        pet_weight: parseFloat((Math.random() * 8 + 1).toFixed(1)),
        hdpe_weight: parseFloat((Math.random() * 2 + 1).toFixed(1)),
        ldpe_weight: 0,
        pp_weight: 0,
      },
    ]);

    if (dbError) {
      console.error('[Telegram] Supabase insert error:', dbError.message);
      await sendTelegramMessage(
        chatId,
        `❌ Something went wrong logging your request. Please try again in a moment.`
      );
      // Still 200 — Telegram must not retry
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    console.log(
      `[Telegram] Pickup logged → SHG: ${randomSHG.id} at (${randomSHG.lat}, ${randomSHG.lng})`
    );

    // 5. Confirm back to the user on Telegram
    await sendTelegramMessage(
      chatId,
      `✅ EcoRoute Confirmed!\n\nHi ${firstName}, your pickup request has been logged!\n\n📍 SHG Point: ${randomSHG.id}\n🗺️ Location: ${randomSHG.lat.toFixed(4)}, ${randomSHG.lng.toFixed(4)}\n\nA collector truck has been routed to your area. Track your request in real-time on the platform.`
    );

    // 6. Always return 200 OK
    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (error) {
    // Catch-all: log error but ALWAYS return 200 to prevent Telegram retry storms
    console.error('[Telegram] Unhandled webhook error:', error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}