# Kitten G — Plasticine World

A polished browser platformer prototype using locally stored plasticine art assets and a custom deterministic canvas engine.

## Play locally

Open `index.html` in a modern browser, or serve the repository root with a local HTTP server.

## Controls
- A / D or Left / Right — move
- W / Up / Space — jump
- Esc — pause
- Touch controls appear automatically on mobile/tablet

## Architecture
- `js/data.js` — levels and asset manifest
- `js/save.js` — persistent save data
- `js/audio.js` — WebAudio music and SFX
- `js/input.js` — keyboard/touch input
- `js/entities.js` — player/enemies/boss
- `js/world.js` — collisions, objectives, moving platforms
- `js/renderer.js` — clay visual rendering, camera, particles
- `js/ui.js` — menus, shop, settings, level select
- `js/game.js` — fixed-timestep game loop and orchestration

## Features
- 5 levels and final boss
- responsive platforming with coyote time and jump buffering
- moving platforms, hazards, enemies and checkpoints
- coins, shop and 5 costumes
- persistent save and level stars
- mobile controls
- settings, pause, game-over and victory screens
- procedural WebAudio SFX/music
