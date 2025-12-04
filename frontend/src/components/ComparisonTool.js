import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { updateCV } from '../services/api';
import '../styles/comparison.css';

const ComparisonTool = ({ cvs, onClose }) => {
    const [ratings, setRatings] = useState(
        cvs.reduce((acc, cv) => ({ ...acc, [cv.id]: cv.rating || 0 }), {})
    );

    const handleRate = async (id, rating) => {
        setRatings(prev => ({ ...prev, [id]: rating }));
        try {
            await updateCV(id, { rating });
        } catch (error) {
            console.error('Error updating rating:', error);
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();

        // Add Arabic font support if needed (simplified for now)
        doc.text("Candidate Comparison", 14, 20);

        const tableData = [
            ['Name', ...cvs.map(cv => cv.candidateName)],
            ['Email', ...cvs.map(cv => cv.email)],
            ['Phone', ...cvs.map(cv => cv.phone)],
            ['Status', ...cvs.map(cv => cv.status)],
            ['Experience', ...cvs.map(cv => cv.experience || 'N/A')],
            ['Skills', ...cvs.map(cv => (cv.skills || []).join(', '))],
            ['Rating', ...cvs.map(cv => (ratings[cv.id] || 0) + '/5')]
        ];

        autoTable(doc, {
            head: [tableData[0]],
            body: tableData.slice(1),
            startY: 30,
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [66, 153, 225] }
        });

        doc.save('comparison.pdf');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content comparison-modal" style={{ maxWidth: '90vw', width: '1200px' }}>
                <div className="modal-header">
                    <h2>مقارنة المرشحين ({cvs.length})</h2>
                    <div className="actions">
                        <button onClick={exportPDF} className="btn btn-primary">t تصدير PDF</button>
                        <button onClick={onClose} className="btn btn-secondary">إغلاق</button>
                    </div>
                </div>

                <div className="comparison-table-container" style={{ overflowX: 'auto' }}>
                    <table className="comparison-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '200px' }}>المعيار</th>
                                {cvs.map(cv => (
                                    <th key={cv.id} style={{ minWidth: '250px' }}>
                                        {cv.candidateName}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>التقييم</td>
                                {cvs.map(cv => (
                                    <td key={cv.id}>
                                        <div className="rating-stars">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <span
                                                    key={star}
                                                    onClick={() => handleRate(cv.id, star)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        color: star <= (ratings[cv.id] || 0) ? '#ecc94b' : '#cbd5e0',
                                                        fontSize: '24px'
                                                    }}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td>الحالة</td>
                                {cvs.map(cv => (
                                    <td key={cv.id}>
                                        <span className={`status-badge status-${cv.status}`}>
                                            {cv.status}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td>المهارات</td>
                                {cvs.map(cv => (
                                    <td key={cv.id}>
                                        <div className="skills-list">
                                            {(cv.skills || []).map((skill, i) => (
                                                <span key={i} className="skill-tag">{skill}</span>
                                            ))}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td>البريد الإلكتروني</td>
                                {cvs.map(cv => <td key={cv.id}>{cv.email}</td>)}
                            </tr>
                            <tr>
                                <td>الهاتف</td>
                                {cvs.map(cv => <td key={cv.id}>{cv.phone}</td>)}
                            </tr>
                            <tr>
                                <td>ملاحظات</td>
                                {cvs.map(cv => (
                                    <td key={cv.id} style={{ whiteSpace: 'pre-wrap' }}>
                                        {cv.notes && cv.notes.length > 0
                                            ? cv.notes.map(n => n.note_text).join('\n---\n')
                                            : '-'}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComparisonTool;
