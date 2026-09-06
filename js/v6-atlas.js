(function(KG){
  'use strict';
  KG.AtlasSprites=KG.AtlasSprites||{};
  // Safe v6 boot: use the production atlases already verified on Pages.
  // New optional binary art files can exist in /assets without blocking startup.
  delete KG.AtlasSprites['prod/tiles/spikes_v4.png'];
  KG.AtlasFiles=['characters.webp','environment.webp'];
})(window.KG=window.KG||{});
