'use client';

import { useEffect, useState } from 'react';
import NextClientApp from '../src/next-client-app';

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <NextClientApp />;
}
