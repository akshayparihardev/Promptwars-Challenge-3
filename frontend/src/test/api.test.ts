import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateFootprint, getInsights, getGamification, simulateWhatIf, saveEntry, getHistory } from '../lib/api';
import { emptyInput } from '../lib/types';

const mockResult = {
  breakdown_kg: { transport: 2000, home: 1000, diet: 1500, consumption: 500 },
  total_annual_kg: 5000,
  total_annual_tonnes: 5.0,
  comparison: { global_average_annual_kg: 4800, sustainable_target_annual_kg: 2000, ratio_to_global_average: 1.04, ratio_to_sustainable_target: 2.5 },
  insight_tag: 'average',
  largest_category: 'transport',
  location_context: { region: 'india', grid_factor: 0.82, annual_km: 8000, benchmark_t: 1.9, benchmark_label: 'India', local_transport_tip: 'Metro', currency_symbol: '₹' },
  equivalencies: { trees_needed: 200, flights_delhi_mumbai: 50, km_petrol_car: 20000, km_indian_rail: 120000 },
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('API client', () => {
  it('calculateFootprint sends POST and returns result', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResult) } as Response);
    const data = emptyInput();
    const res = await calculateFootprint(data);
    expect(fetch).toHaveBeenCalledWith('/api/calculate', expect.objectContaining({ method: 'POST' }));
    expect(res.total_annual_kg).toBe(5000);
  });

  it('calculateFootprint throws on non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, json: () => Promise.resolve({ detail: 'bad' }) } as Response);
    await expect(calculateFootprint(emptyInput())).rejects.toThrow(/Failed to calculate/);
  });

  it('getInsights sends POST and returns insights', async () => {
    const mockInsights = { summary: 'x', comparison: 'y', recommendations: [], source: 'rules' };
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockInsights) } as Response);
    const res = await getInsights(emptyInput(), mockResult as never);
    expect(res.source).toBe('rules');
  });

  it('getInsights throws on error', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
    await expect(getInsights(emptyInput(), mockResult as never)).rejects.toThrow(/insights/i);
  });

  it('getGamification sends POST', async () => {
    const mockGam = { challenges: [], achievements: [] };
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockGam) } as Response);
    const res = await getGamification(emptyInput(), mockResult as never);
    expect(res.challenges).toEqual([]);
  });

  it('getGamification throws on error', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
    await expect(getGamification(emptyInput(), mockResult as never)).rejects.toThrow(/challenges/i);
  });

  it('simulateWhatIf sends POST', async () => {
    const mockWhatIf = { result: mockResult, delta_kg: -500, delta_pct: -10, saves: true };
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockWhatIf) } as Response);
    const res = await simulateWhatIf(emptyInput(), { diet: 'vegan' });
    expect(res.saves).toBe(true);
  });

  it('simulateWhatIf throws on error', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
    await expect(simulateWhatIf(emptyInput(), {})).rejects.toThrow(/what-if/i);
  });

  it('saveEntry sends POST', async () => {
    const mockEntry = { id: '1', created_at: '', device_id: 'd', input: emptyInput(), result: mockResult };
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve(mockEntry) } as Response);
    const res = await saveEntry('d', emptyInput(), mockResult as never);
    expect(res.id).toBe('1');
  });

  it('saveEntry throws on error', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
    await expect(saveEntry('d', emptyInput(), mockResult as never)).rejects.toThrow(/save/i);
  });

  it('getHistory sends GET', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve([]) } as Response);
    const res = await getHistory('d');
    expect(fetch).toHaveBeenCalledWith('/api/entries/d');
    expect(res).toEqual([]);
  });

  it('getHistory throws on error', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
    await expect(getHistory('d')).rejects.toThrow(/history/i);
  });
});
