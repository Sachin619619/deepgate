import { ModelMeta } from './models';

export function upstreamConfig() {
  const provider = (process.env.UPSTREAM_PROVIDER || 'ollama') as 'ollama' | 'deepseek';
  const apiKey = process.env.UPSTREAM_API_KEY || '';
  const baseUrl =
    process.env.UPSTREAM_BASE_URL ||
    (provider === 'ollama' ? 'https://ollama.com/v1' : 'https://api.deepseek.com/v1');
  return { provider, apiKey, baseUrl };
}

export function upstreamModelName(m: ModelMeta) {
  const { provider } = upstreamConfig();
  return provider === 'ollama' ? m.upstream.ollama : m.upstream.deepseek;
}
