import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
interface DecodedToken {
    id: string;
    email: string;
    role?: string;
}
export interface AuthRequest extends Request {
    user?: string | DecodedToken | jwt.JwtPayload;
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=auth.d.ts.map