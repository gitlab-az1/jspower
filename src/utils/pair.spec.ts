import Pair from './pair';


describe('utils/pair', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('it should create a pair', () => {
    const pair = new Pair(1, 2);
    expect(pair.first).toBe(1);
    expect(pair.second).toBe(2);
  });

  test('it should set first', () => {
    const pair = new Pair(1, 2);
    expect(pair.first).toBe(1);
    pair.setFirst(3);
    expect(pair.first).toBe(3);
  });

  test('it should set second', () => {
    const pair = new Pair(1, 2);
    expect(pair.second).toBe(2);
    pair.setSecond(3);
    expect(pair.second).toBe(3);
  });

  test('it should validate', () => {
    const pair = new Pair(1, 1, (first, second) => first === second);
    expect(pair.first).toBe(1);
    expect(pair.second).toBe(1);
    expect(() => pair.setFirst(3)).toThrow();
    expect(() => pair.setSecond(3)).toThrow();
  });

  test('it should validate', () => {
    const pair = new Pair(1, 1, (first, second) => first === second);
    expect(pair.first).toBe(1);
    expect(pair.second).toBe(1);
    expect(() => pair.setFirst(1)).not.toThrow();
    expect(() => pair.setSecond(1)).not.toThrow();
  });
});