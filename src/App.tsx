import { useEffect, useMemo, useState } from 'react'
import CaptureForm from './components/CaptureForm'
import FilterBar from './components/FilterBar'
import Gallery from './components/Gallery'
import PhotoDetailModal from './components/PhotoDetailModal'
import { addPhoto, deletePhoto, filterPhotos, getAllPhotos, updatePhoto } from './lib/db'
import type { PhotoFilter, PhotoRecord } from './lib/types'
import { exportPhotoLogToWord } from './lib/wordExport'

function App() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<PhotoFilter>({})
  const [showCapture, setShowCapture] = useState(false)
  const [selected, setSelected] = useState<PhotoRecord | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    refresh()
  }, [])

  async function refresh() {
    setLoading(true)
    try {
      const all = await getAllPhotos()
      setPhotos(all)
    } finally {
      setLoading(false)
    }
  }

  const siteOptions = useMemo(
    () => Array.from(new Set(photos.map((p) => p.siteName).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ko')),
    [photos],
  )
  const workTypeOptions = useMemo(
    () => Array.from(new Set(photos.map((p) => p.workType).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ko')),
    [photos],
  )
  const filtered = useMemo(() => filterPhotos(photos, filter), [photos, filter])

  async function handleAddPhoto(input: Parameters<typeof addPhoto>[0]) {
    await addPhoto(input)
    await refresh()
  }

  async function handleUpdate(id: string, patch: Parameters<typeof updatePhoto>[1]) {
    await updatePhoto(id, patch)
    await refresh()
    setSelected((prev) => (prev && prev.id === id ? { ...prev, ...patch } as PhotoRecord : prev))
  }

  async function handleDelete(id: string) {
    await deletePhoto(id)
    await refresh()
  }

  async function handleExport() {
    if (filtered.length === 0) return
    setExporting(true)
    try {
      await exportPhotoLogToWord(filtered)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>공사 사진관리</h1>
        <button
          type="button"
          className="btn-outline"
          onClick={handleExport}
          disabled={exporting || filtered.length === 0}
        >
          {exporting ? '내보내는 중...' : '사진대장 워드 내보내기'}
        </button>
      </header>

      <FilterBar filter={filter} siteOptions={siteOptions} workTypeOptions={workTypeOptions} onChange={setFilter} />

      <main className="app-main">
        {loading ? (
          <div className="empty-state">불러오는 중...</div>
        ) : (
          <Gallery photos={filtered} onSelect={setSelected} />
        )}
      </main>

      <button type="button" className="fab" onClick={() => setShowCapture(true)} aria-label="사진 추가">
        +
      </button>

      {showCapture && (
        <CaptureForm
          siteOptions={siteOptions}
          workTypeOptions={workTypeOptions}
          onSubmit={handleAddPhoto}
          onClose={() => setShowCapture(false)}
        />
      )}

      {selected && (
        <PhotoDetailModal
          photo={selected}
          onClose={() => setSelected(null)}
          onSave={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default App
