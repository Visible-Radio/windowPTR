import { describe, test, expect } from 'vitest';
import deepEqual from '../deepEqual';

describe('Arrays of arrays', () => {
  test('Arrays of empty arrays', () => {
    const a = [[], [], []];
    const b = [...a];
    expect(deepEqual(a, b)).toBe(true);

    const c = [[], []];

    expect(deepEqual(a, c)).toBe(false);
  });
});
test('Arrays of number arrays', () => {
  const d = [
    [1, 2, 3],
    [4, 5, 6, 7],
  ];
  const e = [...d];

  const f = [
    [1, 2, 3],
    [4, 5, 6, 7, 8],
  ];
  expect(deepEqual(d, e)).toBe(true);
  expect(deepEqual(d, f)).toBe(false);
});
describe('Arrays of pimitives', () => {
  test('numbers', () => {
    const a = [1, 2, 3];
    const b = [...a];

    expect(deepEqual(a, b)).toBe(true);

    const c = [1, 2, 3, 4];

    expect(deepEqual(a, c)).toBe(false);
  });
});

describe('objects', () => {
  test('shallow object', () => {
    const a = { myKey: 'eh' };
    const b = { ...a };
    expect(deepEqual(a, b)).toBe(true);
  });

  test('two empty objects', () => {
    expect(deepEqual({}, {})).toBe(true);
  });
  test('two empty arrays', () => {
    expect(deepEqual([], [])).toBe(true);
  });
  test('Empty array vs empty object', () => {
    expect(deepEqual({}, [])).toBe(true);
  });
});

describe('Arrays of objects', () => {
  test('arrays of different objects', () => {
    const a = [{ x: '1', y: '2' }, {}];
    const b = [
      { x: '1', y: '2' },
      { x: '13', y: '12' },
    ];
    expect(deepEqual(a, b)).toBe(false);
  });

  test('Equivalent arrays of empty objects', () => {
    const a = [{}, {}];
    const b = [...a];
    expect(deepEqual(a, b)).toBe(true);
  });
  test('Equivalent arrays of objects', () => {
    const c = [
      { x: '1', y: '2' },
      { x: '13', y: '12' },
    ];
    const d = [...c];

    expect(deepEqual(c, d)).toBe(true);
  });
});

describe('primitivies', () => {
  test('null, undefined, number, string, boolean', () => {
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
    expect(deepEqual(undefined, null)).toBe(false);
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual(1, 0)).toBe(false);
    expect(deepEqual('a', 'a')).toBe(true);
    expect(deepEqual('a', 'b')).toBe(false);
    expect(deepEqual(true, true)).toBe(true);
    expect(deepEqual(true, false)).toBe(false);
    expect(deepEqual(0, false)).toBe(false);
    expect(deepEqual(0, undefined)).toBe(false);

    expect(deepEqual(false, '')).toBe(false);
    expect(deepEqual(false, null)).toBe(false);
    expect(deepEqual(false, undefined)).toBe(false);
  });
});

describe('Nested Objects', () => {
  test('Eqivalent objects', () => {
    const a = {
      flag1: true,
      flag2: false,
      splitDns: [
        {
          someOtherFlag: true,
          searchDomain: 'thing.com',
          addresses: ['1.1.1.1', '2.2.2.2', '3.3.3.3'],
        },
      ],
      globalDns: [
        {
          name: 'global1',
          addresses: ['4.4.4.4'],
        },
      ],
    };
    expect(deepEqual(a, { ...a })).toBe(true);
  });
  test('different objects', () => {
    const a = {
      flag1: true,
      flag2: false,
      splitDns: [
        {
          someOtherFlag: true,
          searchDomain: 'thing.com',
          addresses: ['1.1.1.1', '2.2.2.2', '3.3.3.3'],
        },
      ],
      globalDns: [
        {
          name: 'global1',
          addresses: ['4.4.4.4'],
        },
      ],
    };

    const b = {
      ...a,
      globalDns: [...a.globalDns, { name: 'new', addresses: ['dsfsdf'] }],
    };

    const c = {
      ...a,
      newKey: 'huh?',
    };

    expect(deepEqual(a, c)).toBe(false);
    expect(deepEqual(a, b)).toBe(false);
  });
});

describe('functions', () => {
  const a = {
    callbacks: {
      onSuccess() {
        console.log('it worked');
      },
    },
  };

  const b = {
    callbacks: {
      onSuccess() {
        console.log('it worked');
      },
    },
  };

  const d = {
    callbacks: [
      () => {
        console.log('hi');
      },
      () => {
        console.log('there');
      },
    ],
  };

  const e = {
    callbacks: [
      () => {
        console.log('hi');
      },
      () => {
        console.log('there');
      },
    ],
  };

  const c = {
    callbacks: {
      onSuccess() {
        console.info('it worked');
      },
    },
  };

  const f = {
    callbacks: [
      () => {
        console.log('hello');
      },
      () => {
        console.log('world');
      },
    ],
  };
  test('Identical functions', () => {
    expect(deepEqual(console.log, console.log)).toBe(true);
  });
  test('Identical Implementations', () => {
    expect(
      deepEqual(
        () => ({}),
        () => ({})
      )
    ).toBe(true);
  });

  test('Identical implementations: Object with functions', () => {
    expect(deepEqual(a, b)).toBe(true);
  });
  test('Identical implementations: array of functions', () => {
    expect(deepEqual(d, e)).toBe(true);
  });
  test('different implementations: Object with functions', () => {
    expect(deepEqual(a, c)).toBe(false);
  });
  test('different implementations: array of functions', () => {
    expect(deepEqual(d, f)).toBe(false);
  });
});
