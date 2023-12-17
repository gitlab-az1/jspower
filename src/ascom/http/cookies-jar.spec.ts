import { CookiesJar } from './cookies-jar';


describe('ascom/http.cookiesjar', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('should set a cookie', () => {
    const jar = new CookiesJar();
    jar.setCookie('foo', 'bar');
    
    const cookie = jar.getCookie('foo');
    expect(cookie).toBeTruthy();
    expect(cookie?.name).toBe('foo');
    expect(cookie?.value).toBe('bar');
  });

  test('should set a cookie with options', () => {
    const jar = new CookiesJar();
    jar.setCookie('foo', 'bar', {
      domain: 'example.com',
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'Strict',
      priority: 'High',
      partitioned: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
        
    const cookie = jar.getCookie('foo');
    expect(cookie).toBeTruthy();
    expect(cookie?.name).toBe('foo');
    expect(cookie?.value).toBe('bar');
    expect(cookie?.domain).toBe('example.com');
    expect(cookie?.path).toBe('/');
    expect(cookie?.secure).toBe(true);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('Strict');
    expect(cookie?.priority).toBe('High');
    expect(cookie?.partitioned).toBe(true);
    expect(cookie?.maxAge).toBe(1000 * 60 * 60 * 24 * 365);
  });

  test('should update a cookie', () => {
    const jar = new CookiesJar();
    jar.setCookie('foo', 'bar');
    jar.setCookie('foo', 'baz');
        
    const cookie = jar.getCookie('foo');

    expect(cookie).toBeTruthy();
    expect(cookie?.name).toBe('foo');
    expect(cookie?.value).toBe('baz');
  });

  test('should update a cookie with options', () => {
    const jar = new CookiesJar();
    jar.setCookie('foo', 'bar');
    
    jar.setCookie('foo', 'baz', {
      domain: 'example.com',
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'Strict',
      priority: 'High',
      partitioned: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
        
    const cookie = jar.getCookie('foo');

    expect(cookie).toBeTruthy();
    expect(cookie?.name).toBe('foo');
    expect(cookie?.value).toBe('baz');
    expect(cookie?.domain).toBe('example.com');
    expect(cookie?.path).toBe('/');
    expect(cookie?.secure).toBe(true);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('Strict');
    expect(cookie?.priority).toBe('High');
    expect(cookie?.partitioned).toBe(true);
    expect(cookie?.maxAge).toBe(1000 * 60 * 60 * 24 * 365);
  });

  test('should delete a cookie', () => {
    const jar = new CookiesJar();
    jar.setCookie('foo', 'bar');
    jar.deleteCookie('foo');
        
    const cookie = jar.getCookie('foo');
    expect(cookie).toBeNull();
  });

  test('should serialize the cookies in the jar to string', () => {
    const jar = new CookiesJar();
    
    jar.setCookie('foo', 'bar');
    jar.setCookie('baz', 'qux');
    jar.setCookie('quux', 'corge');
    jar.setCookie('grault', 'garply');
    jar.setCookie('waldo', 'fred');
    jar.setCookie('plugh', 'xyzzy');
    jar.setCookie('thud', 'wibble');
    jar.setCookie('wobble', 'wubble');
    jar.setCookie('wobble', 'wubble', {
      domain: 'example.com',
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'Strict',
      priority: 'High',
      partitioned: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
        
    const serialized = jar.serialize();

    expect(serialized).toBeTruthy();
    expect(serialized.split('; ')).toHaveLength(8);
    expect(serialized).toContain('foo=bar');
    expect(serialized).toContain('baz=qux');
    expect(serialized).toContain('quux=corge');
    expect(serialized).toContain('grault=garply');
    expect(serialized).toContain('waldo=fred');
    expect(serialized).toContain('plugh=xyzzy');
    expect(serialized).toContain('thud=wibble');
    expect(serialized).toContain('wobble=wubble');
  });

  test('should serialize a cookie to string', () => {
    const cookie = CookiesJar.serializeCookie({
      name: 'foo',
      value: 'bar',
      domain: 'example.com',
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'Strict',
      priority: 'High',
      partitioned: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    expect(cookie).toBeTruthy();
    expect(cookie).toBe('foo=bar; Path=/; Domain=example.com; Secure; SameSite=Strict; Max-Age=31536000000; HttpOnly; Priority=High; Partitioned');
  });

  test('should parse a cookie from string', () => {
    const cookie = CookiesJar.parseCookie('foo=bar; Path=/; Domain=example.com; Secure; SameSite=Strict; Max-Age=31536000000; HttpOnly; Priority=High; Partitioned');
    
    expect(cookie).toBeTruthy();
    expect(cookie.name).toBe('foo');
    expect(cookie.value).toBe('bar');
    expect(cookie.domain).toBe('example.com');
    expect(cookie.path).toBe('/');
    expect(cookie.secure).toBe(true);
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe('Strict');
    expect(cookie.priority).toBe('High');
    expect(cookie.partitioned).toBe(true);
    expect(cookie.maxAge).toBe(1000 * 60 * 60 * 24 * 365);
  });
});