import { z } from "zod";
import { BannerResponse } from "@arena/shared";
import { safeHttpUrl } from "./format";

/** Backend URL validation accepts schemes that cannot be displayed or opened here. */
export function bannersForDisplay<T extends BannerResponse>(banners: T[]) {
  return banners.flatMap((banner) => {
    const imageUrl = safeHttpUrl(banner.imageUrl);
    return imageUrl
      ? [
          {
            ...banner,
            imageUrl,
            linkUrl: banner.linkUrl && safeHttpUrl(banner.linkUrl),
          },
        ]
      : [];
  });
}

/** Parse before the generated schema strips unknown fields. Invalid additions never break banners. */
export function bannerDuration(raw: unknown): number {
  const parsed = z
    .object({
      durationSeconds: z
        .union([z.number(), z.string().trim().min(1)])
        .transform(Number)
        .pipe(z.number().positive().max(86400))
        .optional(),
    })
    .safeParse(raw);
  return parsed.success ? (parsed.data.durationSeconds ?? 5) : 5;
}
export const MobileBannerListResponse = z.array(
  z.unknown().transform((raw, ctx) => {
    // Duration is validated separately so a bad value never hides the banner.
    const base =
      typeof raw === "object" && raw
        ? { ...raw, durationSeconds: undefined }
        : raw;
    const parsed = BannerResponse.safeParse(base);
    if (!parsed.success) {
      ctx.issues.push({
        code: "custom",
        message: "Invalid banner",
        input: raw,
      });
      return z.NEVER;
    }
    return { ...parsed.data, durationSeconds: bannerDuration(raw) };
  }),
);
