import { validateCRC32Table, crc32 } from './crc32';


describe('algorithms/crc32', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('should validate CRC32 table', () => {
    const table: number[] = [];

    for(let i = 0; i < 256; i++) {
      let crc = i;

      for(let j = 0; j < 8; j++) {
        crc = (crc & 1 ? 0 : 0xEDB88320) ^ (crc >>> 1);
      }

      table[i] = crc >>> 0;
    }

    expect(table.length).toBe(256);
    expect(() => validateCRC32Table(table)).not.toThrow();
  });

  test('should validate CRC32 table (invalid)', () => {
    const table: number[] = [];

    for(let i = 0; i < 256; i++) {
      let crc = i;

      for(let j = 0; j < 8; j++) {
        crc = (crc & 1 ? 0 : 0xEDB88320) ^ (crc >>> 1);
      }

      table[i] = crc >>> 0;
    }

    table[0] = 0;

    expect(table.length).toBe(256);
    expect(() => validateCRC32Table(table)).toThrow();
  });

  test('should calculate CRC32', () => {
    const data = Buffer.from([0xCBF43926]);
    expect(crc32(data)).toBe(755860989);
  });
});