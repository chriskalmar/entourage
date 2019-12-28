import { checkConfig } from './command';

describe('command', () => {
  const url = 'http://localhost:5858';
  const profile = 'demo';
  const timeout = 123;

  it('should check config', () => {
    expect(checkConfig({ url, profile })).toBe(true);
    expect(checkConfig({ url, profile, timeout })).toBe(true);
  });

  it('should fail on invalid config', () => {
    expect(() => checkConfig()).toThrow();
    expect(() => checkConfig('abc')).toThrow();
    expect(() => checkConfig({ url })).toThrow();
    expect(() => checkConfig({ profile })).toThrow();
    expect(() => checkConfig({ timeout })).toThrow();
    expect(() => checkConfig({ url, profile, timeout: 'no number' })).toThrow();
  });
});
