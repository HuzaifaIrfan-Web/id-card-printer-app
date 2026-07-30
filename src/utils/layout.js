// Core sizing + pagination logic for the ID card print tool.
//
// The grid is no longer fixed at 2 columns — it's computed from the actual
// card size so smaller cards automatically fit more per page, while a
// minimum safe margin is always kept on all four sides of the sheet.

export const A4 = { width: 210, height: 297 }

export const DEFAULT_CARD = { width: 85.6, height: 53.98 } // ID-1 / CNIC size, mm

// Minimum margin kept clear on every side of the sheet (mm), regardless of
// how many cards end up fitting.
export const MIN_MARGIN = 6

export const MODES = {
  'duplex-long': {
    label: 'Duplex — Flip on Long Edge',
    group: 'duplex',
    flipAxis: 'h',
    description:
      'One print job. Your printer\u2019s duplex unit prints fronts then backs automatically, flipping each sheet along its long (vertical) edge — the common default for portrait duplex printing.',
  },
  'duplex-short': {
    label: 'Duplex — Flip on Short Edge',
    group: 'duplex',
    flipAxis: 'v',
    description:
      'One print job. Your printer\u2019s duplex unit prints fronts then backs automatically, flipping each sheet along its short (horizontal) edge.',
  },
  'manual-long': {
    label: 'Manual Duplex — Flip on Long Edge',
    group: 'manual',
    flipAxis: 'h',
    description:
      'Two separate print runs. Print all fronts, take the stack out, flip each sheet over its long (vertical) edge like turning a book page, reload, then print all backs.',
  },
  'manual-short': {
    label: 'Manual Duplex — Flip on Short Edge',
    group: 'manual',
    flipAxis: 'v',
    description:
      'Two separate print runs. Print all fronts, take the stack out, flip each sheet over its short (horizontal) edge like flipping a notepad page, reload, then print all backs.',
  },
  'fold-lr': {
    label: 'Single Side — Fold Left/Right',
    group: 'fold',
    foldAxis: 'lr',
    description:
      'One single-sided print job. Front and a mirrored back sit side by side. Cut each pair out and fold along the vertical centre line so the back lands directly behind the front.',
  },
  'fold-tb': {
    label: 'Single Side — Fold Top/Bottom',
    group: 'fold',
    foldAxis: 'tb',
    description:
      'One single-sided print job. Front sits above a mirrored back. Cut each pair out and fold along the horizontal centre line so the back lands directly behind the front.',
  },
}

// How many cards fit edge-to-edge (plus gaps) inside a given span, keeping
// MIN_MARGIN clear on both ends of that span.
function maxFit(pageSpan, cardSpan, gap) {
  const available = pageSpan - 2 * MIN_MARGIN
  const count = Math.floor((available + gap) / (cardSpan + gap))
  return Math.max(1, count)
}

// Compute the full grid + margins for a given card size and mode. Fold
// modes need an even count along their fold axis so fronts and backs pair
// up cleanly; everything else just maximises how many cards fit.
export function computeLayout(cardWidth, cardHeight, gap, modeKey) {
  const mode = MODES[modeKey]
  let cols = maxFit(A4.width, cardWidth, gap)
  let rows = maxFit(A4.height, cardHeight, gap)

  if (mode.group === 'fold') {
    if (mode.foldAxis === 'lr') {
      cols = Math.max(2, cols - (cols % 2))
    } else {
      rows = Math.max(2, rows - (rows % 2))
    }
  }

  const contentW = cols * cardWidth + (cols - 1) * gap
  const contentH = rows * cardHeight + (rows - 1) * gap
  const marginX = Math.max(0, (A4.width - contentW) / 2)
  const marginY = Math.max(0, (A4.height - contentH) / 2)
  const overflow = contentW > A4.width || contentH > A4.height

  let perSheet
  if (mode.group === 'fold') {
    perSheet = mode.foldAxis === 'lr' ? (cols / 2) * rows : cols * (rows / 2)
  } else {
    perSheet = cols * rows
  }

  return { cols, rows, marginX, marginY, contentW, contentH, overflow, perSheet }
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
export function mirroredPosition(row, col, flipAxis, rows, cols) {
  if (flipAxis === 'h') {
    return { row, col: cols - 1 - col }
  }
  return { row: rows - 1 - row, col }
}

export function backRotation(flipAxis) {
  return flipAxis === 'v' ? 180 : 0
}

export function gridPositions(cols, rows) {
  const positions = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      positions.push({ row, col })
    }
  }
  return positions
}

// Turn the card list into an array of "sheets" ready to render.
// - duplex/manual sheets: { type:'duplex', items:[{item,row,col}] } — one A4
//   side's worth of front items; the matching back positions are derived at
//   render time via mirroredPosition().
// - fold sheets: { type:'fold', pairs:[{item,pairIndex}] } — front/back pairs
//   per single-sided sheet.
export function buildSheets(cards, modeKey, settings) {
  const mode = MODES[modeKey]
  const layout = computeLayout(settings.cardWidth, settings.cardHeight, settings.gap, modeKey)
  const queue = expandQueue(cards)
  const pages = paginate(queue, layout.perSheet)

  if (mode.group === 'fold') {
    return pages.map((page) => ({
      type: 'fold',
      foldAxis: mode.foldAxis,
      cols: layout.cols,
      rows: layout.rows,
      pairs: page.map((item, i) => ({ item, pairIndex: i })),
    }))
  }

  const positions = gridPositions(layout.cols, layout.rows)
  return pages.map((page) => ({
    type: 'duplex',
    flipAxis: mode.flipAxis,
    cols: layout.cols,
    rows: layout.rows,
    items: page.map((item, i) => ({ item, ...positions[i] })),
  }))
}
