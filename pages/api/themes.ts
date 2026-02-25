import type { NextApiRequest, NextApiResponse } from 'next';
import { buildThemesPayload } from '../../server/next-runtime';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(buildThemesPayload());
}
