import { PasswordGenerator } from './generate';


describe('crypto/password PasswordGenerator', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('it should generate a password with custom length and default charset', () => {
    const passwordGenerator = new PasswordGenerator();
    const password = passwordGenerator.generatePassword({
      length: 10,
    });

    expect(password).toBeDefined();
    expect(typeof password).toBe('string');
    expect(password.length).toBe(10);
  });

  test('it should generate a password with default length and custom characters', () => {
    const passwordGenerator = new PasswordGenerator();
    const password = passwordGenerator.generatePassword({
      special: true,
      number: true,
      ambiguous: false,
    });

    expect(password).toBeDefined();
    expect(typeof password).toBe('string');
    expect(password.length).toBe(14);

    // eslint-disable-next-line no-useless-escape
    expect(password).toMatch(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/);
  });

  test('it should generate a password with numbers only', () => {
    const passwordGenerator = new PasswordGenerator();
    const password = passwordGenerator.generatePassword({
      special: false,
      number: true,
      ambiguous: false,
      lowercase: false,
      uppercase: false,
      length: 20,
    });

    expect(password).toBeDefined();
    expect(typeof password).toBe('string');
    expect(password.length).toBe(20);

    // eslint-disable-next-line no-useless-escape
    expect(password).toMatch(/^[0-9]+$/);
  });

  test('it should generate a password with lowercase only', () => {
    const passwordGenerator = new PasswordGenerator();
    const password = passwordGenerator.generatePassword({
      special: false,
      number: false,
      ambiguous: false,
      lowercase: true,
      uppercase: false,
      length: 20,
    });

    expect(password).toBeDefined();
    expect(typeof password).toBe('string');
    expect(password.length).toBe(20);

    // eslint-disable-next-line no-useless-escape
    expect(password).toMatch(/^[a-z]+$/);
  });

  test('it should generate a password with uppercase only', () => {
    const passwordGenerator = new PasswordGenerator();
    const password = passwordGenerator.generatePassword({
      special: false,
      number: false,
      ambiguous: false,
      lowercase: false,
      uppercase: true,
      length: 20,
    });

    expect(password).toBeDefined();
    expect(typeof password).toBe('string');
    expect(password.length).toBe(20);

    // eslint-disable-next-line no-useless-escape
    expect(password).toMatch(/^[A-Z]+$/);
  });

  test('it should generate a password with special characters only', () => {
    const passwordGenerator = new PasswordGenerator();
    const password = passwordGenerator.generatePassword({
      special: true,
      number: false,
      ambiguous: false,
      lowercase: false,
      uppercase: false,
      length: 20,
    });

    expect(password).toBeDefined();
    expect(typeof password).toBe('string');
    expect(password.length).toBe(20);

    // eslint-disable-next-line no-useless-escape
    expect(password).toMatch(/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/);
  });

  test('it should not generate a password with ambiguous characters only', () => {
    const passwordGenerator = new PasswordGenerator();
    const password = passwordGenerator.generatePassword({
      special: false,
      number: false,
      ambiguous: true,
      lowercase: false,
      uppercase: false,
      length: 20,
    });

    expect(password).toBeDefined();
    expect(typeof password).toBe('string');
    expect(password.length).toBe(0);
    expect(password).toBe('');
  });

  test('it should generate a password with custom length of specific characters', () => {
    const passwordGenerator = new PasswordGenerator();
    const password = passwordGenerator.generatePassword({
      special: true,
      number: true,
      ambiguous: false,
      lowercase: false,
      uppercase: false,
      minSpecial: 10,
      length: 20,
    });

    expect(password).toBeDefined();
    expect(typeof password).toBe('string');
    expect(password.length).toBe(20);

    // eslint-disable-next-line no-useless-escape
    expect(password).toMatch(/^([!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+|[0-9]+)*$/);
  });

  test('it should generate a phassphrase', () => {
    const passwordGenerator = new PasswordGenerator();
    const password = passwordGenerator.generatePassphrase();

    expect(password).toBeDefined();
    expect(typeof password).toBe('string');
    expect(password.split('-').length).toBe(3);
  });

  test('it should generate a phassphrase with custom length', () => {
    const passwordGenerator = new PasswordGenerator();
    const password = passwordGenerator.generatePassphrase({
      numWords: 5,
    });

    expect(password).toBeDefined();
    expect(typeof password).toBe('string');
    expect(password.split('-').length).toBe(5);
  });

  test('it should generate a phassphrase with custom separator', () => {
    const passwordGenerator = new PasswordGenerator();
    const password = passwordGenerator.generatePassphrase({
      wordSeparator: ' ',
    });

    expect(password).toBeDefined();
    expect(typeof password).toBe('string');
    expect(password.split(' ').length).toBe(3);
  });

  test('it should generate a phassphrase with custom length and custom separator', () => {
    const passwordGenerator = new PasswordGenerator();
    const password = passwordGenerator.generatePassphrase({
      numWords: 8,
      wordSeparator: '\n',
    });

    expect(password).toBeDefined();
    expect(typeof password).toBe('string');
    expect(password.split('\n').length).toBe(8);
  });

  test('it should generate a phassphrase with the first letter capitalized', () => {
    const passwordGenerator = new PasswordGenerator();
    const password = passwordGenerator.generatePassphrase({
      capitalize: true,
    });

    expect(password).toBeDefined();
    expect(typeof password).toBe('string');
    expect(password.split('-').length).toBe(3);
    expect(password).toMatch(/(^[A-Z]-)*/);
  });
});