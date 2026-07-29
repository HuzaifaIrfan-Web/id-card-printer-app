import React, { useState } from 'react'
import CardForm from './components/CardForm.jsx'
import CardList from './components/CardList.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import PrintView from './components/PrintView.jsx'
import { DEFAULT_CARD } from './utils/layout.js'
import { APP_NAME, APP_VERSION, AUTHOR } from './meta.js'

const DEFAULT_SETTINGS = {
  mode: 'duplex-long',
  cardWidth: DEFAULT_CARD.width,
  cardHeight: DEFAULT_CARD.height,
  gap: 2,
  showGuides: true,
  rotateFoldBack: false,
}

export default function App() {
  const [cards, setCards] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [tab, setTab] = useState('build')

  function addCard(card) {
    setCards((prev) => [...prev, card])
  }

  function updateCount(id, count) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, count: Math.max(1, parseInt(count, 10) || 1) } : c)))
  }

  function removeCard(id) {
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="app">
      <header className="app-header no-print">
        <div className="app-header__mark" aria-hidden="true">
          <span className="tick" />
          <span className="tick" />
          <span className="tick" />
          <span className="tick" />
          <span className="tick" />
        </div>
        <div>
          <h1>
            {APP_NAME} <span className="version-badge">v{APP_VERSION}</span>
          </h1>
          <p className="app-header__sub">A4 layout tool for CNIC-size cards — actual size, no backend, nothing leaves your browser.</p>
        </div>
      </header>

      <nav className="tabs no-print">
        <button className={tab === 'build' ? 'is-active' : ''} onClick={() => setTab('build')}>
          1 · Build list
        </button>
        <button className={tab === 'settings' ? 'is-active' : ''} onClick={() => setTab('settings')}>
          2 · Layout settings
        </button>
        <button className={tab === 'print' ? 'is-active' : ''} onClick={() => setTab('print')} disabled={cards.length === 0}>
          3 · Preview &amp; print
        </button>
      </nav>

      <main className="app-main">
        {tab === 'build' && (
          <section className="panel">
            <CardForm onAdd={addCard} />
            <CardList cards={cards} onUpdateCount={updateCount} onRemove={removeCard} />
          </section>
        )}

        {tab === 'settings' && (
          <section className="panel">
            <SettingsPanel settings={settings} onChange={setSettings} />
          </section>
        )}

        {tab === 'print' && (
          <section className="panel panel--print">
            <PrintView cards={cards} settings={settings} />
          </section>
        )}
      </main>

      <footer className="app-footer no-print">
        <span>
          {APP_NAME} v{APP_VERSION} · Developed by {AUTHOR.name}
        </span>
        <span className="app-footer__links">
          <a href={AUTHOR.website} target="_blank" rel="noreferrer">
            huzaifairfan.com
          </a>
          <a href={`mailto:${AUTHOR.email}`}>{AUTHOR.email}</a>
          <a href={AUTHOR.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </span>
      </footer>
    </div>
  )
}
