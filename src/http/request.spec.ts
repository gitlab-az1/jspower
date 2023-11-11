import { Request } from './request';


describe('http/request', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('it should create a request', () => {
    const request = new Request('http://localhost');
    expect(request).toBeDefined();
    expect(request.url).toBe('http://localhost');
    expect(request.method).toBe('GET');
  });

  test('it should create a request with custom method', () => {
    const request = new Request('http://localhost', { method: 'POST' });
    expect(request).toBeDefined();
    expect(request.url).toBe('http://localhost');
    expect(request.method).toBe('POST');
  });

  test('it should create a request with custom method and delay', () => {
    const request = new Request('http://localhost', { method: 'POST' });
    expect(request).toBeDefined();
    expect(request.url).toBe('http://localhost');
    expect(request.method).toBe('POST');
    
    request.delay = 1000;
    expect(request.delay).toBe(1000);
  });

  test('it should send a request', async () => {
    const request = new Request('http://localhost/temp.php', { method: 'GET' });
    expect(request).toBeDefined();
    expect(request.url).toBe('http://localhost/temp.php');
    expect(request.method).toBe('GET');
    
    request.delay = 1000;
    expect(request.delay).toBe(1000);

    const response = await request.send();
    expect(response).toBeDefined();
    expect(response.status).toBe(200);
  });
});