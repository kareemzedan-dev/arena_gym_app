import type { BannerResponse } from "@arena/shared";
import { safeHttpUrl } from "./format";

/** Backend URL validation accepts schemes that cannot be displayed or opened here. */
export function bannersForDisplay(banners: BannerResponse[]) {
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
