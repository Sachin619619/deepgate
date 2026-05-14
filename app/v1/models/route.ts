import { MODELS } from '@/lib/models';

export const runtime = 'nodejs';

export async function GET() {
  return Response.json({
    object: 'list',
    data: MODELS.map(m => ({
      id: m.id,
      object: 'model',
      owned_by: 'deepgate',
      display_name: m.display,
      tier: m.tier,
      pricing: {
        prompt_inr_per_million: m.priceInPerM,
        completion_inr_per_million: m.priceOutPerM,
      },
    })),
  });
}
