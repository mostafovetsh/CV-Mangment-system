import React, { useEffect, useState } from 'react';
import './cvnotes.css';

export default function CVNotes({ cvId, onClose }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { if (cvId) loadNotes(); }, [cvId]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cvs/${cvId}/notes`);
      const data = await res.json();
      if (res.ok) setNotes(data.notes || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const addNote = async () => {
    if (!text.trim()) return;
    try {
      const res = await fetch(`/api/cvs/${cvId}/notes`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ note_text: text, author: 'you' }) });
      const data = await res.json();
      if (res.ok) { setNotes(n => [...n, data.note]); setText(''); }
      else alert(data.error || 'Failed to add note');
    } catch (e) { console.error(e); alert('Failed to add note'); }
  };

  const startEdit = (note) => { setEditingId(note.id); setText(note.note_text); };
  const saveEdit = async () => {
    if (!text.trim()) return;
    try {
      const res = await fetch(`/api/cvs/${cvId}/notes/${editingId}`, { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ note_text: text }) });
      const data = await res.json();
      if (res.ok) { setNotes(n => n.map(x => x.id === editingId ? data.note : x)); setEditingId(null); setText(''); }
      else alert(data.error || 'Failed to edit');
    } catch (e) { console.error(e); alert('Failed to edit note'); }
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      const res = await fetch(`/api/cvs/${cvId}/notes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) setNotes(n => n.filter(x => x.id !== id)); else alert(data.error || 'Failed to delete');
    } catch (e) { console.error(e); alert('Failed to delete'); }
  };

  return (
    <div className="cvnotes-overlay">
      <div className="cvnotes-modal">
        <div className="cvnotes-header">
          <h3>Notes ({notes.length})</h3>
          <div>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="cvnotes-body">
          {loading ? <p>Loading...</p> : (
            <ul className="notes-list">
              {notes.map(n => (
                <li key={n.id} className="note-item">
                  <div className="note-text">{n.note_text}</div>
                  <div className="note-meta">{n.author} • {new Date(n.timestamp).toLocaleString()}</div>
                  <div className="note-actions">
                    <button className="btn btn-link" onClick={() => startEdit(n)}>Edit</button>
                    <button className="btn btn-link danger" onClick={() => deleteNote(n.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="note-editor">
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write a note..." />
            <div style={{display:'flex',gap:8}}>
              {editingId ? <button className="btn btn-primary" onClick={saveEdit}>Save</button> : <button className="btn btn-primary" onClick={addNote}>Add</button>}
              <button className="btn btn-secondary" onClick={() => { setText(''); setEditingId(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
