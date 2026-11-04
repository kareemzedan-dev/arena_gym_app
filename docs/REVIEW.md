# Review · 4 November 2026

## Ready to inspect

The new application lives on `feat/native-v4` in `Wingital-Company/arena-gym-expo`. It replaces the runtime entry point with Expo Router/React Native while retaining the legacy implementation as reference. It uses the new Arena NestJS API. No production data was imported or modified.

The original plan-field request is also reflected in mobile: gym and PT use the main duration, and separate validity overrides appear only for bundles. PT session count remains required for PT/bundle plans.

### Design review

[Watch the icon intro and password control](previews/intro-and-password.webm) — actual web-interface recording with normal motion enabled; not a native-device performance recording.

- [English intro](screenshots/01-onboarding-en.png), [Arabic intro](screenshots/01-onboarding-ar.png), [Arabic login](screenshots/02-login-ar.png), [password control](screenshots/02-password-ar.png).
- [Member home](screenshots/03-home-en.png), [Arabic home](screenshots/03-home-ar.png).
- [Workout](screenshots/04-workout-en.png), [nutrition](screenshots/05-nutrition-en.png), [progress](screenshots/06-progress-en.png).
- [Coach/client](screenshots/07-coach-client.png), [coach schedule](screenshots/08-coach-schedule.png).
- [Paid invoice](screenshots/09-invoice-paid.png), [profit report](screenshots/10-admin-report.png), [new partial-payment sale](screenshots/11-pos-invoice.png).

Screenshots use synthetic local review accounts/data. They are actual running React Native Web screens, not design mockups. The current women’s gym design uses large vector fitness icons with no people/photos. Native Reanimated transitions, safe areas, protected navigation, encrypted storage and haptics are implemented in the same source. Web review does not certify native performance.

## Verification evidence

- Strict TypeScript checking passes.
- 23 unit/contract tests pass, including 115 captured backend protocol cases: rotating-token concurrency, late unauthorized responses, logout races, failed refresh, rejected replacement tokens, no retry of forbidden writes, password-byte preservation, browser fetch binding, bounded responses, calendar dates, OMR decimals, role boundaries, plan scopes, measurements, nested training payloads and audited invoice corrections.
- Expo Doctor: 20/20 checks passed.
- Android and iOS Hermes bundle export and web bundle export pass.
- Android preview native compilation and APK signature verification pass; [download and evidence](APK.md).
- Android/iOS native project generation passes (`expo prebuild --no-install`); this is not a signed native compilation.
- Mobile dependency audit: **0 vulnerabilities** after Zod 4.6.7 and scoped Expo-tooling overrides for glob 14.0.2/minimatch 11.0.1. CI now checks the audit as well.
- 7 browser integration journeys pass against a real, isolated NestJS API and temporary MariaDB, with no page errors. The current suite includes password-control geometry in Arabic/English and animation stability with normal/reduced motion.
  1. Arabic/English onboarding at 390×844 and 360×740, intro completion and login.
  2. Member membership/balances, assigned workout, meal quantities, measurement chart, coach, class booking and cancellation, invoices, language switching and logout.
  3. Coach assigned-client profile, new measurement, same-day ordering and actual class schedule.
  4. Admin scope-aware plan creation, partial invoice collection, report, server-quoted new sale, invoice correction and category create/delete.
  5. Password show/hide and hit-area geometry in Arabic and English at compact widths.
  6. Large intro artwork settles without looping when normal motion is enabled.
  7. The same intro stays static and functional with reduced motion enabled.
- Staging `GET /health` returned HTTP 200. Staging authentication and mutations were deliberately not exercised with real customer data.

The live test runner creates its own fresh database container at local port 3317 and stops it when finished. Review API is local port 3105. No existing database is reset. Tests use the backend protocol from the commit recorded in `contracts-source.json`, with a reproducible Zod 4 adapter. Source hashes and captured Zod 3 protocol outputs make the migration inspectable.

## Women’s gym design revision

- Removed the generated photograph from the application and replaced all photo panels (including coach profiles) with large vector fitness artwork.
- A 320px intro illustration enters once over 900ms; no looping animation or heavy bounce. Other screen/card/button transitions remain short, with reduced-motion support.
- Password visibility is inside the input, centered on the left in Arabic and right in English, with a touch area of at least 48px. Revealing a password never enables autocorrection/capitalization.
- The redesigned intro is shown once after updating from the previous version.
- Review fixtures use female member/coach names; no real backend records were changed.

## What was repaired during verification

- Bound browser fetch without an incorrect receiver; added a regression test.
- Included member identity in class booking data, as required by the backend validator.
- Removed the public/private root-route collision that could leave a blank screen on logout.
- Sorted same-day measurements by creation time and ID so the newest entry drives the chart.
- Removed decorative icon glyphs from accessible button names; gave rows explicit labels.
- Reduced icon assets to the single Ionicons family.
- Protected authenticated responses against completion after logout and cleared sessions rejected after refresh.
- Preserved Zod 3 PATCH omission semantics when migrating to Zod 4, preventing unrelated updates from resetting signup fees, active state or coach availability.
- Added native system-UI support and blocked unused Android legacy storage permissions.

## Dependency migration notes

The mobile runtime uses Zod 4.6.7, above the fix for [oversized constrained collections](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5). The sync adapter follows the [Zod migration guide](https://zod.dev/v4/changelog) while preserving backend PATCH omission and default behavior. A regression test confirms oversized constrained arrays fail before their element transforms run. Response envelope limits remain in place for unconstrained arrays.

Expo 58 still declares older glob/minimatch versions. Scoped overrides select fixes for [glob cancellation](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) and [minimatch amplification](https://github.com/advisories/GHSA-g3hv-75wg-m249). Native project generation, bundle export and Expo fingerprint generation exercise these tooling dependencies. Remove the overrides once the Expo packages declare patched versions. The zero-advisory result covers this mobile dependency tree, not the separate backend installation.

## Remaining release gates — not claimed complete

- **Production signing and iOS:** the standalone Android preview APK is now built and signature-verified; see [APK download/evidence](APK.md). It uses the isolated preview application ID and development signing key. EAS is not authenticated here, so production signing, IPA generation and store submission remain incomplete.
- **Device acceptance:** test Android and iPhone safe areas, keyboard avoidance, system back/gestures, screen-reader navigation, large text, SecureStore persistence, app background/resume, offline retry, low-end-device animation performance, haptics and external video/PDF links. Test a real expired/rotated session on both OSes.
- **Production target:** set `EXPO_PUBLIC_API_URL` in EAS's production environment. The build config rejects a production build without an explicit HTTPS API URL. Browser origins need explicit backend CORS configuration; native apps use direct bearer requests.
- **Member invoice detail/PDF:** the current backend permits these endpoints only for finance roles. Members see their permitted invoice summaries. Adding member PDF access requires an ownership-checked backend endpoint.
- **External providers:** automatic WhatsApp, email/SMS, payment gateways and Zoom creation remain inactive, matching the backend handoff. No provider messages or bank transactions were sent during verification.

## Suggested review order

1. Inspect the intro, Arabic home and progress screenshots for visual direction.
2. Run the temporary local review environment from the README and sign in as each role.
3. Review the plan, role matrix, financial confirmation behavior and API client tests.
4. Install the verified Android preview APK and complete device acceptance. Use the authorized EAS account for iOS/production signing before releasing.
