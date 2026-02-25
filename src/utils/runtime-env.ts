type EnvSource = Record<string, string | undefined>;

function readFromImportMeta(key: string): string {
  try {
    const env = (import.meta as unknown as { env?: EnvSource }).env;
    return String(env?.[key] || '').trim();
  } catch {
    return '';
  }
}

function readFromProcess(key: string): string {
  if (typeof process === 'undefined' || !process.env) return '';
  return String(process.env[key] || '').trim();
}

function toNextPublicKey(viteKey: string): string {
  if (!viteKey.startsWith('VITE_')) return viteKey;
  return `NEXT_PUBLIC_${viteKey.slice('VITE_'.length)}`;
}

export function readPublicEnv(viteKey: string): string {
  const fromMeta = readFromImportMeta(viteKey);
  if (fromMeta) return fromMeta;

  const nextPublicKey = toNextPublicKey(viteKey);
  const fromNextPublic = readFromProcess(nextPublicKey);
  if (fromNextPublic) return fromNextPublic;

  const fromOriginal = readFromProcess(viteKey);
  if (fromOriginal) return fromOriginal;

  return '';
}

export function readServerEnv(serverKey: string): string {
  return readFromProcess(serverKey);
}
