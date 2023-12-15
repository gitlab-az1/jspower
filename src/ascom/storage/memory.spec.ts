import { AsyncVirtualMemoryStorageDriver } from './memory';


describe('ascom/AyncVirtualMemoryStorageDriver', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('should write and read data', () => {
    const vm = new AsyncVirtualMemoryStorageDriver();

    vm.write(0x0, 'Hello, world!');
    vm.write(0x1, 'Hello, world!');

    const block1 = vm.read(0x0);
    const block2 = vm.read(0x1);

    expect(block1).not.toBeNull();
    expect(block2).not.toBeNull();

    expect(block1?.address).toBe(0x0);
    expect(block2?.address).toBe(0x1);

    expect(block1?.data).toBe('Hello, world!');
    expect(block2?.data).toBe('Hello, world!');
  });

  test('should write and read buffer data', () => {
    const vm = new AsyncVirtualMemoryStorageDriver();
    
    vm.writeBuffer(0x0, Buffer.from('Hello, world!'));
    vm.writeBuffer(0x1, Buffer.from('Hello, world!'));
    
    const block1 = vm.readBuffer(0x0);
    const block2 = vm.readBuffer(0x1);
    
    expect(block1).not.toBeNull();
    expect(block2).not.toBeNull();
    
    expect(block1).toEqual(Buffer.from('Hello, world!'));
    expect(block2).toEqual(Buffer.from('Hello, world!'));
  });

  test('should throw an error when reading a buffer as a literal', () => {
    const vm = new AsyncVirtualMemoryStorageDriver();
    
    vm.writeBuffer(0x0, Buffer.from('Hello, world!'));
    
    expect(() => {
      vm.read(0x0);
    }).toThrow();
  });

  test('should throw an error when reading a literal as a buffer', () => {
    const vm = new AsyncVirtualMemoryStorageDriver();
        
    vm.write(0x0, 'Hello, world!');
        
    expect(() => {
      vm.readBuffer(0x0);
    }).toThrow();
  });

  test('should return the correct length when empty', () => {
    const vm = new AsyncVirtualMemoryStorageDriver();  
    expect(vm.length).toBe(0);
  });

  test('should return the correct length', () => {
    const vm = new AsyncVirtualMemoryStorageDriver();
        
    vm.write(0x0, 'Hello, world!');
    vm.write(0x1, 'Hello, world!');
        
    expect(vm.length).toBe(2);
  });

  test('should clear the storage', () => {
    const vm = new AsyncVirtualMemoryStorageDriver();
    
    vm.write(0x0, 'Hello, world!');
    vm.write(0x1, 'Hello, world!');
    
    vm.empty();
    
    expect(vm.read(0x0)).toBeNull();
    expect(vm.length).toBe(0);
  });

  test('should return a serializable `array` object', () => {
    const vm = new AsyncVirtualMemoryStorageDriver();
    
    vm.write(0x0, 'Hello, world!');
    vm.writeBuffer(0x1, Buffer.from('Hello, world!'));
    

    /*
      readonly signature: string;
      readonly address: number;
      readonly data: number[];
      readonly size: number;
    */

    const array = vm.serializeContext();
    
    expect(array).toBeInstanceOf(Array);
    expect(array.length).toBe(2);

    expect(array[0]).toHaveProperty('signature');
    expect(array[0]).toHaveProperty('address');
    expect(array[0]).toHaveProperty('data');
    expect(array[0]).toHaveProperty('size');

    expect(array[1]).toHaveProperty('signature');
    expect(array[1]).toHaveProperty('address');
    expect(array[1]).toHaveProperty('data');
    expect(array[1]).toHaveProperty('size');
  });
});