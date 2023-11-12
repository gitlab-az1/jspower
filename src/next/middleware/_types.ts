import { NextApiRequest, NextApiResponse } from 'next';

export type RequestHandler = (request: NextApiRequest, response: NextApiResponse) => Promise<void>;