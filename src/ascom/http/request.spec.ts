import Request from './request';
import Response from '../../http/response';


describe('ascom/http.request', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('should be able to create a request', () => {
    const request = new Request('http://localhost');
    expect(request).toBeInstanceOf(Request);
  });

  test('should be able to set a header', () => {
    const request = new Request('http://localhost');
    request.headers.set('Content-Type', 'application/json');
    expect(request.headers.get('Content-Type')).toBe('application/json');
  });

  test('should be able to set a body', () => {
    const request = new Request('http://localhost');
    request.setBody({ name: 'John' });
  });

  test('should be able to send a GET request', async () => {
    const request = new Request('http://localhost', {
      method: 'get',
    });

    const response = await request.dispatch();
    expect(response).toBeInstanceOf(Response);
  });
});