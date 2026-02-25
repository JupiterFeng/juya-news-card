import type { NextApiRequest, NextApiResponse } from 'next';
import { generateContent } from '../../server/next-runtime';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const inputText = String((req.body as { inputText?: string } | undefined)?.inputText || '');
    const data = await generateContent(inputText, req.headers.authorization || null);
    return res.status(200).json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const lowered = message.toLowerCase();
    const status = lowered.includes('unauthorized')
      ? 401
      : lowered.includes('timed out') || lowered.includes('timeout') || lowered.includes('abort')
        ? 504
        : lowered.includes('upstream request failed') || lowered.includes('fetch failed') || lowered.includes('econnrefused') || lowered.includes('enotfound')
          ? 502
      : lowered.includes('not configured')
        ? 503
        : 400;
    return res.status(status).json({ error: message });
  }
}
