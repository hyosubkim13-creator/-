import { useEffect, useRef, useState } from 'react'
import type { PhotoInput } from '../lib/types'
import { nowLocalInputValue } from '../lib/datetime'

interface Props {
  siteOptions: string[]
  workTypeOptions: string[]
  onSubmit: (input: PhotoInput) => Promise<void>
  onClose: () => void
}

type GpsStatus = 'idle' | 'loading' | 'done' | 'denied' | 'unsupported'

export default function CaptureForm({ siteOptions, workTypeOptions, onSubmit, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [takenAt, setTakenAt] = useState(nowLocalInputValue())
  const [siteName, setSiteName] = useState('')
  const [unit, setUnit] = useState('')
  const [workType, setWorkType] = useState('')
  const [content, setContent] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    fetchGps()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function fetchGps() {
    if (!('geolocation' in navigator)) {
      setGpsStatus('unsupported')
      return
    }
    setGpsStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setGpsStatus('done')
      },
      () => setGpsStatus('denied'),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!file) {
      setError('사진을 선택해주세요.')
      return
    }
    if (!siteName.trim()) {
      setError('현장명을 입력해주세요.')
      return
    }
    setSaving(true)
    try {
      await onSubmit({
        blob: file,
        takenAt: new Date(takenAt).toISOString(),
        siteName: siteName.trim(),
        unit: unit.trim(),
        workType: workType.trim(),
        content: content.trim(),
        lat,
        lng,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h2>사진 등록</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="capture-form">
          <div className="photo-picker" onClick={() => fileInputRef.current?.click()}>
            {previewUrl ? (
              <img src={previewUrl} alt="선택한 사진 미리보기" className="photo-preview" />
            ) : (
              <div className="photo-placeholder">
                <span>📷</span>
                <span>탭하여 촬영 또는 사진 선택</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            hidden
          />

          <label className="field">
            <span>촬영일시</span>
            <input
              type="datetime-local"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>현장명</span>
            <input
              type="text"
              list="site-options"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="예) 행복아파트"
              required
            />
            <datalist id="site-options">
              {siteOptions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>

          <label className="field">
            <span>동/호 (위치)</span>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="예) 101동 지하1층 기계실"
            />
          </label>

          <label className="field">
            <span>공종</span>
            <input
              type="text"
              list="worktype-options"
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              placeholder="예) 방수공사"
            />
            <datalist id="worktype-options">
              {workTypeOptions.map((w) => (
                <option key={w} value={w} />
              ))}
            </datalist>
          </label>

          <label className="field">
            <span>내용</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="작업 내용을 입력하세요"
            />
          </label>

          <div className="gps-row">
            <span>
              {gpsStatus === 'loading' && '위치 확인 중...'}
              {gpsStatus === 'done' && lat != null && lng != null &&
                `위치: ${lat.toFixed(6)}, ${lng.toFixed(6)}`}
              {gpsStatus === 'denied' && '위치 권한이 거부되었습니다.'}
              {gpsStatus === 'unsupported' && '이 기기는 위치 정보를 지원하지 않습니다.'}
              {gpsStatus === 'idle' && '위치 정보 없음'}
            </span>
            <button type="button" className="link-btn" onClick={fetchGps}>
              다시 가져오기
            </button>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
