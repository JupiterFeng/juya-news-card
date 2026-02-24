import { useEffect } from 'react';

type UseAppKeyboardShortcutsOptions = {
  templateIds: string[];
  currentTemplateIndex: number;
  selectedMockIndex: number | null;
  mockCount: number;
  onTemplateChange: (templateId: string) => void;
  onMockChange: (index: number) => void;
  onGenerate: () => void;
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tagName = target.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true;
  return target.closest('[contenteditable="true"], [role="textbox"]') !== null;
}

function cycleIndex(current: number, total: number, direction: 1 | -1): number {
  if (total <= 0) return -1;
  const normalized = ((current % total) + total) % total;
  return (normalized + direction + total) % total;
}

export function useAppKeyboardShortcuts(options: UseAppKeyboardShortcutsOptions): void {
  const {
    templateIds,
    currentTemplateIndex,
    selectedMockIndex,
    mockCount,
    onTemplateChange,
    onMockChange,
    onGenerate,
  } = options;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.repeat) return;

      const editable = isEditableTarget(event.target);
      const hasCommandModifier = event.ctrlKey || event.metaKey;
      if (hasCommandModifier && event.key === 'Enter') {
        event.preventDefault();
        onGenerate();
        return;
      }

      if (editable) return;
      if (event.ctrlKey || event.metaKey) return;

      // Shift + Alt + ArrowRight / ArrowLeft: next / previous template
      if (event.shiftKey && event.altKey && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
        if (templateIds.length === 0) return;
        event.preventDefault();
        const direction: 1 | -1 = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = cycleIndex(currentTemplateIndex >= 0 ? currentTemplateIndex : 0, templateIds.length, direction);
        const nextTemplateId = templateIds[nextIndex];
        if (nextTemplateId) {
          onTemplateChange(nextTemplateId);
        }
        return;
      }

      // Shift + Alt + ArrowDown / ArrowUp: next / previous mock data
      if (event.shiftKey && event.altKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        if (mockCount <= 0) return;
        event.preventDefault();
        const direction: 1 | -1 = event.key === 'ArrowDown' ? 1 : -1;
        const current = selectedMockIndex ?? (direction === 1 ? -1 : 0);
        const nextIndex = cycleIndex(current, mockCount, direction);
        if (nextIndex >= 0) {
          onMockChange(nextIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentTemplateIndex,
    mockCount,
    onGenerate,
    onMockChange,
    onTemplateChange,
    selectedMockIndex,
    templateIds,
  ]);
}
