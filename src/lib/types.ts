export interface PhotoRecord {
  id: string
  blob: Blob
  thumbBlob: Blob
  takenAt: string // ISO datetime, editable
  siteName: string // 현장명
  unit: string // 동/호 등 세부 위치
  workType: string // 공종
  content: string // 내용/설명
  lat: number | null
  lng: number | null
  createdAt: string // ISO datetime, record creation
}

export type PhotoInput = Omit<PhotoRecord, 'id' | 'createdAt' | 'thumbBlob'>

export interface PhotoFilter {
  siteName?: string
  workType?: string
  keyword?: string
  dateFrom?: string
  dateTo?: string
}
