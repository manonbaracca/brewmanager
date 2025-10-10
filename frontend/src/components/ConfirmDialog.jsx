import React from 'react'

export default function ConfirmDialog({
  open,
  title = 'Confirmar',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}) {
  if (!open) return null
  return (
    <div
      style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.3)',
        display:'flex', alignItems:'center', justifyContent:'center', zIndex:1050
      }}
      onClick={onCancel}
    >
      <div
        className="card shadow"
        style={{ width: 480, maxWidth:'90%', borderRadius:12 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="card-header text-white" style={{ background:'#5A2E1B' }}>
          {title}
        </div>
        <div className="card-body" style={{ background:'#FAF0E6' }}>
          <div
            className="alert"
            style={{ background:'#d1ecf1', border:'1px solid #bee5eb', color:'#0c5460', borderRadius:8 }}
          >
            {message}
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button className="btn" onClick={onCancel}
              style={{ background:'#FAF0E6', border:'1px solid #5A2E1B', color:'#5A2E1B' }}>
              {cancelText}
            </button>
            <button className="btn text-white" style={{ background:'#8B4513' }} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
