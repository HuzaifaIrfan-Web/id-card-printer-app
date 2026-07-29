import React from 'react'
import { MODES, DEFAULT_CARD } from '../utils/layout.js'

const GROUPS = [
  { key: 'duplex', title: 'Front & Back — Duplex (auto)', modes: ['duplex-long', 'duplex-short'] },
  { key: 'manual', title: 'Front & Back — Manual flip', modes: ['manual-long', 'manual-short'] },
  { key: 'fold', title: 'Single Side — Fold to close', modes: ['fold-lr', 'fold-tb'] },
]

export default function SettingsPanel({ settings, onChange }) {
  function set(patch) {
    onChange({ ...settings, ...patch })
  }

  return (
    <div className="settings-panel">
      <div className="settings-block">
        <h3>Print mode</h3>
        {GROUPS.map((group) => (
          <div key={group.key} className="mode-group">
            <span className="mode-group__title">{group.title}</span>
            <div className="mode-group__options">
              {group.modes.map((key) => {
                const mode = MODES[key]
                const active = settings.mode === key
                return (
                  <label key={key} className={`mode-card ${active ? 'is-active' : ''}`}>
                    <input
                      type="radio"
                      name="mode"
                      value={key}
                      checked={active}
                      onChange={() => set({ mode: key })}
                    />
                    <span className="mode-card__label">{mode.label}</span>
                    <span className="mode-card__desc">{mode.description}</span>
                  </label>
                )
              })}
            </div>
            {group.key === 'fold' && settings.mode.startsWith('fold') && (
              <label className="checkbox-row checkbox-row--indent">
                <input
                  type="checkbox"
                  checked={settings.rotateFoldBack}
                  onChange={(e) => set({ rotateFoldBack: e.target.checked })}
                />
                Rotate back image 180° in place (some folding directions need this so front and back land back-to-back)
              </label>
            )}
          </div>
        ))}
      </div>

      <div className="settings-block settings-block--grid">
        <h3>Card size (mm)</h3>
        <div className="dim-row">
          <label className="field field--sm">
            <span className="field__label">Width</span>
            <input
              type="number"
              step="0.01"
              value={settings.cardWidth}
              onChange={(e) => set({ cardWidth: parseFloat(e.target.value) || 0 })}
            />
          </label>
          <label className="field field--sm">
            <span className="field__label">Height</span>
            <input
              type="number"
              step="0.01"
              value={settings.cardHeight}
              onChange={(e) => set({ cardHeight: parseFloat(e.target.value) || 0 })}
            />
          </label>
          <label className="field field--sm">
            <span className="field__label">Gap</span>
            <input
              type="number"
              step="0.5"
              min="0"
              value={settings.gap}
              onChange={(e) => set({ gap: parseFloat(e.target.value) || 0 })}
            />
          </label>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => set({ cardWidth: DEFAULT_CARD.width, cardHeight: DEFAULT_CARD.height })}
          >
            Reset to CNIC size
          </button>
        </div>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={settings.showGuides}
            onChange={(e) => set({ showGuides: e.target.checked })}
          />
          Show cut/fold guide lines on the printout
        </label>
      </div>
    </div>
  )
}
