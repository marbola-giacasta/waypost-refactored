const cache = new Map<string, string>();

export const translateText = async (text: string, lang: string): Promise<string> => {
  if (!text || lang === 'no') return text;
  const key = `${lang}:${text.length}:${text.slice(0, 80)}`;
  if (cache.has(key)) return cache.get(key)!;
  try {
    const chunks = text.match(/[\s\S]{1,1800}(?:\s|$)/g) ?? [text];
    const parts  = await Promise.all(
      chunks.map(async chunk => {
        const p = new URLSearchParams({ client: 'gtx', sl: 'auto', tl: lang, dt: 't', q: chunk });
        const r = await fetch(`https://translate.googleapis.com/translate_a/single?${p}`);
        const d = await r.json();
        return (d[0] as [string][]).map(i => i[0]).join('');
      }),
    );
    const result = parts.join('');
    cache.set(key, result);
    return result;
  } catch {
    return text;
  }
};
