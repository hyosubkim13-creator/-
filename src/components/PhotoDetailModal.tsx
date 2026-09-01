import { useEffect, useState } from 'react'
import type { PhotoRecord } from '../lib/types'
import { toLocalInputValue } from '../lib/datetime'
import PhotoThumb from './PhotoThumb'

interface Props {
  photo: PhotoRecord
  onClose: () => void
  onSave: (id: string, patch: Partial<Omit<PhotoRecord, 'id' | 'createdAt' | 'thumbBlob' | 'blob'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function PhotoDetailModal({ photo, onClose, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [takenAt, setTakenAt] = useState(toLocalInputValue(new Date(photo.takenAt)))
  const [siteName, setSiteName] = useState(photo.siteName)
  const [unit, setUnit] = useState(photo.unit)
  const [workType, setWorkType] = useState(photo.workType)
  const [content, setContent] = useState(photo.content)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTakenAt(toLocalInputValue(new Date(photo.takenAt)))
    setSiteName(photo.siteName)
    setUnit(photo.unit)
    setWorkType(photo.workType)
    setContent(photo.content)
    setEditing(false)
  }, [photo])

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(photo.id, {
        takenAt: new Date(takenAt).toISOString(),
        siteName: siteName.trim(),
        unit: unit.trim(),
        workType: workType.trim(),
        content: content.trim(),
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('이 사진을 삭제하시겠습니까?')) return
    await onDelete(photo.id)
    onClose()
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h2>사진 상세</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="detail-body">
          <PhotoThumb blob={photo.blob} alt={photo.content || photo.siteName} className="detail-photo" />

          {editing ? (
            <div className="capture-form">
              <label className="field">
                <span>촬영일시</span>
                <input type="datetime-local" value={takenAt} onChange={(e) => setTakenAt(e.target.value)} />
              </label>
              <label className="field">
                <span>현장명</span>
                <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
              </label>
              <label className="field">
                <span>동/호 (위치)</span>
                <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} />
              </label>
              <label className="field">
                <span>공종</span>
                <input type="text" value={workType} onChange={(e) => setWorkType(e.target.value)} />
              </label>
              <label className="field">
                <span>내용</span>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                  취소
                </button>
                <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <dl className="detail-info">
                <dt>촬영일시</dt>
                <dd>{new Date(photo.takenAt).toLocaleString('ko-KR')}</dd>
                <dt>현장명</dt>
                <dd>{photo.siteName || '-'}</dd>
                <dt>동/호</dt>
                <dd>{photo.unit || '-'}</dd>
                <dt>공종</dt>
                <dd>{photo.workType || '-'}</dd>
                <dt>내용</dt>
                <dd>{photo.content || '-'}</dd>
                <dt>GPS</dt>
                <dd>{photo.lat != null && photo.lng != null ? `${photo.lat.toFixed(6)}, ${photo.lng.toFixed(6)}` : '-'}</dd>
              </dl>
              <div className="modal-actions">
                <button type="button" className="btn-danger" onClick={handleDelete}>
                  삭제
                </button>
                <button type="button" className="btn-primary" onClick={() => setEditing(true)}>
                  수정
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
