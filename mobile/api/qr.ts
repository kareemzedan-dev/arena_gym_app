import QRCode from "qrcode";

export type QrRect = { x: number; y: number; width: number; height: number };
/** Row runs preserve every dark module, with the standard four-module quiet zone. */
export function tokenToQrRects(token: string) {
  if (!token) throw new Error("Empty QR token");
  const { modules } = QRCode.create(token, { errorCorrectionLevel: "M" });
  const quietZone = 4;
  const rects: QrRect[] = [];
  for (let y = 0; y < modules.size; y++) {
    let x = 0;
    while (x < modules.size) {
      if (!modules.get(y, x)) {
        x++;
        continue;
      }
      const start = x;
      while (x < modules.size && modules.get(y, x)) x++;
      rects.push({
        x: start + quietZone,
        y: y + quietZone,
        width: x - start,
        height: 1,
      });
    }
  }
  return { size: modules.size + quietZone * 2, rects };
}

export function checkInRefreshDelay(expiresAt: string, now = Date.now()) {
  return Math.max(1000, Date.parse(expiresAt) - now - 10000);
}
