// Core sizing + pagination logic for the ID card print tool.
// Grid is 2 columns wide. With the standard ID-1 card size (85.6mm x
// 53.98mm), 2 columns (171.2mm) and up to 5 rows (269.9mm) both fit
// comfortably inside an A4 sheet (210mm x 297mm) in portrait orientation,
// giving 10 cards per side instead of 8.

export const A4 = { width: 210, height: 297 }

export const GRID_COLS = 2

export const DEFAULT_CARD = { width: 85.6, height: 53.98 } // ID-1 / CNIC size, mm

export const MODES = {
  'duplex-long': {
    label: 'Duplex — Flip on Long Edge',
    group: 'duplex',
    flipAxis: 'h',
    rows: 5,
    description:
      'One print job. Your printer\u2019s duplex unit prints fronts then backs automatically, flipping each sheet along its long (vertical) edge — the common default for portrait duplex printing.',
  },
  'duplex-short': {
    label: 'Duplex — Flip on Short Edge',
    group: 'duplex',
    flipAxis: 'v',
    rows: 5,
    description:
      'One print job. Your printer\u2019s duplex unit prints fronts then backs automatically, flipping each sheet along its short (horizontal) edge.',
  },
  'manual-long': {
    label: 'Manual Duplex — Flip on Long Edge',
    group: 'manual',
    flipAxis: 'h',
    rows: 5,
    description:
      'Two separate print runs. Print all fronts, take the stack out, flip each sheet over its long (vertical) edge like turning a book page, reload, then print all backs.',
  },
  'manual-short': {
    label: 'Manual Duplex — Flip on Short Edge',
    group: 'manual',
    flipAxis: 'v',
    rows: 5,
    description:
      'Two separate print runs. Print all fronts, take the stack out, flip each sheet over its short (horizontal) edge like flipping a notepad page, reload, then print all backs.',
  },
  'fold-lr': {
    label: 'Single Side — Fold Left/Right',
    group: 'fold',
    foldAxis: 'lr',
    rows: 5,
    description:
      'One single-sided print job. Front and a mirrored back sit side by side. Cut each pair out and fold along the vertical centre line so the back lands directly behind the front.',
  },
  'fold-tb': {
    label: 'Single Side — Fold Top/Bottom',
    group: 'fold',
    foldAxis: 'tb',
    rows: 4, // needs an even row count so fronts/backs pair up cleanly
    description:
      'One single-sided print job. Front sits above a mirrored back. Cut each pair out and fold along the horizontal centre line so the back lands directly behind the front.',
  },
}

// How many finished physical cards one sheet/side produces for a given mode.
export function perSheetCount(mode) {
  if (mode.group === 'fold') {
    return mode.foldAxis === 'tb' ? (mode.rows / 2) * GRID_COLS : mode.rows
  }
  return mode.rows * GRID_COLS
}

// Expand card entries (each with a `count`) into a flat, ordered queue of
// individual print items, one per physical card to be produced.
export function expandQueue(cards) {
  const queue = []
  for (const card of cards) {
    const count = Math.max(1, parseInt(card.count, 10) || 1)
    for (let i = 0; i < count; i++) {
      queue.push({ sourceId: card.id, front: card.front, back: card.back, label: card.label })
    }
  }
  return queue
}

// Chunk a queue into pages of `size`, padding the final page with nulls.
export function paginate(queue, size) {
  const pages = []
  for (let i = 0; i < queue.length; i += size) {
    const chunk = queue.slice(i, i + size)
    while (chunk.length < size) chunk.push(null)
    pages.push(chunk)
  }
  return pages.length ? pages : []
}

// For duplex/manual modes: given a front cell's (row, col), return the
// (row, col) where its back must be printed so that, once the physical
// sheet is flipped along the given axis, the back lands directly behind
// the front.
//
// Long-edge flip (rotate about the vertical edge): left/right swap, so the
// back page must sit in the mirrored column, same row, with no rotation of
// the image itself — this is standard "book style" duplex.
//
// Short-edge flip (rotate about the horizontal edge): top/bottom swap, so
// the back page must sit in the mirrored row (counted bottom-to-top), same
// column, AND the image itself is rotated 180° in place so it reads right
// side up once the sheet is flipped — standard "calendar style" duplex.
export function mirroredPosition(row, col, flipAxis, rows) {
  if (flipAxis === 'h') {
    return { row, col: 1 - col }
  }
  // flipAxis === 'v' -> rows reverse (bottom-to-top), image also rotated 180°
  return { row: rows - 1 - row, col }
}

export function backRotation(flipAxis) {
  return flipAxis === 'v' ? 180 : 0
}

// Turn the card list into an array of "sheets" ready to render.
// - duplex/manual sheets: { type:'duplex', items:[{item,row,col}] } — one A4
//   side's worth of front items; the matching back positions are derived at
//   render time via mirroredPosition().
// - fold sheets: { type:'fold', pairs:[{item,pairIndex}] } — front/back pairs
//   per single-sided sheet.
export function buildSheets(cards, modeKey) {
  const mode = MODES[modeKey]
  const queue = expandQueue(cards)
  const perSheet = perSheetCount(mode)
  const pages = paginate(queue, perSheet)
  if (mode.group === 'fold') {
    return pages.map((page) => ({
      type: 'fold',
      foldAxis: mode.foldAxis,
      rows: mode.rows,
      pairs: page.map((item, i) => ({ item, pairIndex: i })),
    }))
  }
  const positions = gridPositions(mode.rows)
  return pages.map((page) => ({
    type: 'duplex',
    flipAxis: mode.flipAxis,
    rows: mode.rows,
    items: page.map((item, i) => ({ item, ...positions[i] })),
  }))
}

export function gridPositions(rows) {
  const positions = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      positions.push({ row, col })
    }
  }
  return positions
}
