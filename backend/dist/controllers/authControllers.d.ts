import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
export declare const createUsersAccount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const memberLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const adminLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const verifyUser: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=authControllers.d.ts.map