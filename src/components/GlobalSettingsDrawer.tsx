import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Tune } from '@mui/icons-material';
import type { AppGlobalSettings } from '../utils/global-settings';
import { EXPORT_FORMAT_OPTIONS, PNG_RENDERER_OPTIONS } from '../utils/global-settings';
import type { BackendLlmRuntimeConfig } from '../services/backend-config-service';
import { md3Colors } from '../theme/md3-theme';

interface GlobalSettingsDrawerProps {
  open: boolean;
  settings: AppGlobalSettings;
  cdnIconCount: number;
  backendLlmConfig: BackendLlmRuntimeConfig | null;
  backendLlmConfigLoading: boolean;
  backendLlmConfigError: string | null;
  onClose: () => void;
  onReset: () => void;
  onUpdateApiBaseUrl: (value: string) => void;
  onUpdateSettings: (updater: (prev: AppGlobalSettings) => AppGlobalSettings) => void;
  onUpdateIconMappingSetting: <K extends keyof AppGlobalSettings['iconMapping']>(
    key: K,
    value: AppGlobalSettings['iconMapping'][K]
  ) => void;
}

const GlobalSettingsDrawer: React.FC<GlobalSettingsDrawerProps> = ({
  open,
  settings,
  cdnIconCount,
  backendLlmConfig,
  backendLlmConfigLoading,
  backendLlmConfigError,
  onClose,
  onReset,
  onUpdateApiBaseUrl,
  onUpdateSettings,
  onUpdateIconMappingSetting,
}) => {
  const parseIntInput = (value: string): number | null => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const readOnlyValue = (value: unknown, fallback = 'N/A'): string => {
    const text = String(value ?? '').trim();
    return text || fallback;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          bgcolor: md3Colors.surface.surfaceContainerLow,
          borderLeft: '1px solid',
          borderColor: md3Colors.surface.outlineVariant,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tune sx={{ fontSize: 18, color: md3Colors.primary.main }} />
        <Typography variant="subtitle2" sx={{ color: md3Colors.surface.onSurface }}>
          Global Settings
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Chip
          label="Reset"
          size="small"
          variant="outlined"
          onClick={onReset}
          sx={{ cursor: 'pointer', height: 24, fontSize: 12 }}
        />
        <Chip
          label="Close"
          size="small"
          onClick={onClose}
          sx={{ cursor: 'pointer', height: 24, fontSize: 12 }}
        />
      </Box>

      <Typography variant="caption" sx={{ color: md3Colors.surface.onSurfaceVariant }}>
        Affect preview, export, and LLM generation globally.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          overflowY: 'auto',
          pr: 0.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: md3Colors.surface.onSurfaceVariant,
            fontWeight: 500,
            letterSpacing: '0.4px',
            mt: 0.5,
          }}
        >
          Layout
        </Typography>
        <TextField
          size="small"
          fullWidth
          type="number"
          label="Bottom Reserved (px)"
          value={settings.bottomReservedPx}
          onChange={(event) => {
            const value = parseIntInput(event.target.value);
            if (value === null) return;
            onUpdateSettings(prev => ({ ...prev, bottomReservedPx: value }));
          }}
        />

        <Typography
          variant="caption"
          sx={{
            color: md3Colors.surface.onSurfaceVariant,
            fontWeight: 500,
            letterSpacing: '0.4px',
            mt: 1,
          }}
        >
          Export
        </Typography>
        <FormControl size="small" fullWidth>
          <InputLabel>Image Format</InputLabel>
          <Select
            value={settings.exportFormat}
            label="Image Format"
            onChange={(event) =>
              onUpdateSettings(prev => ({
                ...prev,
                exportFormat: event.target.value as 'png' | 'svg',
              }))
            }
          >
            {EXPORT_FORMAT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                <Box>
                  <Typography variant="body2">{opt.label}</Typography>
                  <Typography variant="caption" sx={{ color: md3Colors.surface.onSurfaceVariant }}>
                    {opt.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth disabled={settings.exportFormat !== 'png'}>
          <InputLabel>PNG Renderer</InputLabel>
          <Select
            value={settings.pngRenderer}
            label="PNG Renderer"
            onChange={(event) =>
              onUpdateSettings(prev => ({
                ...prev,
                pngRenderer: event.target.value as AppGlobalSettings['pngRenderer'],
              }))
            }
          >
            {PNG_RENDERER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                <Box>
                  <Typography variant="body2">{opt.label}</Typography>
                  <Typography variant="caption" sx={{ color: md3Colors.surface.onSurfaceVariant }}>
                    {opt.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography
          variant="caption"
          sx={{
            color: md3Colors.surface.onSurfaceVariant,
            fontWeight: 500,
            letterSpacing: '0.4px',
            mt: 0.5,
          }}
        >
          Generate Request (App Backend)
        </Typography>
        <Typography variant="caption" sx={{ color: md3Colors.surface.onSurfaceVariant }}>
          这里配置的是本项目后端 `/api/generate` 的地址，不是上游 LLM 的 Base URL。
        </Typography>
        <TextField
          size="small"
          fullWidth
          label="App Backend API Base URL"
          value={settings.llm.baseURL}
          onChange={(event) => onUpdateApiBaseUrl(event.target.value)}
          helperText="例如 `/api` 或 `http://127.0.0.1:8080/api`；默认仅允许同源地址。"
        />
        <Typography
          variant="caption"
          sx={{
            color: md3Colors.surface.onSurfaceVariant,
            fontWeight: 500,
            letterSpacing: '0.4px',
            mt: 1,
          }}
        >
          LLM Runtime (Server Read-only)
        </Typography>
        {backendLlmConfigLoading && (
          <Typography variant="caption" sx={{ color: md3Colors.surface.onSurfaceVariant }}>
            Loading backend config...
          </Typography>
        )}
        {backendLlmConfigError && (
          <Typography variant="caption" sx={{ color: 'error.main' }}>
            {backendLlmConfigError}
          </Typography>
        )}
        <TextField
          size="small"
          fullWidth
          label="Model"
          value={readOnlyValue(backendLlmConfig?.model)}
          InputProps={{ readOnly: true }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            fullWidth
            label="Temperature"
            value={readOnlyValue(backendLlmConfig?.temperature)}
            InputProps={{ readOnly: true }}
          />
          <TextField
            size="small"
            fullWidth
            label="Top P"
            value={readOnlyValue(backendLlmConfig?.topP)}
            InputProps={{ readOnly: true }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            fullWidth
            label="Max Tokens (0 = auto)"
            value={readOnlyValue(backendLlmConfig?.maxTokens)}
            InputProps={{ readOnly: true }}
          />
          <TextField
            size="small"
            fullWidth
            label="Timeout (ms)"
            value={readOnlyValue(backendLlmConfig?.timeoutMs)}
            InputProps={{ readOnly: true }}
          />
        </Box>
        <TextField
          size="small"
          fullWidth
          label="Max Retries"
          value={readOnlyValue(backendLlmConfig?.maxRetries)}
          InputProps={{ readOnly: true }}
        />
        <TextField
          size="small"
          fullWidth
          label="Server LLM Base URL"
          value={readOnlyValue(backendLlmConfig?.baseURL)}
          InputProps={{ readOnly: true }}
        />
        <TextField
          size="small"
          fullWidth
          label="Allowed Models"
          value={readOnlyValue((backendLlmConfig?.allowedModels || []).join(', '))}
          InputProps={{ readOnly: true }}
        />
        <TextField
          size="small"
          fullWidth
          label="Client LLM Override"
          value={backendLlmConfig?.allowClientLlmSettings ? 'Enabled' : 'Disabled'}
          InputProps={{ readOnly: true }}
        />

        <Typography
          variant="caption"
          sx={{
            color: md3Colors.surface.onSurfaceVariant,
            fontWeight: 500,
            letterSpacing: '0.4px',
            mt: 1,
          }}
        >
          Icon Library Override
        </Typography>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={settings.iconMapping?.enabled || false}
              onChange={(event) => onUpdateIconMappingSetting('enabled', event.target.checked)}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: md3Colors.surface.onSurfaceVariant }}>
              Enable CDN Icon Matching
            </Typography>
          }
        />
        {settings.iconMapping?.enabled && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
            <TextField
              size="small"
              fullWidth
              label="CDN URL (JSON array)"
              value={settings.iconMapping.cdnUrl}
              onChange={(event) => onUpdateIconMappingSetting('cdnUrl', event.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              label="Fallback Icon"
              value={settings.iconMapping.fallbackIcon}
              onChange={(event) => onUpdateIconMappingSetting('fallbackIcon', event.target.value)}
            />
            <Typography variant="caption" sx={{ color: md3Colors.surface.onSurfaceVariant }}>
              Loaded icons: {cdnIconCount}
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default GlobalSettingsDrawer;
