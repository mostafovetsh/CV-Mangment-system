import React, { useState, useEffect } from 'react';
import './cvpreview.css';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ZoomIn, ZoomOut, ArrowLeft, ArrowRight } from 'lucide-react';

// Set workerSrc to CDN (adjust if you bundle differently)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js`;

export default function CVPreview({ cvId, onClose }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cvId) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/cvs/${cvId}/preview`, { method: 'GET' });
        if (!res.ok) throw new Error(`Preview fetch failed: ${res.status}`);
        const contentType = res.headers.get('content-type') || '';
        const blob = await res.blob();

        // If response is a PDF, prefer ArrayBuffer (more reliable for react-pdf)
        if (contentType.includes('application/pdf')) {
          const arrayBuffer = await blob.arrayBuffer();
          setPdfData(arrayBuffer);
        } else {
          // Not a PDF - try to create object URL to inspect
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          console.warn('Preview returned non-PDF content-type:', contentType);
        }
      } catch (err) {
        console.error('Preview load error', err);
        alert('خطأ في تحميل المعاينة');
        onClose && onClose();
      } finally {
        setLoading(false);
      }
    })();

    return () => { if (pdfUrl) { URL.revokeObjectURL(pdfUrl); } };
  }, [cvId]);

  if (!cvId) return null;

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPage(1);
  };

  return (
    <div className="cvpreview-overlay">
      <div className="cvpreview-modal">
        <div className="cvpreview-header">
          <div style={{display:'flex',gap:8}}>
            <button className="btn-icon" onClick={() => setScale(s => Math.max(0.25, s - 0.25))}><ZoomOut size={18} /></button>
            <button className="btn-icon" onClick={() => setScale(s => Math.min(3, s + 0.25))}><ZoomIn size={18} /></button>
            <button className="btn-icon" onClick={() => setPage(p => Math.max(1, p - 1))}><ArrowLeft size={18} /></button>
            <span className="page-indicator">{page} / {numPages || '-'}</span>
            <button className="btn-icon" onClick={() => setPage(p => Math.min(numPages || 1, p + 1))}><ArrowRight size={18} /></button>
          </div>
          <div>
            <button className="btn btn-secondary" onClick={() => { setPdfUrl(null); setPdfData(null); onClose && onClose(); }}><X size={18} /></button>
          </div>
        </div>
        <div className="cvpreview-body">
          {loading && <div className="loading">جارٍ التحميل...</div>}
          {!loading && (pdfData || pdfUrl) && (
            <Document file={pdfData || pdfUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={(e)=>{console.error('Document load error', e);}}>
              <Page pageNumber={page} scale={scale} />
            </Document>
          )}
        </div>
      </div>
    </div>
  );
}
