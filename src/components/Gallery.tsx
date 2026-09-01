import { useMemo, useState } from 'react'
import type { PhotoRecord } from '../lib/types'
import { formatDisplayDateTime } from '../lib/datetime'
import PhotoThumb from './PhotoThumb'

interface Props {
  photos: PhotoRecord[]
  onSelect: (photo: PhotoRecord) => void
}

interface Group {
  siteName: string
  workType: string
  photos: PhotoRecord[]
}

export default function Gallery({ photos, onSelect }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Group>()
    for (const p of photos) {
      const site = p.siteName || '현장 미지정'
      const work = p.workType || '공종 미지정'
      const key = `${site}__${work}`
      if (!map.has(key)) map.set(key, { siteName: site, workType: work, photos: [] })
      map.get(key)!.photos.push(p)
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.siteName !== b.siteName) return a.siteName.localeCompare(b.siteName, 'ko')
      return a.workType.localeCompare(b.workType, 'ko')
    })
  }, [photos])

  if (photos.length === 0) {
    return <div className="empty-state">등록된 사진이 없습니다. 우측 하단 + 버튼으로 사진을 추가하세요.</div>
  }

  return (
    <div className="gallery">
      {groups.map((group) => {
        const key = `${group.siteName}__${group.workType}`
        const isCollapsed = collapsed[key]
        return (
          <section key={key} className="gallery-group">
            <button
              type="button"
              className="gallery-group-header"
              onClick={() => setCollapsed((c) => ({ ...c, [key]: !c[key] }))}
            >
              <span className="gallery-group-title">
                📁 {group.siteName} · {group.workType}
              </span>
              <span className="gallery-group-count">{group.photos.length}장</span>
              <span className="gallery-group-toggle">{isCollapsed ? '▶' : '▼'}</span>
            </button>
            {!isCollapsed && (
              <div className="gallery-grid">
                {group.photos.map((p) => (
                  <button key={p.id} type="button" className="gallery-item" onClick={() => onSelect(p)}>
                    <PhotoThumb blob={p.thumbBlob} alt={p.content || p.siteName} className="gallery-thumb" />
                    <span className="gallery-item-date">{formatDisplayDateTime(p.takenAt)}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
