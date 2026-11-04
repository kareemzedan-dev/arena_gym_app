# Android preview APK

## Verified build · 4 November 2026

[Download APK artifact (ZIP)](https://github.com/Wingital-Company/arena-gym-expo/actions/runs/41906468710/artifacts/13362442901) · [Successful build](https://github.com/Wingital-Company/arena-gym-expo/actions/runs/41906468710)

- Source commit: `585fdfb2c0c8652f0980517ae0e807e470f522dd`.
- Version: 4.0.0 (29); Android 7.0/API 24 or newer.
- APK size: 53,902,771 bytes (51.4 MiB); download ZIP approximately 22.5 MiB.
- SHA-256: `36c8146c356d87fa791c698b9cb5f9309347d8448af1ae351c4ac9df5bebda95`.
- Verification: APK v2 signature valid; preview package/name correct; both ARM architectures included; embedded JavaScript contains the staging backend URL; downloaded file matches the build checksum.
- Native compile completed successfully in 31m 29s. Physical-device launch/acceptance remains to be reviewed.

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
