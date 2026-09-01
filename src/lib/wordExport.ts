import {
  AlignmentType,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'
import { saveAs } from 'file-saver'
import type { PhotoRecord } from './types'
import { formatDisplayDate, formatDisplayDateTime } from './datetime'

const FONT = '바탕'
const IMAGE_MAX_WIDTH = 200

async function getImageDims(blob: Blob): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(blob)
  const width = bitmap.width
  const height = bitmap.height
  bitmap.close?.()
  const scale = Math.min(1, IMAGE_MAX_WIDTH / width)
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

function textCell(text: string, opts: { bold?: boolean; width?: number } = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, font: FONT, bold: opts.bold, size: 20 })],
      }),
    ],
  })
}

async function photoRow(index: number, photo: PhotoRecord): Promise<TableRow> {
  const buf = await photo.blob.arrayBuffer()
  const { width, height } = await getImageDims(photo.blob)
  const imageCell = new TableCell({
    width: { size: 22, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: buf,
            transformation: { width, height },
            type: photo.blob.type === 'image/png' ? 'png' : 'jpg',
          }),
        ],
      }),
    ],
  })

  const location = [photo.siteName, photo.unit].filter(Boolean).join(' ')

  return new TableRow({
    children: [
      textCell(String(index), { width: 6 }),
      imageCell,
      textCell(formatDisplayDateTime(photo.takenAt), { width: 16 }),
      textCell(location || '-', { width: 18 }),
      textCell(photo.workType || '-', { width: 14 }),
      textCell(photo.content || '-', { width: 24 }),
    ],
  })
}

function headerRow(): TableRow {
  return new TableRow({
    tableHeader: true,
    children: [
      textCell('번호', { bold: true, width: 6 }),
      textCell('사진', { bold: true, width: 22 }),
      textCell('촬영일시', { bold: true, width: 16 }),
      textCell('위치', { bold: true, width: 18 }),
      textCell('공종', { bold: true, width: 14 }),
      textCell('내용', { bold: true, width: 24 }),
    ],
  })
}

export async function exportPhotoLogToWord(
  photos: PhotoRecord[],
  options: { title?: string; groupBySite?: boolean } = {},
): Promise<void> {
  const title = options.title ?? '공사 사진대장'
  const groupBySite = options.groupBySite ?? true

  const bodyChildren: (Paragraph | Table)[] = []

  bodyChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: title, font: FONT, bold: true, size: 32 })],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 300 },
      children: [
        new TextRun({ text: `작성일자: ${formatDisplayDate(new Date().toISOString())}`, font: FONT, size: 20 }),
      ],
    }),
  )

  if (groupBySite) {
    const groups = new Map<string, PhotoRecord[]>()
    for (const p of photos) {
      const key = p.siteName || '현장 미지정'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(p)
    }
    const sortedKeys = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b, 'ko'))

    for (const site of sortedKeys) {
      const sitePhotos = groups.get(site)!
      bodyChildren.push(
        new Paragraph({
          spacing: { before: 300, after: 150 },
          children: [new TextRun({ text: `■ ${site}`, font: FONT, bold: true, size: 24 })],
        }),
      )
      const rows = [headerRow()]
      for (let i = 0; i < sitePhotos.length; i++) {
        rows.push(await photoRow(i + 1, sitePhotos[i]))
      }
      bodyChildren.push(
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }),
      )
    }
  } else {
    const rows = [headerRow()]
    for (let i = 0; i < photos.length; i++) {
      rows.push(await photoRow(i + 1, photos[i]))
    }
    bodyChildren.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }))
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: FONT, size: 20 } },
      },
    },
    sections: [
      {
        properties: {},
        children: bodyChildren,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const filename = `사진대장_${formatDisplayDate(new Date().toISOString()).replace(/\./g, '')}.docx`
  saveAs(blob, filename)
}
