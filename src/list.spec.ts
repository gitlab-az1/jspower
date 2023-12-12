import List from './list';
import { enumerateIterableIterator } from './enumerator';


describe('List', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('it should create a list', () => {
    const list = new List();
    expect(list).toBeInstanceOf(List);
  });

  test('it should push an element', () => {
    const list = new List();
    list.push(1);
    expect(list.length).toBe(1);
  });

  test('it should push two elements', () => {
    const list = new List();
    list.push(1);
    list.push(2);
    expect(list.length).toBe(2);
  });

  test('it should convert the list to a tree representation', () => {
    const list = new List();
    list.push(1);
    list.push(2);
    list.push(3);
    list.push(4);
    list.push(5);
    
    expect(list.tree()).toEqual({
      'key': 'root',
      'code': 0,
      'value': null,
      'next': {
        'key': '1',
        'code': 4,
        'value': 1,
        'next': {
          'key': '2',
          'code': 4,
          'value': 2,
          'next': {
            'key': '3',
            'code': 6,
            'value': 3,
            'next': {
              'key': '4',
              'code': 7,
              'value': 4,
              'next': {
                'key': '5',
                'code': 9,
                'value': 5,
                'next': null,
              },
            },
          },
        },
      },
    });
  });

  test('it should convert the list to an array representation', () => {
    const list = new List();
    list.push(1);
    list.push(2);
    list.push(3);
    list.push(4);
    list.push(5);
    
    expect(list.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  test('it should enumerate the tree', () => {
    const list = new List();
    list.push(1);
    list.push(2);
    list.push(3);
    list.push(4);
    list.push(5);
    
    expect(enumerateIterableIterator(list.tree()!)[3]).toEqual([
      3,
      {
        'key': '1',
        'code': 4,
        'value': 1,
        'next': {
          'key': '2',
          'code': 4,
          'value': 2,
          'next': {
            'key': '3',
            'code': 6,
            'value': 3,
            'next': {
              'key': '4',
              'code': 7,
              'value': 4,
              'next': {
                'key': '5',
                'code': 9,
                'value': 5,
                'next': null,
              },
            },
          },
        },
      },
    ]);
  });
});