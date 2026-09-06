# QA report — v6

Validated after the graphics cleanup:
- v6 JavaScript passes syntax checks
- all five levels instantiate with the current runtime patches
- startup asset list is limited to the verified `characters.webp` and `environment.webp` production atlases
- level 3 has explicit ball guidance and clearer objective text
- costume rendering uses visible alpha bounds for consistent visual height
- platform renderer no longer adds artificial horizontal guide strokes
- spikes have a readable metal fallback and never depend on an optional binary asset
- waterfalls use solid alpha and grounded foam treatment
- decorative trees are snapped to actual platform surfaces

Latest local static QA: 5/5 levels OK.
