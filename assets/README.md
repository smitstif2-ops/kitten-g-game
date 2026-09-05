# Production asset bundle v3

The source code on `main` expects the optimized production bundle below. Binary art is intentionally kept as 7 optimized WebP files rather than 124 individual PNGs.

Required paths:

- `assets/characters.webp` — SHA-256 `ce7e1260047670eb37f09e09ffb963d752fab658dc0e014a879234c20512c7ec`
- `assets/environment.webp` — SHA-256 `11c75728049cfe9c12a0807a236402be1c06e5b687e147613ca352fc4fd605b6`
- `assets/prod/backgrounds/level1_valley.webp` — `1fe9b884fca4002c19b1c2694b92a98416eb539d702243ba889e5c3857dfa7d7`
- `assets/prod/backgrounds/level2_island.webp` — `3a4e1e8bc0f674af8bcabfdc301342e407de2d0ab749e6cda2f89a3a9a713c17`
- `assets/prod/backgrounds/level3_ruins.webp` — `fb23cc896b4f7e7f8659c4e95687f1004246d8faa27ed09c512ce27b41c2d9b2`
- `assets/prod/backgrounds/level4_snow.webp` — `ac52e65c99ff1c902b6e1c120b6482e2c592ef5cc2912b4fc4b2da67735628dd`
- `assets/prod/backgrounds/level5_lava.webp` — `37844f7da8e50369a1b14eb96e6c4e9cd0378a764d3c6264959b7a2734448bc7`

`js/atlas-map.js` resolves 124 production sprites from the two atlases.
