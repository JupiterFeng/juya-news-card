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
import type { AppGlobalSettings, LlmGlobalSettings } from '../utils/global-settings';
import { EXPORT_FORMAT_OPTIONS, PNG_RENDERER_OPTIONS } from '../utils/global-settings';
import { md3Colors } from '../theme/md3-theme';

interface GlobalSettingsDrawerProps {
  open: boolean;
  settings: AppGlobalSettings;
  cdnIconCount: number;
  onClose: () => void;
  onReset: () => void;
  onUpdateSettings: (updater: (prev: AppGlobalSettings) => AppGlobalSettings) => void;
  onUpdateLlmSetting: <K extends keyof LlmGlobalSettings>(key: K, value: LlmGlobalSettings[K]) => void;
  onUpdateIconMappingSetting: <K extends keyof AppGlobalSettings['iconMapping']>(
    key: K,
    value: AppGlobalSettings['iconMapping'][K]
  ) => void;
}

const GlobalSettingsDrawer: React.FC<GlobalSettingsDrawerProps> = ({
  open,
  settings,
  cdnIconCount,
  onClose,
  onReset,
  onUpdateSettings,
  onUpdateLlmSetting,
  onUpdateIconMappingSetting,
}) => {
  const parseFloatInput = (value: string): number | null => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseIntInput = (value: string): number | null => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
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
          Generate API Request
        </Typography>
        <Typography variant="caption" sx={{ color: md3Colors.surface.onSurfaceVariant }}>
          Server 端默认会忽略客户端 LLM 覆盖参数，除非后端启用 `ALLOW_CLIENT_LLM_SETTINGS=true`。
        </Typography>
        <TextField
          size="small"
          fullWidth
          label="Generate API Base URL"
          value={settings.llm.baseURL}
          onChange={(event) => onUpdateLlmSetting('baseURL', event.target.value)}
          helperText="默认仅允许同源地址；跨域需显式配置 VITE_ALLOW_CROSS_ORIGIN_API=true。"
        />
        <TextField
          size="small"
          fullWidth
          label="Model"
          value={settings.llm.model}
          onChange={(event) => onUpdateLlmSetting('model', event.target.value)}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            fullWidth
            type="number"
            label="Temperature"
            value={settings.llm.temperature}
            inputProps={{ step: 0.1, min: 0, max: 2 }}
            onChange={(event) => {
              const value = parseFloatInput(event.target.value);
              if (value === null) return;
              onUpdateLlmSetting('temperature', value);
            }}
          />
          <TextField
            size="small"
            fullWidth
            type="number"
            label="Top P"
            value={settings.llm.topP}
            inputProps={{ step: 0.1, min: 0, max: 1 }}
            onChange={(event) => {
              const value = parseFloatInput(event.target.value);
              if (value === null) return;
              onUpdateLlmSetting('topP', value);
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            fullWidth
            type="number"
            label="Max Tokens (0 = auto)"
            value={settings.llm.maxTokens}
            inputProps={{ step: 1, min: 0 }}
            onChange={(event) => {
              const value = parseIntInput(event.target.value);
              if (value === null) return;
              onUpdateLlmSetting('maxTokens', value);
            }}
          />
          <TextField
            size="small"
            fullWidth
            type="number"
            label="Timeout (ms)"
            value={settings.llm.timeoutMs}
            inputProps={{ step: 1000, min: 1000 }}
            onChange={(event) => {
              const value = parseIntInput(event.target.value);
              if (value === null) return;
              onUpdateLlmSetting('timeoutMs', value);
            }}
          />
        </Box>
        <TextField
          size="small"
          fullWidth
          type="number"
          label="Max Retries"
          value={settings.llm.maxRetries}
          inputProps={{ step: 1, min: 0 }}
          onChange={(event) => {
            const value = parseIntInput(event.target.value);
            if (value === null) return;
            onUpdateLlmSetting('maxRetries', value);
          }}
        />
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={8}
          label="System Prompt (sent to /generate)"
          value={settings.llm.systemPrompt}
          onChange={(event) => onUpdateLlmSetting('systemPrompt', event.target.value)}
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
              Enable CDN Matching & 3 Icons Prompt
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
