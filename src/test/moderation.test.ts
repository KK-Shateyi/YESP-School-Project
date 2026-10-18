import { describe, expect, it } from 'vitest';
import { rejectionError } from '@/lib/validation';

describe('Listing rejection', () => {
  it('requires a reason of at least five non-padding characters', () => {
    expect(rejectionError('')).not.toBe('');
    expect(rejectionError('  four  ')).not.toBe('');
    expect(rejectionError('  valid  ')).toBe('');
  });
});