import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Search,
  Close,
  ChevronRight,
  ExpandMore,
  Style,
  ContentCopy,
  Check,
  Star,
  StarBorder,
  Apps,
} from '@mui/icons-material';
import { DEFAULT_TEMPLATE, type TemplateSummary } from '../templates/client-registry';
import { md3Colors } from '../theme/md3-theme';

const FAVORITES_STORAGE_KEY = 'prompt2view_favorites';

const getStoredFavorites = (): Set<string> => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // ignore
  }
  return new Set();
};

const saveFavorites = (favorites: Set<string>): void => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
  } catch {
    // ignore
  }
};

interface ThemeCategory {
  id: string;
  name: string;
  icon: string;
  themeIds: string[];
}

const THEME_CATEGORIES: ThemeCategory[] = [
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

const DRAWER_WIDTH = 280;

interface TemplateSelectorProps {
  currentTemplate: string;
  onTemplateChange: (id: string) => void;
  hasData: boolean;
  templates: Record<string, TemplateSummary>;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  currentTemplate,
  onTemplateChange,
  hasData,
  templates,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['product']));
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => getStoredFavorites());
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  // 当切换到收藏 Tab 时，自动展开收藏分类
  useEffect(() => {
    if (showFavorites) {
      setExpandedCategories(prev => {
        const next = new Set(prev);
        next.add('favorites');
        return next;
      });
    }
  }, [showFavorites]);

  const toggleFavorite = useCallback((templateId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  }, []);

  const handleCopyId = async (templateId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(templateId);
      setCopiedId(templateId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy template id:', error);
    }
  };

  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (showFavorites) {
      let favoriteIds = [...favorites].filter(id => templates[id]);

      if (query) {
        favoriteIds = favoriteIds.filter(id => {
          const template = templates[id];
          return template && (
            template.name.toLowerCase().includes(query) ||
            template.description?.toLowerCase().includes(query) ||
            template.id.toLowerCase().includes(query)
          );
        });
      }

      if (favoriteIds.length === 0) {
        return [];
      }
      return [{ id: 'favorites', name: '收藏', icon: 'star', themeIds: favoriteIds }];
    }

    if (!query) {
      return THEME_CATEGORIES;
    }

    return THEME_CATEGORIES.map(cat => ({
      ...cat,
      themeIds: cat.themeIds.filter(id => {
        const template = templates[id];
        return template && (
          template.name.toLowerCase().includes(query) ||
          template.description?.toLowerCase().includes(query) ||
          template.id.toLowerCase().includes(query)
        );
      })
    })).filter(cat => cat.themeIds.length > 0);
  }, [favorites, searchQuery, showFavorites, templates]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const handleTemplateClick = (templateId: string) => {
    const template = templates[templateId];
    if (template && (hasData || templateId === DEFAULT_TEMPLATE)) {
      onTemplateChange(templateId);
    }
  };

  const templateCount = Object.keys(templates).length;

  return (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: md3Colors.surface.surfaceContainerLow,
        borderRight: '1px solid',
        borderColor: md3Colors.surface.outlineVariant,
        overflow: 'hidden',
      }}
    >
            {/* Header */}
            <Box sx={{ p: 2, pb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Style sx={{ color: md3Colors.primary.main, fontSize: 20 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 500, color: md3Colors.surface.onSurface }}
                >
                  Themes
                </Typography>
              </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ px: 2, pb: 1.5, display: 'flex', gap: 1 }}>
              <Chip
                label={`All (${templateCount})`}
                size="small"
                icon={<Apps sx={{ fontSize: 14 }} />}
                onClick={() => setShowFavorites(false)}
                variant={!showFavorites ? 'filled' : 'outlined'}
                color={!showFavorites ? 'primary' : 'default'}
                sx={{ cursor: 'pointer' }}
              />
              <Chip
                label={`Favorites (${favorites.size})`}
                size="small"
                icon={<Star sx={{ fontSize: 14 }} />}
                onClick={() => setShowFavorites(true)}
                variant={showFavorites ? 'filled' : 'outlined'}
                color={showFavorites ? 'primary' : 'default'}
                sx={{ cursor: 'pointer' }}
              />
            </Box>

            {/* Search */}
            <Box sx={{ px: 2, pb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 18, color: md3Colors.surface.onSurfaceVariant }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')} edge="end">
                        <Close sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Theme List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {filteredCategories.map(category => {
                const isExpanded = expandedCategories.has(category.id) || !!searchQuery;
                const categoryTemplates = category.themeIds.map(id => templates[id]).filter(Boolean);
                if (categoryTemplates.length === 0) return null;

                return (
                  <Box key={category.id}>
                    {/* Category Header */}
                    <Box
                      component="button"
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      aria-expanded={isExpanded}
                      sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1.5,
                        border: 'none',
                        bgcolor: md3Colors.surface.surfaceContainerLow,
                        color: md3Colors.surface.onSurface,
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        outline: 'none',
                        transition: 'background-color 0.2s',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        '&:hover': {
                          bgcolor: md3Colors.surface.surfaceContainer,
                        },
                      }}
                    >
                      {isExpanded ? (
                        <ExpandMore sx={{ fontSize: 18, color: md3Colors.surface.onSurfaceVariant }} />
                      ) : (
                        <ChevronRight sx={{ fontSize: 18, color: md3Colors.surface.onSurfaceVariant }} />
                      )}
                      <span className="material-icons" style={{ fontSize: 18, color: md3Colors.surface.onSurfaceVariant }}>
                        {category.icon}
                      </span>
                      <Typography
                        variant="caption"
                        sx={{
                          flex: 1,
                          fontWeight: 500,
                          color: md3Colors.surface.onSurface,
                          letterSpacing: '0.1px',
                        }}
                      >
                        {category.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: md3Colors.surface.onSurfaceVariant }}
                      >
                        {categoryTemplates.length}
                      </Typography>
                    </Box>

                    {/* Template Items */}
                    {isExpanded && (
                      <List dense disablePadding sx={{ py: 0.5, px: 1 }}>
                        {categoryTemplates.map(template => {
                          const isActive = currentTemplate === template.id;
                          const isDisabled = !hasData && template.id !== DEFAULT_TEMPLATE;

                          return (
                            <ListItemButton
                              key={template.id}
                              selected={isActive}
                              disabled={isDisabled}
                              onClick={() => handleTemplateClick(template.id)}
                              sx={{
                                py: 1,
                                borderRadius: 28,
                                mx: 0.5,
                                mb: 0.25,
                                '&.Mui-selected': {
                                  bgcolor: md3Colors.primary.container,
                                  color: md3Colors.primary.onContainer,
                                  '&:hover': {
                                    bgcolor: '#B8D4FC',
                                  },
                                },
                                '&:hover': {
                                  bgcolor: md3Colors.surface.surfaceContainerHigh,
                                },
                              }}
                            >
                              {template.icon && (
                                <span
                                  className="material-icons"
                                  style={{
                                    fontSize: 18,
                                    marginRight: 12,
                                    color: isActive ? md3Colors.primary.main : md3Colors.surface.onSurfaceVariant,
                                  }}
                                >
                                  {template.icon}
                                </span>
                              )}
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    noWrap
                                    sx={{
                                      fontWeight: isActive ? 500 : 400,
                                      color: isActive ? md3Colors.primary.onContainer : md3Colors.surface.onSurface,
                                    }}
                                  >
                                    {template.name}
                                  </Typography>
                                }
                                secondary={
                                  <Box
                                    component="button"
                                    type="button"
                                    onClick={(e) => handleCopyId(template.id, e)}
                                    aria-label={`Copy ${template.id}`}
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      mt: 0.5,
                                      px: 0.75,
                                      py: 0.25,
                                      borderRadius: 1,
                                      bgcolor: 'transparent',
                                      color: copiedId === template.id
                                        ? '#1E8E3E'
                                        : md3Colors.surface.onSurfaceVariant,
                                      fontSize: '0.7rem',
                                      fontFamily: 'monospace',
                                      cursor: 'pointer',
                                      border: 'none',
                                      outline: 'none',
                                      transition: 'all 0.15s',
                                      '&:hover': {
                                        bgcolor: md3Colors.surface.surfaceContainer,
                                      },
                                    }}
                                  >
                                    {copiedId === template.id ? 'copied' : template.id}
                                    {copiedId === template.id ? (
                                      <Check sx={{ fontSize: 10 }} />
                                    ) : (
                                      <ContentCopy sx={{ fontSize: 10 }} />
                                    )}
                                  </Box>
                                }
                                secondaryTypographyProps={{ component: 'div' }}
                              />
                              <Tooltip title={favorites.has(template.id) ? 'Remove from favorites' : 'Add to favorites'}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => toggleFavorite(template.id, e)}
                                  sx={{
                                    p: 0.5,
                                    color: favorites.has(template.id) ? '#FFB300' : md3Colors.surface.outlineVariant,
                                  }}
                                >
                                  {favorites.has(template.id) ? (
                                    <Star sx={{ fontSize: 16 }} />
                                  ) : (
                                    <StarBorder sx={{ fontSize: 16 }} />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </ListItemButton>
                          );
                        })}
                      </List>
                    )}
                  </Box>
                );
              })}

              {filteredCategories.length === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 4,
                    px: 3,
                    color: md3Colors.surface.onSurfaceVariant,
                    textAlign: 'center',
                  }}
                >
                  <span
                    className="material-icons"
                    style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}
                  >
                    {showFavorites ? 'star_border' : 'search_off'}
                  </span>
                  <Typography variant="body2">
                    {showFavorites ? 'No favorites yet' : 'No results'}
                  </Typography>
                  {showFavorites && (
                    <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.7 }}>
                      Click the star icon on any theme to add it to favorites
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
    </Box>
  );
};

export default TemplateSelector;
