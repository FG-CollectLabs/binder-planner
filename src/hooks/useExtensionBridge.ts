import { useEffect } from 'react'
import type { LibraryItem } from '../types/binder'
import { saveLibraryItem } from '../store/storage'
import { useBinderStore } from '../store/useBinderStore'

// Listens for 'binder-companion:add-to-library' postMessages from the
// extension's content script (content-binder.ts). Validates origin + source,
// writes the item to IndexedDB, updates the Zustand library, then acks back so
// the extension can prune it from chrome.storage inbox.
//
// Security: only accept messages from same origin and same window (the extension
// content script runs in the page's window context, so ev.source === window).
export function useExtensionBridge(): void {
  const addLibraryItem = useBinderStore(s => s.addLibraryItem)

  useEffect(() => {
    async function onMessage(ev: MessageEvent): Promise<void> {
      // Only trust messages from the same window on the same origin.
      if (ev.source !== window) return
      if (ev.origin !== window.location.origin) return

      const data = ev.data as { type?: string; item?: unknown }
      if (data?.type !== 'binder-companion:add-to-library') return

      const raw = data.item as Partial<LibraryItem>
      if (!raw?.id || !raw?.imageDataUrl) return

      const item: LibraryItem = {
        id: raw.id,
        type: raw.type ?? 'custom',
        imageDataUrl: raw.imageDataUrl,
        label: raw.label ?? 'Art of PKM',
        createdAt: raw.createdAt ?? new Date().toISOString(),
      }

      await saveLibraryItem(item)
      addLibraryItem(item)

      // Ack back so the content script knows it can remove this from the inbox.
      window.postMessage({ type: 'binder-companion:added', id: item.id }, window.location.origin)
    }

    window.addEventListener('message', (ev) => void onMessage(ev))
    return () => window.removeEventListener('message', (ev) => void onMessage(ev))
  }, [addLibraryItem])
}
