import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { PhotoFilter, PhotoInput, PhotoRecord } from './types'

interface PhotoDB extends DBSchema {
  photos: {
    key: string
    value: PhotoRecord
    indexes: { siteName: string; workType: string; takenAt: string }
  }
}

const DB_NAME = 'construction-photo-manager'
const DB_VERSION = 1
const THUMB_MAX_SIZE = 480

let dbPromise: Promise<IDBPDatabase<PhotoDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<PhotoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('photos', { keyPath: 'id' })
        store.createIndex('siteName', 'siteName')
        store.createIndex('workType', 'workType')
        store.createIndex('takenAt', 'takenAt')
      },
    })
  }
  return dbPromise
}

async function makeThumbnail(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob)
  const scale = Math.min(1, THUMB_MAX_SIZE / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('썸네일 생성 실패'))),
      'image/jpeg',
      0.8,
    )
  })
}

export async function addPhoto(input: PhotoInput): Promise<PhotoRecord> {
  const db = await getDB()
  const thumbBlob = await makeThumbnail(input.blob)
  const record: PhotoRecord = {
    ...input,
    id: crypto.randomUUID(),
    thumbBlob,
    createdAt: new Date().toISOString(),
  }
  await db.put('photos', record)
  return record
}

export async function updatePhoto(id: string, patch: Partial<PhotoInput>): Promise<PhotoRecord> {
  const db = await getDB()
  const existing = await db.get('photos', id)
  if (!existing) throw new Error('사진을 찾을 수 없습니다')
  const updated: PhotoRecord = { ...existing, ...patch }
  await db.put('photos', updated)
  return updated
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('photos', id)
}

export async function getAllPhotos(): Promise<PhotoRecord[]> {
  const db = await getDB()
  const all = await db.getAll('photos')
  return all.sort((a, b) => b.takenAt.localeCompare(a.takenAt))
}

export function filterPhotos(photos: PhotoRecord[], filter: PhotoFilter): PhotoRecord[] {
  return photos.filter((p) => {
    if (filter.siteName && p.siteName !== filter.siteName) return false
    if (filter.workType && p.workType !== filter.workType) return false
    if (filter.dateFrom && p.takenAt < filter.dateFrom) return false
    if (filter.dateTo && p.takenAt > filter.dateTo + 'T23:59:59') return false
    if (filter.keyword) {
      const kw = filter.keyword.trim().toLowerCase()
      if (kw) {
        const hay = `${p.siteName} ${p.unit} ${p.workType} ${p.content}`.toLowerCase()
        if (!hay.includes(kw)) return false
      }
    }
    return true
  })
}
