// Generated from the backend by npm run sync:contracts; see docs/contracts-source.json.
import { z } from 'zod';
export const FileParams = z.object({ name: z.string().regex(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\.(jpg|png|webp)$/) }).strict();
export type FileParams = z.infer<typeof FileParams>;
export const FileResponse = z.instanceof(Uint8Array);
export type FileResponse = z.infer<typeof FileResponse>;
