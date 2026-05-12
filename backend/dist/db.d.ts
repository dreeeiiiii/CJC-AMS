import { PrismaClient } from './generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
declare const prisma: PrismaClient<{
    adapter: PrismaPg;
}, never, import("./generated/prisma/runtime/client.js").DefaultArgs>;
export default prisma;
//# sourceMappingURL=db.d.ts.map