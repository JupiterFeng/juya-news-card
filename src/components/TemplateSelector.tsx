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
import { type TemplateSummary } from '../templates/client-registry';
import { DEFAULT_TEMPLATE, THEME_CATEGORIES, type ThemeCategory } from '../templates/catalog';
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
