import React, { useState } from 'react';
import './bulkupload.css';

export default function BulkUpload({ onClose, onDone }) {
  const [fileList, setFileList] = useState([]);
  const [globalFolder, setGlobalFolder] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0,10).map(f => ({ file: f, candidateName: deriveName(f.name), skills: '', folder: 'general' }));
    setFileList(arr);
  };

  function deriveName(filename) {
    return filename.replace(/\.[^/.]+$/, '').replace(/[_\-0-9]+/g, ' ').trim();
  }

  const updateItem = (idx, key, value) => {
    setFileList(list => { const copy = [...list]; copy[idx] = { ...copy[idx], [key]: value }; return copy; });
  };

  const uploadAll = async () => {
    if (!fileList.length) return;
    setUploading(true);
    const form = new FormData();
    // append files
    fileList.forEach(item => form.append('files', item.file));
    // build meta map keyed by original filename
    const meta = {};
    fileList.forEach(item => { meta[item.file.name] = { candidateName: item.candidateName, skills: item.skills ? item.skills.split(',').map(s=>s.trim()).filter(Boolean) : [], folder: item.folder || globalFolder }; });
    form.append('meta', JSON.stringify(meta));
    // optional global folder
    form.append('folder', globalFolder);

    try {
      const res = await fetch('/api/cvs/upload', { method: 'POST', body: form });
      const data = await res.json();
      setResults(data.results || data);
      if (res.ok) {
        onDone && onDone();
      }
    } catch (e) {
      console.error(e); alert('Upload error');
    }
    setUploading(false);
  };

  return (
    <div className="bulkupload-overlay">
      <div className="bulkupload-modal">
        <div className="bulkupload-header">
          <h3>Bulk Upload</h3>
          <div>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="bulkupload-body">
          <div style={{marginBottom:8}}>
            <input type="file" multiple accept=".pdf,.doc,.docx" onChange={(e)=>handleFiles(e.target.files)} />
            <label style={{marginLeft:12}}>Global folder:</label>
            <input value={globalFolder} onChange={e=>setGlobalFolder(e.target.value)} style={{marginLeft:8}} />
          </div>

          {fileList.length === 0 && <p>No files selected</p>}
          {fileList.length > 0 && (
            <table className="bulkupload-table">
              <thead><tr><th>File</th><th>Candidate</th><th>Skills (comma)</th><th>Folder</th></tr></thead>
              <tbody>
                {fileList.map((it, idx) => (
                  <tr key={idx}>
                    <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis'}}>{it.file.name}</td>
                    <td><input value={it.candidateName} onChange={e=>updateItem(idx,'candidateName',e.target.value)} /></td>
                    <td><input value={it.skills} onChange={e=>updateItem(idx,'skills',e.target.value)} placeholder="javascript, react" /></td>
                    <td><input value={it.folder} onChange={e=>updateItem(idx,'folder',e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{marginTop:12}}>
            <button className="btn btn-primary" onClick={uploadAll} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload All'}</button>
          </div>

          {results && (
            <div style={{marginTop:12}}>
              <h4>Results</h4>
              <ul>
                {results.map((r, i) => <li key={i}>{r.file}: {r.success ? 'OK' : 'Error - ' + (r.error||'unknown')}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
