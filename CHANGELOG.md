# Changelog

## Production v3 — gameplay polish

### Player
- Fixed grounded sprite baseline and tightened collision box.
- Retuned acceleration, friction, air control and jump arc.
- Coyote time and jump buffering retained and refined.
- Variable-height jumping refined.
- Landing state and grounded speed feedback improved.

### Camera
- Added velocity look-ahead.
- Added horizontal dead-zone to prevent constant micro-scrolling.
- Smoothed transitions while reversing direction.

### Enemies
- Crab: proximity charge.
- Seagull: hovering patrol and player dive behavior.
- Slime: hopping movement.
- Spike ball / rock: rolling behavior and visual rotation.
- Hedgehog: standard patrol.

### Environment
- Added physical water hazard zones to valley, coast and ruins.
- Water contact creates splash particles and respawns at checkpoint.
- Animated waterfalls, water, foliage, flags, snow and embers retained.

### Combat
- Added stomp combo system with score multiplier.
- Added combo audio and HUD badge.
- Improved hit feedback, particle counts and screen shake.

### Boss
- Rebuilt encounter as a readable state machine:
  1. chase
  2. fire volley
  3. punch/dash
  4. shield
  5. vulnerable stun window
- Added boss phase label and attack telegraphs.

### QA
- JS syntax validation passed.
- Five-level construction smoke test passed.
- Gameplay state test passed for water zones, enemy AI and boss phases.
- Optimized dist asset map still resolves 124 production sprites.
