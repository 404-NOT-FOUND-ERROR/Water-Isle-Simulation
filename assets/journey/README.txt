Six 900 x 660 WebP photographs of the actual game scenes.

The terrain, warmed river state, houses, bridges, dam sites and decorations
are rendered by the same game code, with a shared camera and lighting.
Each photograph shows the initial construction state of its level.

To refresh after scene changes:
1. Run node build.cjs, then node tools/journey-studio.cjs.
2. Open the printed local authoring URL and click Generate six thumbnails.
3. Save the six displayed WebP images as level-1.webp through level-6.webp.
4. Run node build.cjs again. It embeds the six assets into index.html.

The authoring page lives in ignored test-results/ and is never shipped.
Journey thumbnails are about 40-47 KB each; none requires a network request.
