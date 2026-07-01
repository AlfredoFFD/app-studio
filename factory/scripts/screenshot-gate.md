# Screenshot-sanity gate (Gate 3) — procedure

The screenshot gate is Claude-driven (the screenshotting uses an MCP, which can't be a plain shell script). Run it after Gate 1 (build) + Gate 2 (boot).

## Steps
1. Serve the app's web build from the app dir:
   ```bash
   npx expo export --platform web --output-dir dist-web   # static, or:
   npx expo start --web                                    # live dev server
   ```
   Note the local URL (e.g. http://localhost:8081).
2. Drive the browser via **Chrome DevTools MCP** (or Playwright MCP) — load the core tools, navigate to the URL, and screenshot each key route: onboarding, home/core feature (in its "generated/result" state using the app's dev/testing buttons), paywall, settings.
3. **Vision-judge** each screenshot against this rubric (an independent judge, NOT the builder):
   - Non-blank: the screen renders actual UI, not white/black/empty.
   - Core UI present: the screen shows the feature it should (e.g. dance result card, paywall plans).
   - No obvious breakage: no red error box, no overlapping/cut-off text, no white-on-white status bar.
   - Looks intentional: aligns with the theme (color/spacing/type), not default-template ugly.
4. PASS only if every core route renders correctly. Any blank/broken screen = FAIL → back to the build loop with the screenshot as evidence (catches "compiles but white screen").

## Why web-first
~90% of iteration happens on the fast web surface (Maker School's 3-prong, minus the Mac-only mirror). Escalate to Expo Go on the real iPhone for haptics/notifications only. The dev/testing buttons baked into each app let the judge reach result/paywall states without manual setup.
