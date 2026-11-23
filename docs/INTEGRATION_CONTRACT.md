# Integration contract: Diagnostic Field Guide

## Role in the KrishiAI learning system

This repository remains the Bangla-first, offline reading and listening edition of the Plantwise Diagnostic Field Guide. It is a reference and self-study resource, not the operational diagnosis or pesticide recommendation engine.

- Keep the existing reader, chapter navigation, notes, search, bookmarks, Bengali TTS, image viewer and PWA behavior intact.
- Link to the operational CABI workspace rather than copying its diagnosis, risk, protection or pesticide engines into this reader.
- New quizzes or practice material must be independently authored and clearly labelled as learning exercises.
- Do not copy or redistribute the source book's translated passages, tables, photographs, illustrations or captions into another repository without confirming the applicable permission. The source adaptation is documented as CC BY-NC; retain attribution and non-commercial restrictions.
- Never describe a visual match as a confirmed diagnosis. Ask learners to verify crop, plant part, symptom distribution, field history and abiotic causes.

## Offline contract

The app shell and book content are precached. Image assets are cached when fetched and may be warmed by the existing image preloader; do not promise that every image is available offline until the image cache has completed. Browser speech voices are device-dependent. Network map tiles and online reverse geocoding are not part of the offline reading contract.

## Integration targets

- Operational app: https://web.krishiai.live/
- CABI diagnosis workspace: https://github.com/moniruzjaman/cabi-diagnosis
- Visual training reference: https://github.com/moniruzjaman/diagnosis-assistant

## Acceptance checks

1. All nine chapters, Bengali text, image captions and attribution remain unchanged.
2. Search, chapter notes, reading progress, font/theme controls and TTS still work.
3. First-visit and repeat-visit offline behavior is described accurately.
4. No CABI source images or translated passages are copied into another app as part of integration.
