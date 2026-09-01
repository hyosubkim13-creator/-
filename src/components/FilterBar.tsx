import type { PhotoFilter } from '../lib/types'

interface Props {
  filter: PhotoFilter
  siteOptions: string[]
  workTypeOptions: string[]
  onChange: (filter: PhotoFilter) => void
}

export default function FilterBar({ filter, siteOptions, workTypeOptions, onChange }: Props) {
  return (
    <div className="filter-bar">
      <input
        type="search"
        className="filter-keyword"
        placeholder="현장/위치/공종/내용 검색"
        value={filter.keyword ?? ''}
        onChange={(e) => onChange({ ...filter, keyword: e.target.value })}
      />
      <select
        value={filter.siteName ?? ''}
        onChange={(e) => onChange({ ...filter, siteName: e.target.value || undefined })}
      >
        <option value="">전체 현장</option>
        {siteOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={filter.workType ?? ''}
        onChange={(e) => onChange({ ...filter, workType: e.target.value || undefined })}
      >
        <option value="">전체 공종</option>
        {workTypeOptions.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={filter.dateFrom ?? ''}
        onChange={(e) => onChange({ ...filter, dateFrom: e.target.value || undefined })}
        aria-label="시작일"
      />
      <span className="date-sep">~</span>
      <input
        type="date"
        value={filter.dateTo ?? ''}
        onChange={(e) => onChange({ ...filter, dateTo: e.target.value || undefined })}
        aria-label="종료일"
      />
    </div>
  )
}
