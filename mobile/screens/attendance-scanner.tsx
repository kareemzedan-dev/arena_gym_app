import React, { useEffect, useRef, useState } from "react";
import { Linking, View } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import {
  QrAttendanceResponse,
  type QrAttendanceResponse as Result,
} from "@arena/shared";
import { useSave } from "../components/data";
import { Button, Card, Failure, Loading, Text } from "../components/ui";
import { usePrefs } from "../state/preferences";
import { useTheme } from "../theme/use-theme";

export function AttendanceScanner({ onClose }: { onClose(): void }) {
  const c = useTheme();
  const { text } = usePrefs();
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<Result | null>(null);
  const requested = useRef(false);
  const locked = useRef(false);
  const scan = useSave(
    "/attendance/qr",
    QrAttendanceResponse,
    "POST",
    setResult,
  );

  useEffect(() => {
    if (
      permission &&
      !permission.granted &&
      permission.canAskAgain &&
      !requested.current
    ) {
      requested.current = true;
      void requestPermission();
    }
  }, [permission, requestPermission]);

  async function submit({ data }: BarcodeScanningResult) {
    const token = data.trim();
    if (!token || locked.current) return;
    locked.current = true;
    try {
      await scan.mutateAsync({ token });
    } catch {
      // The mutation exposes the API error below. Keep scanning paused until retry.
    }
  }

  function scanAgain() {
    locked.current = false;
    setResult(null);
    scan.reset();
  }

  if (!permission) return <Loading />;

  if (!permission.granted) {
    return (
      <Card>
        <Text bold size={18}>
          {text("Camera permission is required", "مطلوب السماح بالكاميرا")}
        </Text>
        <Text muted>
          {text(
            "Allow camera access so reception can scan the member's QR code.",
            "اسمح باستخدام الكاميرا حتى يتمكن الاستقبال من مسح رمز QR الخاص بالعضو.",
          )}
        </Text>
        {permission.canAskAgain ? (
          <Button
            title={text("Allow camera", "السماح بالكاميرا")}
            icon="camera-outline"
            onPress={() => void requestPermission()}
          />
        ) : (
          <Button
            title={text("Open settings", "فتح الإعدادات")}
            icon="settings-outline"
            onPress={() => void Linking.openSettings()}
          />
        )}
        <Button
          secondary
          title={text("Use manual attendance", "التسجيل اليدوي")}
          onPress={onClose}
        />
      </Card>
    );
  }

  if (result) {
    return (
      <Card style={{ alignItems: "center" }}>
        <Text accent bold size={20} accessibilityRole="alert">
          {text("Attendance recorded", "تم تسجيل الحضور")}
        </Text>
        <Text bold size={26} style={{ textAlign: "center" }}>
          {result.memberName}
        </Text>
        <Text muted style={{ textAlign: "center" }}>
          {result.type === "PT"
            ? result.ptUnlimited
              ? text(
                  "Personal training · unlimited sessions",
                  "تدريب شخصي · جلسات غير محدودة",
                )
              : text(
                  `Personal training · ${result.remainingSessions} sessions remaining`,
                  `تدريب شخصي · متبقي ${result.remainingSessions} جلسة`,
                )
            : text("Gym entry", "دخول الجيم")}
        </Text>
        <Button
          title={text("Scan another member", "مسح عضو آخر")}
          icon="qr-code-outline"
          onPress={scanAgain}
        />
        <Button
          secondary
          title={text("Use manual attendance", "التسجيل اليدوي")}
          onPress={onClose}
        />
      </Card>
    );
  }

  return (
    <View style={{ gap: 16 }}>
      <Text muted style={{ textAlign: "center" }}>
        {text(
          "Point the camera at the member's entry QR code.",
          "وجّه الكاميرا إلى رمز QR الخاص بدخول العضو.",
        )}
      </Text>
      <View
        style={{
          height: 420,
          overflow: "hidden",
          borderRadius: 24,
          borderWidth: 2,
          borderColor: scan.error ? c.dangerBorder : c.accent,
          backgroundColor: "#000",
        }}
      >
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={locked.current ? undefined : submit}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: "20%",
            right: "12%",
            bottom: "20%",
            left: "12%",
            borderRadius: 20,
            borderWidth: 3,
            borderColor: c.accent,
          }}
        />
      </View>
      {scan.isPending && <Loading />}
      {scan.error && (
        <>
          <Failure error={scan.error} />
          <Button
            title={text("Scan again", "إعادة المسح")}
            icon="qr-code-outline"
            onPress={scanAgain}
          />
        </>
      )}
      <Button
        secondary
        title={text("Use manual attendance", "التسجيل اليدوي")}
        onPress={onClose}
      />
    </View>
  );
}
