import type { RequestHandler } from './_types';
import type { HttpMethod } from '../../types';


export function requestMethod(handler: RequestHandler, method: HttpMethod): RequestHandler {
  return async (request, response) => {
    const _reject = () => {
      response.status(405);
      response.json({
        action: 'Try to fetch this route with another method',
        message: `Method ${request.method} not allowed`,
        error: `Method ${request.method} not allowed`,
        errorCode: 'ERR_METHOD_NOT_ALLOWED',
        status: 405,
        statusCode: 405,
      });

      response.end();
    };

    if(request.method?.toLowerCase().trim() !== method.toLowerCase().trim()) return _reject();
    await handler(request, response);
  };
}