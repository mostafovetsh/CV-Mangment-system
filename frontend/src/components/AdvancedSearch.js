import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import '../styles/advanced-search.css';

const AdvancedSearch = ({ onSearch, onClose }) => {
    const [query, setQuery] = useState('');
    const [experience, setExperience] = useState('');
    const [education, setEducation] = useState('');
    const [searchInContent, setSearchInContent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch({ query, experience, education, searchInContent });
    };

    const handleClear = () => {
        setQuery('');
        setExperience('');
        setEducation('');
        setSearchInContent(false);
        onSearch({});
    };

    return (
        <div className="card advanced-search-modal">
            <div className="modal-header">
                <h2><Search size={20} /> بحث متقدم</h2>
                <button onClick={onClose} className="close-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="search-form">
                <div className="form-group">
                    <label>كلمة البحث</label>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="ابحث بالاسم، المهارات، أو الكلمات المفتاحية..."
                        className="form-input"
                        autoFocus
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>سنوات الخبرة (الحد الأدنى)</label>
                        <input
                            type="number"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            placeholder="مثال: 3"
                            className="form-input"
                            min="0"
                        />
                    </div>
                    <div className="form-group">
                        <label>المستوى التعليمي</label>
                        <input
                            type="text"
                            value={education}
                            onChange={(e) => setEducation(e.target.value)}
                            placeholder="مثال: بكالوريوس، ماجستير..."
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={searchInContent}
                            onChange={(e) => setSearchInContent(e.target.checked)}
                        />
                        البحث داخل محتوى الملفات (أبطأ قليلاً)
                    </label>
                </div>

                <div className="modal-actions">
                    <button type="button" onClick={handleClear} className="btn btn-secondary">
                        مسح الفلاتر
                    </button>
                    <button type="submit" className="btn btn-primary">
                        بحث
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdvancedSearch;
