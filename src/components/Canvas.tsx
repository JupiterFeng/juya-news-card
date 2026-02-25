import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Style } from '@mui/icons-material';
import { GeneratedContent } from '../types';
import { TemplateConfig } from '../templates/types';
import { BOTTOM_RESERVED_PX } from '../utils/layout-calculator';
import { md3Colors } from '../theme/md3-theme';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

interface CanvasProps {
  data: GeneratedContent | null;
  template: TemplateConfig;
  scale: number;
  bottomReservedPx?: number;
  exportRef?: React.MutableRefObject<HTMLDivElement | null>;
}

const Canvas: React.FC<CanvasProps> = ({
  data,
  template,
  scale,
  bottomReservedPx = BOTTOM_RESERVED_PX,
  exportRef,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const setHostRef = useCallback((node: HTMLDivElement | null) => {
    hostRef.current = node;
    if (exportRef) {
      exportRef.current = node;
    }
  }, [exportRef]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.dataset.p2vBottomReserved = String(bottomReservedPx);
    const host = hostRef.current;
    if (!host) return;

    const mainContainer = host.querySelector<HTMLElement>('.main-container');
    let target: HTMLElement | null = mainContainer;
    if (!target) {
      const all = host.querySelectorAll<HTMLElement>('*');
      for (const el of all) {
        const cn = el.className;
        if (typeof cn !== 'string') continue;
        const matched =
          cn.includes('container') &&
          cn.includes('flex') &&
          cn.includes('flex-col') &&
          cn.includes('items-center') &&
          cn.includes('justify-center') &&
          cn.includes('w-full') &&
          cn.includes('h-full');
        if (matched) {
          target = el;
          break;
        }
      }
    }

    if (!target) return;
    const reserve = Number.isFinite(bottomReservedPx) ? Math.max(0, bottomReservedPx) : BOTTOM_RESERVED_PX;
    const previousReserve = Number.parseFloat(target.dataset.bottomReserved || '0');
    let basePaddingBottom = Number.parseFloat(target.dataset.p2vBasePaddingBottom || '');

    if (!Number.isFinite(basePaddingBottom)) {
      const computedPaddingBottom = Number.parseFloat(window.getComputedStyle(target).paddingBottom) || 0;
      basePaddingBottom = computedPaddingBottom - (Number.isFinite(previousReserve) ? previousReserve : 0);
      if (!Number.isFinite(basePaddingBottom) || basePaddingBottom < 0) {
        basePaddingBottom = computedPaddingBottom;
      }
    }

    target.style.paddingBottom = `${basePaddingBottom + reserve}px`;
    target.style.boxSizing = 'border-box';
    target.dataset.p2vBasePaddingBottom = String(basePaddingBottom);
    target.dataset.bottomReserved = String(reserve);

    const applyViewportFit = () => {
      const wrapper = host.querySelector<HTMLElement>('.content-wrapper') || target;
      const maxH = Math.max(0, 1040 - reserve);
      const contentH = wrapper.scrollHeight;
      if (contentH > maxH) {
        const scaleVal = Math.max(0.6, maxH / contentH);
        wrapper.style.transform = `scale(${scaleVal})`;
        wrapper.dataset.p2vViewportFitScaled = 'true';
        return;
      }
      if (wrapper.dataset.p2vViewportFitScaled === 'true') {
        wrapper.style.transform = '';
        delete wrapper.dataset.p2vViewportFitScaled;
      }
    };

    applyViewportFit();
    const timer = window.setTimeout(applyViewportFit, 60);

    try {
      if (typeof window.CustomEvent === 'function') {
        window.dispatchEvent(new window.CustomEvent('p2v:layout-change'));
      } else {
        window.dispatchEvent(new Event('p2v:layout-change'));
      }
    } catch {
      // ignore
    }

    return () => {
      window.clearTimeout(timer);
    };
  }, [data, template.id, bottomReservedPx]);

  if (!data) {
    if (exportRef) {
      exportRef.current = null;
    }
    return (
      <Box
        sx={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: md3Colors.surface.surfaceContainerLowest,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Style
            sx={{
              fontSize: 56,
              color: md3Colors.surface.outlineVariant,
              mb: 2
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              color: md3Colors.surface.onSurfaceVariant,
            }}
          >
            Generate a card to preview
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <div
      ref={setHostRef}
      style={{
        width: `${CANVAS_WIDTH * scale}px`,
        height: `${CANVAS_HEIGHT * scale}px`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {template.render(data, scale)}
    </div>
  );
};

export default Canvas;
