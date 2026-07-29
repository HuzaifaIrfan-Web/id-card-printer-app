import React, { useState, useRef } from 'react'

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function CardForm({ onAdd }) {
  const [label, setLabel] = useState('')
  const [front, setFront] = useState(null)
  const [back, setBack] = useState(null)
  const [count, setCount] = useState(1)
  const frontInput = useRef(null)
  const backInput = useRef(null)

  async function handleFile(e, setter) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    setter(dataUrl)
  }

  function reset() {
    setLabel('')
    setFront(null)
    setBack(null)
    setCount(1)
    if (frontInput.current) frontInput.current.value = ''
    if (backInput.current) backInput.current.value = ''
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!front || !back) return
    onAdd({
      id: crypto.randomUUID(),
      label: label.trim(),
      front,
      back,
      count: Math.max(1, parseInt(count, 10) || 1),
    })
    reset()
  }

  return (
    <form className="card-form" onSubmit={handleSubmit}>
      <div className="card-form__row">
        <label className="field">
          <span className="field__label">Label <em>(optional, for your own reference)</em></span>
          <input
            type="text"
            placeholder="e.g. Ali Raza"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>
      </div>

      <div className="card-form__row card-form__row--images">
        <label className="upload-slot">
          <span className="field__label">Front image</span>
          <input ref={frontInput} type="file" accept="image/*" onChange={(e) => handleFile(e, setFront)} required />
          <div className={`upload-preview ${front ? 'has-image' : ''}`}>
            {front ? <img src={front} alt="Front preview" /> : <span>Choose front scan</span>}
          </div>
        </label>

        <label className="upload-slot">
          <span className="field__label">Back image</span>
          <input ref={backInput} type="file" accept="image/*" onChange={(e) => handleFile(e, setBack)} required />
          <div className={`upload-preview ${back ? 'has-image' : ''}`}>
            {back ? <img src={back} alt="Back preview" /> : <span>Choose back scan</span>}
          </div>
        </label>
      </div>

      <div className="card-form__row card-form__row--submit">
        <label className="field field--count">
          <span className="field__label">Copies</span>
          <input
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={!front || !back}>
          Add to print list
        </button>
      </div>
    </form>
  )
}
