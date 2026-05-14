// Friendly model id -> upstream model name (per provider) + pricing (INR/M tokens, what we charge customers)
export type ModelMeta = {
  id: string;            // public id used by customers
  display: string;
  tier: 'flash' | 'pro';
  upstream: { ollama: string; deepseek: string };
  // INR per 1M tokens (what we charge user — used for cost reporting + topup deduction)
  priceInPerM: number;
  priceOutPerM: number;
};

export const MODELS: ModelMeta[] = [
  {
    id: 'deepseek-v4-flash',
    display: 'DeepSeek V4 Flash',
    tier: 'flash',
    upstream: { ollama: 'deepseek-v4-flash:cloud', deepseek: 'deepseek-chat' },
    // half of OpenRouter floor ~$0.14/$0.28 -> $0.07/$0.14/M -> ~₹6/₹12 per M (USD 84)
    priceInPerM: 6,
    priceOutPerM: 12,
  },
  {
    id: 'deepseek-v4-pro',
    display: 'DeepSeek V4 Pro',
    tier: 'pro',
    upstream: { ollama: 'deepseek-v4-pro:cloud', deepseek: 'deepseek-reasoner' },
    // OpenRouter retail ~$0.55/$2.20 per M (V4 Pro) -> half -> ~₹23/₹92 per M
    priceInPerM: 23,
    priceOutPerM: 92,
  },
];

export const MODELS_BY_ID: Record<string, ModelMeta> = Object.fromEntries(
  MODELS.map(m => [m.id, m])
);

export function findModel(idOrAlias: string): ModelMeta | null {
  if (MODELS_BY_ID[idOrAlias]) return MODELS_BY_ID[idOrAlias];
  // accept the upstream-style alias too (e.g. deepseek-v4-flash:cloud, deepseek-chat, deepseek-reasoner)
  const lc = idOrAlias.toLowerCase();
  for (const m of MODELS) {
    if (m.upstream.ollama.toLowerCase() === lc) return m;
    if (m.upstream.deepseek.toLowerCase() === lc) return m;
    if (lc.startsWith(m.id)) return m;
  }
  return null;
}
