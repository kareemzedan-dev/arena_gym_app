# Arena mobile v4 · implementation and acceptance plan

Source of truth: the five-page `arean.pdf` in arena-gym, its Nest controllers and shared Zod contracts, `docs/expo-api-handoff.md`, and the existing `Wingital-Company/arena-gym-expo` application. Work branch: `feat/native-v4`. Existing WordPress screens remain in `src/` as migration reference and are not part of the new entry point.

## Product and design

Member: Today → Training → Progress → Account. Training contains the coach-assigned workout and nutrition plans; account leads to membership, coach, invoices, attendance, classes and notices. Coach: overview, assigned clients, calendar, account. Admin: overview, members, operations, account. Server permissions remain authoritative.

Visual language: charcoal #101716, warm white #F3F5F0, Arena teal #42D5C3; Cairo Arabic typography; deliberate 8-point spacing, 24px cards, 48px minimum actions. Three onboarding stories, a focused login, contextual empty states, pull-to-refresh, visible retry actions, 180–280ms transitions, a prominent 900ms one-shot intro, gentle press feedback, optional haptics, reduced-motion support. No fabricated live metrics or medical advice. Demo content belongs only to test fixtures.

References reviewed 2026-11-04:

- https://www.nike.com/ntc-app — editorial workout hierarchy, coaching emphasis. Original design, no copied imagery.
- https://fitbod.me/ — readable exercise prescriptions and progress emphasis.
- https://docs.expo.dev/router/advanced/protected/ — protected navigation.
- https://docs.expo.dev/versions/latest/sdk/securestore/ — device token storage.
- https://docs.expo.dev/versions/latest/sdk/reanimated/ — SDK-compatible animation.

## Tasks and subtasks

- [x] 01 Discovery: read PDF, repository architecture, API handoff, old mobile routes, auth, assets and translations; identify old WordPress API incompatibility.
- [x] 02 Design direction: preserve original Arena identity; use large vector fitness icons for the women’s gym, without photographs; define tokens, navigation and typography.
- [x] 03 Foundation: Expo SDK 58, TypeScript, Router, reproducible lockfile, isolated local contract package with a reproducible Zod 4 compatibility adapter, EAS development/preview/release profiles.
- [x] 04 Authentication: atomic secure token-pair storage, single-flight refresh rotation, logout race protection, validation, account-role routing, password change, network errors.
- [x] 05 Member experience: onboarding; dashboard; membership/session balances; workouts/videos; meals; coach; all measurement fields/history/differences; invoices; attendance; class browsing/booking; notices/messages.
- [x] 06 Coach experience: scoped client search/detail, workouts/exercises and assignments, meal-plan creation, measurements, schedule, attendance.
- [x] 07 Administration: members/coaches/categories/plans/classes creation and edits; plan-specific fields; POS quote and checkout; cash/card partial payment; invoices/payment collection/corrections; reports and branch/date filters.
- [x] 08 Quality: request contract validation; no secrets/credentials in builds; session isolation; dates in Muscat, exact OMR strings; pagination; Arabic/English and text direction; loading/empty/error states.
- [x] 09 Verify: typecheck; auth concurrency/unit/contract tests; 115 backend protocol cases; dependency audit; native project generation; Expo dependency doctor; Android/iOS/web export; browser walkthrough at mobile widths and screenshots; direct API connectivity.
- [x] 10 Handoff: documented run/build commands, feature matrix and evidence, review screenshots, explicit native-device/store release gates.

## Release boundaries

Automatic WhatsApp/email/SMS sending remains inactive per the backend handoff. Invoices may be shared by explicit user action. No invented payment gateway or customer self-registration. Admin creates accounts, as specified. The existing EAS app identifiers are preserved; a new runtime prevents incompatible updates reaching v3. Store publication, signing and physical-device certification require the actual Apple/Google/Expo account environment; they are not implied by a JavaScript bundle export.

## Acceptance evidence

Source implementation and environment-available checks are complete. See [REVIEW.md](REVIEW.md) for test evidence, screenshots and the completed Android preview APK and explicitly uncompleted production signing/iOS/device/provider release gates. Code completion does not mark those external release gates complete.
