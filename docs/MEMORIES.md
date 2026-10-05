# My match. My memory.

Implemented: capture the selected synthetic match event, its computed observation, viewing preferences and bounded evidence. Add a nickname, personal note and optional PNG/JPEG/WebP photo (up to 1 MB). Keep up to six memories in this browser, download an SVG memory card, or download an offline HTML keepsake with fan/analyst lenses and expandable evidence. Saved AI interpretations retain their provider label and are not independently verified. Export lenses use computed templates.

Personal additions are not match evidence and are not sent to the AI service. Notes and photos are embedded in downloaded files; anyone receiving those files can see them. Browser storage is local to the current browser/origin and can be cleared. Storage failures are reported with a download recommendation.

A replay link contains only event ID and viewing preferences. It does not contain the nickname, note or photo. Other fans need access to the deployed app to open that link. The shirt illustration uses the memory artwork. “Simulate a tag tap” restores the selected event and preferences within the app; it does not scan hardware.

## XtremeSignPost and connected clothing

The user's proposed personalized storytelling and wearable memory direction inspired this experiment. XtremeSignPost's public website describes “personalized, virtual footprints”: https://xtremesignpost.com/. The intended company, patent details, data rights and interface have not been confirmed. No partner API, real NFC/RFID scan, physical garment production, ownership, patent status or license is claimed.

A future integration needs an authorized sample or documented interface, the permitted data fields, and the intended tag/link behavior. Keep fan-authored media separate from football event evidence. Start with links to known match events rather than importing unverified match claims. Do not expose credentials in the browser or publish private partner data.

## Verification

Four new automated tests cover frozen evidence without future events, private fields excluded from links, escaped personal text, photo input restrictions, bounded restored preferences and interactive export content. All 18 project tests pass. The Pages build includes the memory module. Browser interaction and visual QA remain pending; this is a prototype feature, not a finished hardware integration.
