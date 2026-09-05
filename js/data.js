(function(KG){
  'use strict';
  KG.Assets = {
    backgrounds: ['level-1-hd.jpg','level-2-hd.jpg','level-3-hd.jpg','level-4-hd.jpg','level-5-hd.jpg'],
    hero: {run:'hero-run.png', jump:'hero-jump.png', fall:'hero-fall.png', win:'hero-win.png'},
    costumes: {
      default:{id:'default',name:'Котик G',price:0,image:'hero-run.png',description:'Оригинальный герой'},
      bee:{id:'bee',name:'Пчёлка',price:25,image:'costume-bee.png',description:'Лёгкий костюм пчёлки'},
      dino:{id:'dino',name:'Динозавр',price:45,image:'costume-dino.png',description:'Костюм маленького динозавра'},
      space:{id:'space',name:'Космонавт',price:70,image:'costume-space.png',description:'Космический исследователь'},
      bunny:{id:'bunny',name:'Зайчик',price:90,image:'costume-bunny.png',description:'Розовый костюм зайчика'}
    },
    items:{coin:'item-coin.png',fish:'item-fish.png',bird:'item-bird.png',butterfly:'item-butterfly.png',ball:'item-ball.png'},
    enemies:{hedgehog:'enemy-hedgehog.png',crab:'enemy-crab.png',seagull:'enemy-seagull.png',spikeball:'enemy-spikeball.png',slime:'enemy-slime.png'},
    boss:'boss.png'
  };

  KG.Levels = [
    {
      id:0,name:'Зелёная долина',subtitle:'Рыбный луг',emoji:'🐟',objective:'Собери 5 рыбок и войди в портал',background:0,width:3400,spawn:[140,690],goalX:3180,par:65,
      platforms:[[0,760,600,70],[720,650,320,44],[1120,530,300,44],[1530,650,300,44],[1960,500,300,44],[2390,620,330,44],[2850,760,550,70]],
      moving:[[910,390,235,38,'x',135,1.25]],
      spikes:[[600,740,112],[1420,740,100],[2290,740,100]],
      enemies:[['hedgehog',1220,500,1120,1380,94],['slime',2050,470,1960,2220,88]],
      mission:[['fish',300,690],['fish',800,580],['fish',1210,460],['fish',2050,430],['fish',2500,550]],
      coins:[[460,675],[1000,320],[1660,580],[2750,690]],
      checkpoint:[1700,610]
    },
    {
      id:1,name:'Морской берег',subtitle:'Птичьи высоты',emoji:'🐦',objective:'Поймай 5 птичек среди движущихся платформ',background:1,width:3800,spawn:[120,690],goalX:3570,par:78,
      platforms:[[0,760,520,70],[650,620,260,44],[1050,470,260,44],[1460,310,260,44],[1880,470,280,44],[2300,285,270,44],[2750,470,280,44],[3250,760,550,70]],
      moving:[[910,300,215,38,'y',150,1.7],[1720,225,215,38,'x',145,1.45],[2580,230,205,38,'y',160,1.55]],
      spikes:[[520,740,115],[2150,740,125],[3090,740,120]],
      enemies:[['crab',740,590,660,870,102],['seagull',1980,440,1880,2140,116],['crab',2850,440,2760,3010,108]],
      mission:[['bird',770,550],['bird',1140,400],['bird',1540,240],['bird',2390,215],['bird',2840,400]],
      coins:[[410,680],[1270,670],[1810,145],[2640,150],[3400,690]],
      checkpoint:[1920,420]
    },
    {
      id:2,name:'Лес и руины',subtitle:'Шар и корзина',emoji:'⚽',objective:'Проведи шар через препятствия и закати в корзину',background:2,width:4100,spawn:[120,690],par:85,
      platforms:[[0,760,760,70],[880,635,320,44],[1330,760,430,70],[1860,590,320,44],[2310,760,470,70],[2910,620,320,44],[3390,760,710,70]],
      moving:[[1580,340,225,38,'y',145,1.6],[2600,350,210,38,'x',150,1.45]],
      spikes:[[760,740,115],[1760,740,105],[2790,740,105]],
      enemies:[['spikeball',1970,560,1870,2110,92],['hedgehog',3000,590,2920,3150,92]],
      mission:[],coins:[[330,680],[980,560],[1620,260],[2460,680],[3010,550],[3590,680]],
      ball:[500,700],basket:[3810,670],checkpoint:[2140,710]
    },
    {
      id:3,name:'Снежные горы',subtitle:'Бабочки на вершине',emoji:'🦋',objective:'Собери 4 бабочки и доберись до домика',background:3,width:4400,spawn:[120,690],house:[4160,585],par:92,
      platforms:[[0,760,560,70],[680,590,270,44],[1100,425,270,44],[1530,255,260,44],[1940,435,290,44],[2380,245,260,44],[2820,425,270,44],[3250,215,250,44],[3630,425,270,44],[4010,760,390,70]],
      moving:[[930,215,205,38,'y',140,1.7],[1780,130,215,38,'x',140,1.65],[3040,115,205,38,'y',150,1.55]],
      spikes:[[560,740,110],[2250,740,120],[3900,740,105]],
      enemies:[['seagull',2040,405,1960,2190,118],['spikeball',3720,395,3640,3860,90]],
      mission:[['butterfly',770,515],['butterfly',1610,185],['butterfly',2470,175],['butterfly',3330,150]],
      coins:[[410,680],[1180,355],[2060,360],[2910,355],[3720,355]],checkpoint:[2250,690]
    },
    {
      id:4,name:'Замок босса',subtitle:'Глиняный Хаос',emoji:'👹',objective:'Победи босса: атакуй сверху, когда он светится',background:4,width:3600,spawn:[140,690],par:120,
      platforms:[[0,760,3600,70],[560,545,320,44],[1260,410,320,44],[2040,545,320,44],[2820,350,320,44]],
      moving:[[940,250,230,38,'y',125,1.55],[2450,220,230,38,'x',145,1.45]],
      spikes:[[900,740,115],[1660,740,125],[2500,740,115],[3290,740,90]],
      enemies:[],mission:[],coins:[[690,475],[1380,340],[2150,475],[2940,280]],boss:[3120,610],checkpoint:[2320,690]
    }
  ];
})(window.KG = window.KG || {});
