import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import {
  Upload,
  Search,
  Filter,
  FolderOpen,
  Trash2,
  FileText,
  Download,
  Plus,
  X,
  RefreshCw,
  Eye,
} from "lucide-react";
import CVPreview from "./components/CVPreview";
import CVNotes from "./components/CVNotes";
import BulkUpload from "./components/BulkUpload";
import FoldersPanel from "./components/FoldersPanel";
import {
  fetchCVs,
  uploadCV,
  deleteCV,
  fetchFolders,
  addFolder,
  fetchStats,
  getFileUrl,
  updateCV,
  fetchConfig,
  bulkUpdateCVs,
  bulkDeleteCVs,
  bulkMoveCVs,
  searchCVs,
} from "./services/api";
import "./styles/index.css";
import Login from "./Login";
import { formatDate, formatSize } from "./utils/helpers";

// Lazy load heavy components
const Reports = lazy(() => import("./Reports"));
const ComparisonTool = lazy(() => import("./components/ComparisonTool"));
const AdvancedSearch = lazy(() => import("./components/AdvancedSearch"));



function App() {
  const [cvs, setCVs] = useState([]);
  const [folders, setFolders] = useState([]);
  const [stats, setStats] = useState({});
  const [config, setConfig] = useState({
    departmentCategories: [],
    cvStatuses: [
      { value: "new", label: "جديد", color: "#4299e1" },
      { value: "progress", label: "قيد التنفيذ", color: "#ed8936" },
      { value: "complete", label: "مكتمل", color: "#48bb78" },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    skills: "",
    folder: "",
    dateFrom: "",
    dateTo: "",
    status: "",
    age: "",
  });
  const [uploadData, setUploadData] = useState({
    file: null,
    candidateName: "",
    skills: "",
    folder: "general",
    status: "new",
    age: "",
  });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      return null;
    }
  });

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const [showReports, setShowReports] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const [notesCvId, setNotesCvId] = useState(null);
  const [selectedCVs, setSelectedCVs] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cvsRes, foldersRes, statsRes, configRes] = await Promise.all([
        fetchCVs({}),
        fetchFolders(),
        fetchStats(),
        fetchConfig(),
      ]);
      setCVs(cvsRes.cvs || []);
      setFolders(foldersRes.folders || []);
      setStats(statsRes);
      if (
        configRes.config &&
        configRes.config.cvStatuses &&
        configRes.config.cvStatuses.length > 0
      ) {
        setConfig(configRes.config);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      alert("خطأ في تحميل البيانات: " + err.message);
    }
    setLoading(false);
  }, []);

  const handleAdvancedSearch = useCallback(async (searchParams) => {
    setLoading(true);
    try {
      const res = await searchCVs(searchParams);
      setCVs(res.cvs || []);
    } catch (err) {
      alert("Search error: " + err.message);
    }
    setLoading(false);
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchCVs(filters);
      setCVs(res.cvs || []);
    } catch (err) {
      alert("Search error");
    }
    setLoading(false);
  }, [filters]);

  const handleUpload = async () => {
    if (!uploadData.file) {
      alert("Select a file first");
      return;
    }
    const formData = new FormData();
    formData.append("file", uploadData.file);
    formData.append("candidateName", uploadData.candidateName);
    formData.append("skills", uploadData.skills);
    formData.append("folder", uploadData.folder);
    formData.append("status", uploadData.status);
    formData.append("age", uploadData.age);
    setLoading(true);
    try {
      await uploadCV(formData);
      alert("File uploaded!");
      setShowUpload(false);
      setUploadData({
        file: null,
        candidateName: "",
        skills: "",
        folder: "general",
        status: "new",
        age: "",
      });
      loadData();
    } catch (err) {
      alert("Upload error");
    }
    setLoading(false);
  };

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this CV?")) return;
    try {
      await deleteCV(id);
      loadData();
    } catch (err) {
      alert("Delete error");
    }
  }, [loadData]);

  const handleMove = useCallback(async (cvId, targetFolder) => {
    try {
      // Support moving by folder name or updating status when target is a status object
      if (targetFolder && typeof targetFolder === 'object' && targetFolder.status) {
        await updateCV(cvId, { status: targetFolder.status });
      } else if (typeof targetFolder === 'string') {
        await updateCV(cvId, { folder: targetFolder });
      } else {
        // Fallback: ignore
        return;
      }
      loadData();
    } catch (err) {
      alert("Move error: " + err.message);
    }
  }, [loadData]);

  const handleAddFolder = useCallback(async (folderName) => {
    if (!folderName || !folderName.trim()) {
      alert("الرجاء إدخال اسم المجلد");
      return;
    }
    try {
      const result = await addFolder(folderName);
      if (result.success) {
        setFolders(result.folders || []);
        alert("تم إنشاء المجلد بنجاح!");
      } else {
        alert(result.error || "فشل إنشاء المجلد");
      }
    } catch (err) {
      console.error("Error adding folder:", err);
      alert("خطأ: " + (err.message || "فشل الاتصال بالخادم"));
    }
  }, []);

  const handleSelectCV = useCallback((id, checked) => {
    if (checked) {
      setSelectedCVs(prev => [...prev, id]);
    } else {
      setSelectedCVs(prev => prev.filter(cvId => cvId !== id));
    }
  }, []);

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedCVs(cvs.map(cv => cv.id));
    } else {
      setSelectedCVs([]);
    }
  }, [cvs]);

  const handleBulkMove = useCallback(async (folder) => {
    if (!folder || selectedCVs.length === 0) return;
    try {
      await bulkMoveCVs(selectedCVs, folder);
      alert(`تم نقل ${selectedCVs.length} سيرة ذاتية إلى ${folder}`);
      setSelectedCVs([]);
      loadData();
    } catch (err) {
      alert("خطأ في النقل: " + err.message);
    }
  }, [selectedCVs, loadData]);

  const handleBulkStatusUpdate = useCallback(async (status) => {
    if (!status || selectedCVs.length === 0) return;
    try {
      await bulkUpdateCVs(selectedCVs, { status });
      alert(`تم تحديث حالة ${selectedCVs.length} سيرة ذاتية`);
      setSelectedCVs([]);
      loadData();
    } catch (err) {
      alert("خطأ في التحديث: " + err.message);
    }
  }, [selectedCVs, loadData]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedCVs.length === 0) return;
    if (!window.confirm(`هل تريد حذف ${selectedCVs.length} سيرة ذاتية؟`)) return;
    try {
      await bulkDeleteCVs(selectedCVs);
      alert(`تم حذف ${selectedCVs.length} سيرة ذاتية`);
      setSelectedCVs([]);
      loadData();
    } catch (err) {
      alert("خطأ في الحذف: " + err.message);
    }
  }, [selectedCVs, loadData]);

  const filterByStatus = useCallback(async (status) => {
    const newFilters = { ...filters, status };
    setFilters(newFilters);
    setLoading(true);
    try {
      const res = await fetchCVs(newFilters);
      setCVs(res.cvs || []);
    } catch (err) {
      alert("Search error");
    }
    setLoading(false);
  }, [filters]);

  return (
    <div className="app">
      <div className="header-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {logoError ? (
              <div style={{ height: 48, width: 48, borderRadius: 8, background: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#2d3748' }}>CV</div>
            ) : (
              <img
                src={(config.logoUrl ? (config.logoUrl.startsWith('http') ? config.logoUrl : (process.env.PUBLIC_URL + config.logoUrl)) : (process.env.PUBLIC_URL + '/assets/logo.png'))}
                alt="Logo"
                style={{ height: 48, width: 'auto' }}
                onError={() => setLogoError(true)}
              />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn btn-secondary logout-button"
              onClick={handleLogout}
            >
              خروج
            </button>
            <div className="admin-info">
              {user?.username} <span className="admin-role">({user?.role})</span>
            </div>
          </div>
        </div>
        <header className="header">
          <div className="header-content">
            <div>
              <h1>نظام إدارة السير الذاتية</h1>
              <p>إدارة الملفات بسهولة</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowUpload(!showUpload)}
              >
                <Upload size={20} /> رفع ملف جديد
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowBulkUpload(true)}
                style={{ marginLeft: 8 }}
              >
                رفع ملفات متعددة
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const folderName = prompt("اسم المجلد الجديد:");
                  if (folderName) {
                    handleAddFolder(folderName);
                  }
                }}
                style={{ marginLeft: 8 }}
              >
                <Plus size={20} /> إضافة مجلد
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowReports(true)}
                style={{ marginLeft: 8 }}
              >
                تقارير
              </button>

            </div>
          </div >
          <div className="stats-grid">
            <div className="stat-card blue">
              <span>إجمالي السير الذاتية</span>
              <strong>{stats.totalCVs || 0}</strong>
            </div>
            <div className="stat-card green">
              <span>عدد المجلدات</span>
              <strong>{stats.totalFolders || 0}</strong>
            </div>
            <div className="stat-card purple">
              <span>السير الذاتية القديمة (أكثر من 30 يوم)</span>
              <strong>{stats.oldCVs || 0}</strong>
            </div>
          </div>
        </header >


      </div >

      {
        showUpload && (
          <div className="card">
            <div className="card-header">
              <h2>رفع سيرة ذاتية جديدة</h2>
              <button className="btn-icon" onClick={() => setShowUpload(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>اسم المرشح</label>
                <input
                  type="text"
                  value={uploadData.candidateName}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      candidateName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>المهارات</label>
                <input
                  type="text"
                  value={uploadData.skills}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, skills: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>المجلد</label>
                <select
                  value={uploadData.folder}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, folder: e.target.value })
                  }
                >
                  {folders.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>الحالة</label>
                <select
                  value={uploadData.status}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, status: e.target.value })
                  }
                >
                  {(config.cvStatuses && config.cvStatuses.length > 0
                    ? config.cvStatuses
                    : [
                      { value: "new", label: "جديد", color: "#4299e1" },
                      {
                        value: "progress",
                        label: "قيد التنفيذ",
                        color: "#ed8936",
                      },
                      { value: "complete", label: "مكتمل", color: "#48bb78" },
                    ]
                  ).map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>العمر</label>
                <input
                  type="number"
                  placeholder="العمر"
                  value={uploadData.age}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, age: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>الملف</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setUploadData(prev => ({ ...prev, file }));

                      // Auto-parse CV
                      setLoading(true);
                      try {
                        const { parseCV } = require('./services/api');
                        const res = await parseCV(file);
                        if (res.success && res.data) {
                          const { name, skills } = res.data;
                          setUploadData(prev => ({
                            ...prev,
                            file,
                            candidateName: name || prev.candidateName,
                            skills: skills && skills.length > 0 ? skills.join(', ') : prev.skills,
                          }));
                          alert(`تم استخراج البيانات بنجاح!\nالاسم: ${name}\nالمهارات: ${skills.join(', ')}`);
                        }
                      } catch (err) {
                        console.error("Parse error:", err);
                      }
                      setLoading(false);
                    }
                  }}
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? "جارٍ المعالجة..." : "رفع"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowUpload(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        )
      }

      {showReports && (
        <Suspense fallback={<div className="loading">جارِ التحميل...</div>}>
          <Reports onClose={() => setShowReports(false)} />
        </Suspense>
      )}

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div className="card">
            <h2>
              <Filter size={20} />
              الفلاتر والبحث{" "}
            </h2>
            <div className="form-grid">
              <input
                type="text"
                placeholder="بحث بالإسم "
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
                }
              />
              {/* Removed the skills search input */}
              <select
                value={filters.folder}
                onChange={(e) =>
                  setFilters({ ...filters, folder: e.target.value })
                }
              >
                <option value="">كل المجلدات</option>
                {folders.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">كل الحالات</option>
                {(config.cvStatuses && config.cvStatuses.length > 0
                  ? config.cvStatuses
                  : [
                    { value: "new", label: "جديد", color: "#4299e1" },
                    {
                      value: "progress",
                      label: "قيد التنفيذ",
                      color: "#ed8936",
                    },
                    { value: "complete", label: "مكتمل", color: "#48bb78" },
                  ]
                ).map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <div className="form-group">
                <label>العمر</label>
                <input
                  type="number"
                  placeholder="العمر"
                  value={filters.age}
                  onChange={(e) =>
                    setFilters({ ...filters, age: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>من تاريخ</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>إلى تاريخ</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleSearch}>
                <Search size={18} /> بحث
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowAdvancedSearch(v => !v)}
                style={{ backgroundColor: '#e2e8f0' }}
              >
                <Search size={18} /> بحث متقدم
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setFilters({
                    name: "",
                    skills: "",
                    folder: "",
                    dateFrom: "",
                    dateTo: "",
                    status: "",
                    age: "",
                  });
                  loadData();
                }}
              >
                <RefreshCw size={18} /> إعادة تعيين
              </button>
            </div>
          </div>

          {showAdvancedSearch && (
            <Suspense fallback={<div className="loading">جارِ التحميل...</div>}>
              <AdvancedSearch
                onSearch={handleAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
              />
            </Suspense>
          )}


        </div>
        <div style={{ width: "24%", minWidth: 260, maxWidth: 360 }}>
          <FoldersPanel
            folders={folders}
            cvs={cvs}
            onMove={handleMove}
            onAddFolder={handleAddFolder}
            filters={filters}
            onFilterByStatus={filterByStatus}
          />
        </div>
      </div>

      <div className="card" style={{ position: 'relative' }}>
        <button
          className={`btn ${bulkMode ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => {
            setBulkMode(!bulkMode);
            setSelectedCVs([]);
          }}
          style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}
        >
          {bulkMode ? 'إلغاء التحديد المتعدد' : 'تحديد متعدد'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ margin: 0, paddingLeft: 120 }}>السير الذاتية ({cvs.length})</h2>
          </div>
          {bulkMode && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedCVs.length === cvs.length && cvs.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span>تحديد الكل</span>
            </label>
          )}
        </div>

        {selectedCVs.length > 0 && (
          <div className="bulk-actions-toolbar" style={{
            padding: '12px 16px',
            background: '#f7fafc',
            borderRadius: 8,
            marginBottom: 16,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontWeight: 600, color: '#2d3748' }}>
              {selectedCVs.length} محدد
            </span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkMove(e.target.value);
                  e.target.value = '';
                }
              }}
              style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e0' }}
            >
              <option value="">نقل إلى...</option>
              {folders.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusUpdate(e.target.value);
                  e.target.value = '';
                }
              }}
              style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e0' }}
            >
              <option value="">تغيير الحالة...</option>
              {config.cvStatuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowComparison(true)}
              className="btn btn-secondary btn-small"
              disabled={selectedCVs.length < 2 || selectedCVs.length > 4}
              title="اختر من 2 إلى 4 سير ذاتية للمقارنة"
            >
              مقارنة ({selectedCVs.length})
            </button>
            <button
              onClick={handleBulkDelete}
              className="btn btn-danger btn-small"
              style={{ marginLeft: 'auto' }}
            >
              حذف المحدد
            </button>
          </div>
        )}

        {loading ? (
          <p className="loading">جارٍ تحميل السير الذاتية...</p>
        ) : cvs.length === 0 ? (
          <p className="empty">لا توجد سير ذاتية</p>
        ) : (
          <div className="cv-grid">
            {cvs.map((cv) => (
              <div
                key={cv.id}
                className="cv-card"
                draggable={!bulkMode}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", cv.id);
                }}
                style={{
                  position: 'relative',
                  opacity: selectedCVs.includes(cv.id) ? 0.7 : 1,
                  border: selectedCVs.includes(cv.id) ? '2px solid #4299e1' : undefined
                }}
              >
                {bulkMode && (
                  <input
                    type="checkbox"
                    checked={selectedCVs.includes(cv.id)}
                    onChange={(e) => handleSelectCV(cv.id, e.target.checked)}
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      width: 20,
                      height: 20,
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <div className="cv-header">
                  <FileText size={24} className="icon" />
                  <div>
                    <h3>{cv.candidateName}</h3>
                    <span className="filename">{cv.originalName}</span>
                  </div>
                </div>
                <div className="cv-skills">
                  {cv.skills.map((s, i) => (
                    <span key={i} className="skill-tag">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="cv-meta">
                  <span>
                    <FolderOpen size={14} /> {cv.folder}
                  </span>
                  {cv.status && (
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor:
                          (config.cvStatuses && config.cvStatuses.length > 0
                            ? config.cvStatuses
                            : [
                              {
                                value: "new",
                                label: "جديد",
                                color: "#4299e1",
                              },
                              {
                                value: "progress",
                                label: "قيد التنفيذ",
                                color: "#ed8936",
                              },
                              {
                                value: "complete",
                                label: "مكتمل",
                                color: "#48bb78",
                              },
                            ]
                          ).find((s) => s.value === cv.status)?.color ||
                          "#a0aec0",
                      }}
                    >
                      {(config.cvStatuses && config.cvStatuses.length > 0
                        ? config.cvStatuses
                        : [
                          { value: "new", label: "جديد", color: "#4299e1" },
                          {
                            value: "progress",
                            label: "قيد التنفيذ",
                            color: "#ed8936",
                          },
                          {
                            value: "complete",
                            label: "مكتمل",
                            color: "#48bb78",
                          },
                        ]
                      ).find((s) => s.value === cv.status)?.label || cv.status}
                    </span>
                  )}
                  {cv.age && (
                    <span className="age-badge">عمر: {cv.age} سنة</span>
                  )}
                  <span>{formatDate(cv.uploadDate)}</span>
                  <span>{formatSize(cv.fileSize)}</span>
                </div>
                <div className="cv-actions">
                  <a
                    href={getFileUrl(cv.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-small btn-primary"
                  >
                    <Download size={16} />
                  </a>
                  <button
                    className="btn btn-small btn-primary"
                    title="معاينة"
                    onClick={() => setPreviewId(cv.id)}
                    style={{ marginLeft: 8 }}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="btn btn-small btn-secondary"
                    title="Notes"
                    onClick={() => setNotesCvId(cv.id)}
                    style={{ marginLeft: 8 }}
                  >
                    ملاحظات ({(cv.notes || []).length})
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(cv.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBulkUpload && (
        <BulkUpload
          onClose={() => setShowBulkUpload(false)}
          onDone={() => {
            setShowBulkUpload(false);
            loadData();
          }}
        />
      )}
      {previewId && (
        <CVPreview cvId={previewId} onClose={() => setPreviewId(null)} />
      )}
      {notesCvId && (
        <CVNotes cvId={notesCvId} onClose={() => setNotesCvId(null)} />
      )}
      {showComparison && (
        <ComparisonTool
          cvs={cvs.filter((cv) => selectedCVs.includes(cv.id))}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}

export default App;
