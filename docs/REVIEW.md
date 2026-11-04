# Review · 4 November 2026

## Ready to inspect

The new application lives on `feat/native-v4` in `Wingital-Company/arena-gym-expo`. It replaces the runtime entry point with Expo Router/React Native while retaining the legacy implementation as reference. It uses the new Arena NestJS API. No production data was imported or modified.

The original plan-field request is also reflected in mobile: gym and PT use the main duration, and separate validity overrides appear only for bundles. PT session count remains required for PT/bundle plans.

### Design review

- [English intro](screenshots/01-onboarding-en.png), [Arabic intro](screenshots/01-onboarding-ar.png), [Arabic login](screenshots/02-login-ar.png).
- [Member home](screenshots/03-home-en.png), [Arabic home](screenshots/03-home-ar.png).
- [Workout](screenshots/04-workout-en.png), [nutrition](screenshots/05-nutrition-en.png), [progress](screenshots/06-progress-en.png).
- [Coach/client](screenshots/07-coach-client.png), [coach schedule](screenshots/08-coach-schedule.png).
- [Paid invoice](screenshots/09-invoice-paid.png), [profit report](screenshots/10-admin-report.png), [new partial-payment sale](screenshots/11-pos-invoice.png).

Screenshots use synthetic local review accounts/data. They are actual running React Native Web screens, not design mockups. Native Reanimated transitions, safe areas, protected navigation, encrypted storage and haptics are implemented in the same source. Web review does not certify native performance.

## Verification evidence

- Strict TypeScript checking passes.
- 20 unit/contract tests pass: rotating-token concurrency, late unauthorized responses, logout races, failed refresh, rejected replacement tokens, no retry of forbidden writes, password-byte preservation, browser fetch binding, bounded responses, calendar dates, OMR decimals, role boundaries, plan scopes, measurements, nested training payloads and audited invoice corrections.
- Expo Doctor: 20/20 checks passed.
- Android and iOS Hermes bundle export and web bundle export pass.
- 4 browser integration journeys pass against a real, isolated NestJS API and temporary MariaDB, with no page errors. Latest completed run: 22.8 seconds.
  1. Arabic/English onboarding at 390×844 and 360×740, intro completion and login.
  2. Member membership/balances, assigned workout, meal quantities, measurement chart, coach, class booking and cancellation, invoices, language switching and logout.
  3. Coach assigned-client profile, new measurement, same-day ordering and actual class schedule.
  4. Admin scope-aware plan creation, partial invoice collection, report, server-quoted new sale, invoice correction and category create/delete.
- Staging `GET /health` returned HTTP 200. Staging authentication and mutations were deliberately not exercised with real customer data.

The live test runner creates its own fresh database container at local port 3317 and stops it when finished. Review API is local port 3105. No existing database is reset. Tests use the exact backend contracts copied from the commit recorded in `contracts-source.json`.

## What was repaired during verification

- Bound browser fetch without an incorrect receiver; added a regression test.
- Included member identity in class booking data, as required by the backend validator.
- Removed the public/private root-route collision that could leave a blank screen on logout.
- Sorted same-day measurements by creation time and ID so the newest entry drives the chart.
- Removed decorative icon glyphs from accessible button names; gave rows explicit labels.
- Reduced icon assets to the single Ionicons family.
- Protected authenticated responses against completion after logout and cleared sessions rejected after refresh.

## Remaining release gates — not claimed complete

- **Signed native packages:** `eas whoami` reports “Not logged in”. Android SDK/emulator and Xcode are not installed in this environment. No signed APK, IPA or store upload exists from this work. An authorized EAS account with access to the retained project is needed for preview builds.
- **Device acceptance:** test Android and iPhone safe areas, keyboard avoidance, system back/gestures, screen-reader navigation, large text, SecureStore persistence, app background/resume, offline retry, low-end-device animation performance, haptics and external video/PDF links. Test a real expired/rotated session on both OSes.
- **Production target:** set `EXPO_PUBLIC_API_URL` in EAS's production environment. The build config rejects a production build without an explicit HTTPS API URL. Browser origins need explicit backend CORS configuration; native apps use direct bearer requests.
- **Dependency advisories:** npm audit reports Zod 3 constrained-collection resource exhaustion and Expo CLI glob/minimatch advisories. This client retains Zod 3 to match the backend contracts; responses are bounded before schema parsing. These mitigations are not a declaration that the advisory is resolved. Coordinate a backend/client Zod migration and SDK tooling updates before production security sign-off; do not use npm's suggested downgrade to Expo 51.
- **Member invoice detail/PDF:** the current backend permits these endpoints only for finance roles. Members see their permitted invoice summaries. Adding member PDF access requires an ownership-checked backend endpoint.
- **External providers:** automatic WhatsApp, email/SMS, payment gateways and Zoom creation remain inactive, matching the backend handoff. No provider messages or bank transactions were sent during verification.

## Suggested review order

1. Inspect the intro, Arabic home and progress screenshots for visual direction.
2. Run the temporary local review environment from the README and sign in as each role.
3. Review the plan, role matrix, financial confirmation behavior and API client tests.
4. Build a signed preview through the existing EAS account and complete device acceptance before merging/releasing.
