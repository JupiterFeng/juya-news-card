import type { NextApiRequest, NextApiResponse } from 'next';
import { renderPng } from '../../server/next-runtime';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const png = await renderPng(body, req.headers.authorization || null);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(png);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.toLowerCase().includes('unauthorized') ? 401 : 400;
    return res.status(status).json({ error: message });
  }
}
