import { Process } from './core';


describe('process/core process-promise', () => {
  test('it should be ok', () => {
    expect(Math.sqrt(25)).toBe(5);
  });

  test('process promise will be instantiated', () => {
    const process = new Process('ls');
    expect(process).toBeInstanceOf(Process);
  });

  test('process promise will be instantiated with options', () => {
    const process = new Process('ls', undefined, { verbose: true });
    expect(process).toBeInstanceOf(Process);
  });

  test('process promise change directory with `cd` method', () => {
    const p = new Process('ls', undefined, { verbose: false });
    expect(p.cwd).toBe(process.cwd());

    p.cd('/tmp');
    expect(p.cwd).toBe('/tmp');
  });
});