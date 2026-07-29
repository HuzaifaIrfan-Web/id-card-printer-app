import React from 'react'

export default function CardList({ cards, onUpdateCount, onRemove }) {
  if (cards.length === 0) {
    return (
      <div className="empty-state">
        <p>No ID cards added yet. Upload a front and back image above to add your first one.</p>
      </div>
    )
  }

  const totalCopies = cards.reduce((sum, c) => sum + (parseInt(c.count, 10) || 1), 0)

  return (
    <div className="card-list">
      <ul className="card-list__items">
        {cards.map((card, idx) => (
          <li key={card.id} className="card-list__item">
            <span className="card-list__index">{String(idx + 1).padStart(2, '0')}</span>
            <div className="card-list__thumbs">
              <img src={card.front} alt="Front" />
              <img src={card.back} alt="Back" />
            </div>
            <div className="card-list__meta">
              <span className="card-list__label">{card.label || 'Untitled ID'}</span>
              <label className="card-list__count">
                Copies
                <input
                  type="number"
                  min="1"
                  value={card.count}
                  onChange={(e) => onUpdateCount(card.id, e.target.value)}
                />
              </label>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--danger"
              onClick={() => onRemove(card.id)}
              aria-label="Remove this ID card"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="card-list__summary">
        <span>{cards.length} unique ID{cards.length !== 1 ? 's' : ''}</span>
        <span>{totalCopies} physical card{totalCopies !== 1 ? 's' : ''} total</span>
      </div>
    </div>
  )
}
