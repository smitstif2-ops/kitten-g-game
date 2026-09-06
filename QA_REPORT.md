# QA report — v8

Validated after the gameplay/control overhaul:
- v8 JavaScript passes syntax checks
- all five level definitions remain inside world bounds
- levels 1–4 use continuous static routes with maximum horizontal platform gap <= 170 px
- mission items, coins, exits, house and boss positions remain inside their level widths
- level widths are now 5420 / 6000 / 6100 / 6500 / 5600
- mission counts are 7 fish / 7 birds / 6 runes / 6 butterflies / 5 boss HP
- new game starts with 9 lives
- remaining lives carry to the next completed level
- game-over retry restores 9 lives
- 3-star logic now checks full 9 lives rather than the old hard-coded 3
- desktop mouse input and mobile Pointer Events load before InputManager/Game are instantiated
- mobile controls support simultaneous direction + jump and release cleanly on blur/visibility changes
- coin visual size and collection hitbox are enlarged
- portal/tree/flag/checkpoint/house rendering uses supporting platform surfaces instead of fixed screen/world Y values
- boss is constrained to the final arena and uses a stable floor Y

Local static logic audit result: `V8_LOGIC_QA_OK`.
GitHub Pages deployment is checked separately after each publishing commit.
