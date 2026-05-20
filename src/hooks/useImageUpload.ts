import { v4 as uuid } from 'uuid'
import type { ItemType, LibraryItem } from '../types/binder'

export async function fileToLibraryItem(file: File, type: ItemType): Promise<LibraryItem> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        id: uuid(),
        type,
        imageDataUrl: reader.result as string,
        label: file.name.replace(/\.[^.]+$/, ''),
        createdAt: new Date().toISOString(),
      })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
