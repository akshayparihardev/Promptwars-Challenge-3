import { describe, it, expect, beforeEach } from 'vitest';
import { getDeviceId } from '../lib/deviceId';

describe('getDeviceId', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates and persists a device ID', () => {
    const id = getDeviceId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('returns the same ID on subsequent calls', () => {
    const first = getDeviceId();
    const second = getDeviceId();
    expect(first).toBe(second);
  });

  it('returns a new ID after localStorage is cleared', () => {
    const first = getDeviceId();
    localStorage.clear();
    const second = getDeviceId();
    expect(first).not.toBe(second);
  });
});
