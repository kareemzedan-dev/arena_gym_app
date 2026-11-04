# Android preview APK

## Verified build · 5 November 2026 (Egypt)

[Download APK artifact (ZIP)](https://github.com/Wingital-Company/arena-gym-expo/actions/runs/41918710299/artifacts/13367946959) · [Successful build](https://github.com/Wingital-Company/arena-gym-expo/actions/runs/41918710299)

- Source commit: `7d9b758e231681d01c0ef9130975196ae1206018`.
- Version: 4.0.1 (30); Android 7.0/API 24 or newer.
- APK size: 52,194,147 bytes (49.8 MiB); download ZIP approximately 20.9 MiB.
- SHA-256: `3862c7b37a6d874729d81635a6e56aa0587397df76fe2e405a4d09bb2a08a267`.
- Verification: APK v2 signature valid; preview package/name correct; both ARM architectures included; embedded JavaScript contains the staging backend URL; downloaded file matches the build checksum. The bundled app contains the new icon-introduction preference key and no reference to the removed training photograph.
- Native compile completed successfully in 24m 17s. Physical-device launch/acceptance remains to be reviewed.

## Changes in 4.0.1

Large vector fitness icons replace all in-app photographs for the women’s gym. The larger introduction animates once with gentle motion and respects reduced-motion preferences. Password visibility controls sit inside their fields with correct Arabic/English placement. Existing users see the revised introduction once.

## Install

1. Download the artifact from a successful **Android preview APK** workflow run in GitHub Actions. This private repository requires GitHub access.
2. Extract the ZIP, then copy/open `arena-gym-preview.apk` on the Android phone.
3. If Android prompts, allow APK installation for the browser/file manager used to open it.
4. Open **Arena Gym Preview** and sign in with an account on `https://test-api.arenagym-om.com`.

The app runs independently of Expo Go and Metro. Local disposable review accounts do not exist on staging. The preview has its own Android application ID and data storage; it can be installed alongside the production Arena app.

## Build configuration

- Source: `feat/native-v4` in this existing repository.
- Variant: release with bundled JavaScript/assets, signed with Expo's template development key for the isolated preview application ID `com.arenagym.app.preview`.
- Architectures: ARM 64-bit and ARM 32-bit.
- Configuration: `EAS_BUILD_PROFILE=preview`, explicit staging API URL.
- Toolchain: Node 24, Java 21, Android platform 37.0, build tools 37.0.0, NDK 27.1.12297006 and Gradle from Expo's generated project.
- Pipeline: install locked dependencies, typecheck/tests, audit, generate native project, compile, verify APK signature/package/bundled JS, calculate checksum and upload artifact.
- Artifact retention: 30 days. Keep a downloaded copy if needed longer.

This preview is for device review. It is not signed with the production app key and is not a Play Store release. Complete the physical-device checklist in [REVIEW.md](REVIEW.md) before a production rollout.
