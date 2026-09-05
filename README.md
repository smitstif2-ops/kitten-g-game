# Kitten G — Production v3

Browser platformer with clay/plasticine production assets.

## v3 gameplay polish
- grounded player baseline: feet align to collision surface
- coyote time + jump buffering + variable jump height
- camera dead-zone and velocity look-ahead
- enemy-specific AI: crab charge, seagull dive, slime hop, rolling hazards
- water hazard zones with splash particles and checkpoint respawn
- stomp combo scoring
- improved boss state machine: walk, fire volley, dash/punch, shield, vulnerable stun
- boss attack telegraphs and dynamic phase label
- animated environment: water, waterfalls, foliage, flags, snow, embers
- particles, screen shake, speed lines and checkpoints
- save data, costumes, level stars and settings

## Run
Use START_GAME.command on macOS or START_GAME.bat on Windows, then open the local URL printed by the launcher.

The optimized `dist/` build uses 2 sprite atlases plus 5 WebP backgrounds.
