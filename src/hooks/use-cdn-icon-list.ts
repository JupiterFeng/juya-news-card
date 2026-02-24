import { useEffect, useState } from 'react';

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function parseIconListResponse(payload: unknown): string[] {
  if (Array.isArray(payload)) {
    return toStringList(payload);
  }
  if (payload && typeof payload === 'object' && 'icons' in payload) {
    return toStringList((payload as { icons?: unknown }).icons);
  }
  return [];
}

export function useCdnIconList(enabled: boolean, cdnUrl: string): string[] {
  const [iconList, setIconList] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled || !cdnUrl) {
      setIconList([]);
      return;
    }

    const abortController = new AbortController();
    fetch(cdnUrl, { signal: abortController.signal })
      .then(response => response.json())
      .then(payload => {
        setIconList(parseIconListResponse(payload));
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Failed to fetch icon CDN list:', error);
        setIconList([]);
      });

    return () => abortController.abort();
  }, [cdnUrl, enabled]);

  return iconList;
}
