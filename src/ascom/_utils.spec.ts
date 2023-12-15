import { errnoMessage } from './_utils';


describe('ascom/utils.private', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('errnoMessage should return a string', () => {
    expect(typeof errnoMessage(0)).toBe('string');
    expect(errnoMessage(0)).toBe('Success');

    expect(typeof errnoMessage(-1)).toBe('string');
    expect(errnoMessage(-1)).toBe('Operation not permitted');
  });
});