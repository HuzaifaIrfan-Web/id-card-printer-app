import React, { useEffect, useState } from 'react'
import { MODES, buildSheets, mirroredPosition, backRotation } from '../utils/layout.js'
import { APP_NAME, APP_VERSION, AUTHOR } from '../meta.js'

function Page({ cssVars, rows, cells, showGuides, pageKind, pageNum, totalPages, showChrome }) {
  return (
    <div className="a4-page" style={cssVars} data-page-kind={pageKind}>
      {showChrome && (
        <div className="page-header">
          {APP_NAME} v{APP_VERSION} · Developed by {AUTHOR.name}
        </div>
      )}
      <div className="grid8" style={{ gridTemplateRows: `repeat(${rows}, var(--card-h))` }}>
        {cells.map((c) => (
          <div
            key={c.key}
            className={`cell ${showGuides ? 'cell--guides' : ''} ${!c.image ? 'cell--empty' : ''}`}
            style={{ gridRow: c.row + 1, gridColumn: c.col + 1 }}
          >
            {c.image ? (
              <img src={c.image} alt="" style={c.transform ? { transform: c.transform } : undefined} />
            ) : null}
          </div>
        ))}
      </div>
      {showChrome && (
        <div className="page-footer">
          <span>
            Page {pageNum} of {totalPages}
          </span>
          <span>{AUTHOR.website}</span>
        </div>
      )}
    </div>
  )
}

export default function PrintView({ cards, settings }) {
  const [phase, setPhase] = useState(null) // null | 'fronts' | 'backs'
  const mode = MODES[settings.mode]
  const sheets = buildSheets(cards, settings.mode)
  const rows = mode.rows

  const contentW = 2 * settings.cardWidth + settings.gap
  const contentH = rows * settings.cardHeight + (rows - 1) * settings.gap
  const marginX = Math.max(0, (210 - contentW) / 2)
  const marginY = Math.max(0, (297 - contentH) / 2)
  const overflow = contentW > 210 || contentH > 297

  const cssVars = {
    '--card-w': `${settings.cardWidth}mm`,
    '--card-h': `${settings.cardHeight}mm`,
    '--gap': `${settings.gap}mm`,
    '--margin-x': `${marginX}mm`,
    '--margin-y': `${marginY}mm`,
  }

  useEffect(() => {
    function handleAfterPrint() {
      setPhase(null)
    }
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

  function triggerPrint(nextPhase) {
    setPhase(nextPhase)
    setTimeout(() => window.print(), 60)
  }

  // Build the ordered list of page nodes to render, based on mode + phase.
  const pages = []

  if (mode.group === 'fold') {
    sheets.forEach((sheet, sIdx) => {
      const cells = sheet.pairs.map(({ item, pairIndex }) => {
        if (sheet.foldAxis === 'lr') {
          const row = pairIndex
          return [
            { key: `${sIdx}-${pairIndex}-f`, row, col: 0, image: item?.front },
            {
              key: `${sIdx}-${pairIndex}-b`,
              row,
              col: 1,
              image: item?.back,
              transform: settings.rotateFoldBack ? 'rotate(180deg)' : undefined,
            },
          ]
        }
        const col = pairIndex % 2
        const rowPair = Math.floor(pairIndex / 2) * 2
        return [
          { key: `${sIdx}-${pairIndex}-f`, row: rowPair, col, image: item?.front },
          {
            key: `${sIdx}-${pairIndex}-b`,
            row: rowPair + 1,
            col,
            image: item?.back,
            transform: settings.rotateFoldBack ? 'rotate(180deg)' : undefined,
          },
        ]
      })
      pages.push({ key: `fold-${sIdx}`, kind: 'single', rows: sheet.rows, cells: cells.flat() })
    })
  } else {
    sheets.forEach((sheet, sIdx) => {
      const frontCells = sheet.items.map(({ item, row, col }) => ({
        key: `${sIdx}-front-${row}-${col}`,
        row,
        col,
        image: item?.front,
      }))
      const rotation = backRotation(sheet.flipAxis)
      const backCells = sheet.items.map(({ item, row, col }) => {
        const pos = mirroredPosition(row, col, sheet.flipAxis, sheet.rows)
        return {
          key: `${sIdx}-back-${row}-${col}`,
          row: pos.row,
          col: pos.col,
          image: item?.back,
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
        }
      })
      if (phase === 'fronts') {
        pages.push({ key: `${sIdx}-front`, kind: 'front', rows: sheet.rows, cells: frontCells })
      } else if (phase === 'backs') {
        pages.push({ key: `${sIdx}-back`, kind: 'back', rows: sheet.rows, cells: backCells })
      } else {
        pages.push({ key: `${sIdx}-front`, kind: 'front', rows: sheet.rows, cells: frontCells })
        pages.push({ key: `${sIdx}-back`, kind: 'back', rows: sheet.rows, cells: backCells })
      }
    })
  }

  return (
    <div className="print-view">
      <div className="no-print print-controls">
        <div className="print-controls__info">
          <h3>{mode.label}</h3>
          <p>{mode.description}</p>
          {overflow && (
            <p className="warning">
              Card size + gap is larger than an A4 sheet can fit in this grid. Reduce card size or gap in Settings.
            </p>
          )}
          {!overflow && marginY < 8 && (
            <p className="warning">
              Margin is too tight to show the header/footer and page numbers on this layout — they're hidden so they
              don't overlap the cards.
            </p>
          )}
          <ul className="checklist">
            <li>Paper size: <strong>A4</strong></li>
            <li>Scale: <strong>100% / Actual size</strong> (not "Fit to page")</li>
            <li>Margins: <strong>None</strong></li>
            {mode.group === 'duplex' && (
              <li>
                Two-sided printing: <strong>On</strong>, flip on{' '}
                <strong>{mode.flipAxis === 'h' ? 'long edge' : 'short edge'}</strong>
              </li>
            )}
          </ul>
        </div>
        <div className="print-controls__actions">
          {mode.group === 'manual' ? (
            <>
              <button className="btn btn--primary" onClick={() => triggerPrint('fronts')}>
                1. Print all fronts
              </button>
              <button className="btn btn--primary" onClick={() => triggerPrint('backs')}>
                2. Print all backs
              </button>
            </>
          ) : (
            <button className="btn btn--primary" onClick={() => triggerPrint(null)}>
              Print
            </button>
          )}
        </div>
      </div>

      <div className="print-pages">
        {pages.map((p, idx) => (
          <Page
            key={p.key}
            cssVars={cssVars}
            rows={p.rows}
            cells={p.cells}
            showGuides={settings.showGuides}
            pageKind={p.kind}
            pageNum={idx + 1}
            totalPages={pages.length}
            showChrome={marginY >= 8}
          />
        ))}
      </div>
    </div>
  )
}
