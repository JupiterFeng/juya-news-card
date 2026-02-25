export const DEFAULT_TEMPLATE = 'claudeStyle';

export interface ThemeCategory {
  id: string;
  name: string;
  icon: string;
  themeIds: string[];
}

export const THEME_CATEGORIES: ThemeCategory[] = [
  { id: 'product', name: '产品级设计语言', icon: 'business', themeIds: ['claudeStyle', 'newsCard', 'googleMaterial', 'appleEvent', 'microsoftFluent', 'blogGlass', 'ibmCarbon', 'salesforceLightning', 'atlassianDesign', 'shopifyPolaris', 'sapFiori', 'adobeSpectrum', 'githubPrimer', 'antDesign', 'bootstrap', 'tailwindCss', 'govukDesign'] },
  { id: 'visual-story', name: '摄影与视觉叙事', icon: 'photo_camera', themeIds: ['cinematicFilm', 'filmGrainAnalog', 'blackWhiteEditorial', 'highLowKey', 'duotonePhotography'] },
  { id: 'typography', name: '字体与排版语言', icon: 'format_size', themeIds: ['serifClassic', 'variableTypography', 'expressiveType', 'monospaceLed', 'gridPoster'] },
  { id: 'interaction', name: '交互与动效', icon: 'touch_app', themeIds: ['microInteraction', 'scrollStory', 'skeuomorphicMotion', 'motionBranding'] },
  { id: '3d-space', name: '3D与空间', icon: 'view_in_ar', themeIds: ['render3D', 'lowPoly3D', 'isometric3D', 'claySoft3D', 'vector3D'] },
  { id: 'graphic-pattern', name: '图形与装饰', icon: 'pattern', themeIds: ['patternDriven', 'geometricMinimal', 'risograph', 'halftoneComic', 'stickerBomb'] },
  { id: 'density', name: '信息密度与界面结构', icon: 'dashboard', themeIds: ['denseProductivity', 'whitespaceLuxury', 'cardFirst', 'onePageHero'] },
  { id: 'ui-material', name: 'UI材质与界面审美', icon: 'layers', themeIds: ['flatDesign', 'skeuomorphism', 'neumorphism', 'brutalism', 'glassmorphism'] },
  { id: 'visual-style', name: '视觉风格', icon: 'palette', themeIds: ['swissStyle', 'bauhaus', 'memphis', 'minimalism', 'aurora', 'claymorphism'] },
  { id: 'retro', name: '复古与时代感', icon: 'history', themeIds: ['y2kStyle', 'vaporwave', 'pixelArt', 'terminalCli', 'synthwave', 'frutigerAero', 'aquaGlossy', 'retroWin95', 'web1Geocities'] },
  { id: 'trendy', name: '流行趋势', icon: 'trending_up', themeIds: ['neoBrutalism', 'bentoGrid', 'kawaiiCute', 'grainNoise'] },
  { id: 'tech-future', name: '科技未来', icon: 'rocket_launch', themeIds: ['holographicIridescent', 'liquidBlobmorphism', 'sciFiHud', 'generativeParametric'] },
  { id: 'editorial', name: '排版与信息表达', icon: 'article', themeIds: ['editorialMagazine', 'wireframe'] },
  { id: 'other', name: '其他风格', icon: 'category', themeIds: ['swissPunk', 'warmCard', 'springFestivalStyle', 'collageScrapbook', 'outlineStroke', 'hyperMinimal'] },
  { id: 'os-ui-history', name: '操作系统UI历史', icon: 'computer', themeIds: ['amigaWorkbench', 'motifChiseled', 'nextstep', 'cdeDesktop', 'windows95', 'beos', 'palmOs', 'os2Warp', 'system7Mac', 'windowsXpLuna', 'vistaAero', 'webosCards', 'metroModern', 'gnome3Adwaita', 'androidHolo', 'windows8Start', 'ios7Flat', 'yosemiteFlat', 'breezeFlat', 'materialYou', 'windows11', 'chromeosMaterialYou', 'liquidGlass', 'material3Expressive'] },
  { id: 'arch-space', name: '建筑与空间设计', icon: 'apartment', themeIds: ['wabiSabi', 'japandi', 'midCenturyModern', 'biophilicDesign', 'deconstructivism'] },
  { id: 'industrial-design', name: '工业设计与产品', icon: 'precision_manufacturing', themeIds: ['braunFunctional', 'mujiAnonymous', 'modularRepairable', 'materialHonesty'] },
  { id: 'brand-identity', name: '品牌识别系统', icon: 'diamond', themeIds: ['dynamicIdentity', 'monogramSignature', 'pictogramLanguage'] },
  { id: 'info-wayfinding', name: '信息设计与导视系统', icon: 'signpost', themeIds: ['wayfindingSignage', 'transitMapAbstract', 'instructionalManual'] },
  { id: 'service-design', name: '服务设计', icon: 'support_agent', themeIds: ['serviceBlueprint', 'inclusiveDesign', 'behavioralNudge', 'calmTechnology'] },
  { id: 'interaction-forms', name: '交互形态', icon: 'touch_app', themeIds: ['tangibleUi', 'spatialXrUi', 'ambientUi'] },
  { id: 'chinese-painting', name: '中国绘画体系', icon: 'brush', themeIds: ['gongbiStyle', 'baimiaoStyle', 'xieyiStyle', 'pomoStyle', 'moguStyle', 'inkLandscape', 'blueGreenLandscape', 'flowerBird', 'woodblockPrint', 'paperCut'] },
  { id: 'japanese-art', name: '日本美术体系', icon: 'waves', themeIds: ['ukiyoPrint', 'rinpaSchool', 'sumiStyle', 'japaneseFolk'] },
  { id: 'western-painting', name: '西方绘画体系', icon: 'palette', themeIds: ['impressionism', 'pointillism', 'fauvism', 'expressionism', 'cubism', 'surrealism', 'abstractArt', 'popArt'] },
  { id: 'print-illustration', name: '版画与插画技法', icon: 'draw', themeIds: ['woodcutStyle', 'etchingStyle', 'silkscreenStyle', 'lineIllustration', 'flatVector', 'painterlyStyle', 'watercolorStyle', 'collageStyle', 'pixelArtStyle'] },
  { id: 'comic-style', name: '漫画风格', icon: 'menu_book', themeIds: ['cleanLineComic', 'heavyInk', 'celLookComic', 'painterlyComic', 'chibiStyle'] },
  { id: 'animation-style', name: '动画风格', icon: 'movie', themeIds: ['ghibliStyle', 'disneyClassic', 'limitedAnimation', 'cartoonModern', 'digitalEffects', 'photoRealBg', 'compositionExperimental', 'dynamicExplosion', 'stopMotion', 'cutoutAnimation', 'hybrid2D3D'] }
];
