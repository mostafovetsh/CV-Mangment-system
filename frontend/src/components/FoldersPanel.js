// Component: FoldersPanel - add delete button for custom folders
import React, { useState } from "react";
import {
  Cpu,
  Server,
  TrendingUp,
  Users,
  DollarSign,
  Palette,
  Headphones,
  Settings,
  Folder,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  // Add Trash2 icon
  Trash2,
} from "lucide-react";
import "./folderspanel.css";

const ICON_MAP = {
  Cpu,
  Server,
  TrendingUp,
  Users,
  DollarSign,
  Palette,
  Headphones,
  Settings,
  Folder,
};

const STATUS_FOLDER = {
  name: "all_statuses",
  displayName: "كل الحالات",
  icon: "Folder",
  color: "#9f7aea",
  description: "عرض السير الذاتية حسب الحالة",
  isStatusFolder: true
};

const DEPARTMENT_CATEGORIES = [
  STATUS_FOLDER,
  {
    name: "engineering",
    displayName: "هندسة",
    icon: "Cpu",
    color: "#667eea",
    description: "مهندسين برمجيات وتقنية",
  },
  {
    name: "it",
    displayName: "تكنولوجيا المعلومات",
    icon: "Server",
    color: "#4299e1",
    description: "دعم تقني وإدارة شبكات",
  },
  {
    name: "marketing",
    displayName: "تسويق",
    icon: "TrendingUp",
    color: "#48bb78",
    description: "تسويق ومبيعات",
  },
  {
    name: "hr",
    displayName: "موارد بشرية",
    icon: "Users",
    color: "#ed8936",
    description: "إدارة الموارد البشرية",
  },
  {
    name: "finance",
    displayName: "مالية",
    icon: "DollarSign",
    color: "#9f7aea",
    description: "محاسبة ومالية",
  },
  {
    name: "design",
    displayName: "تصميم",
    icon: "Palette",
    color: "#f56565",
    description: "تصميم جرافيك و UI/UX",
  },
  {
    name: "customer-service",
    displayName: "خدمة العملاء",
    icon: "Headphones",
    color: "#38b2ac",
    description: "دعم ورعاية العملاء",
  },
  {
    name: "operations",
    displayName: "عمليات",
    icon: "Settings",
    color: "#718096",
    description: "إدارة العمليات والخدمات",
  },
  {
    name: "general",
    displayName: "عام",
    icon: "Folder",
    color: "#a0aec0",
    description: "سير ذاتية عامة",
  },
];

const FoldersPanel = React.memo(function FoldersPanel({
  folders = [],
  cvs = [],
  onMove,
  onAddFolder,
  onDeleteFolder,
  filters = {},
  onFilterByStatus,
}) {
  const [hover, setHover] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    predefined: true,
    custom: true,
  });
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Calculate CV counts per folder and status
  const counts = folders.reduce((acc, f) => {
    acc[f] = 0;
    return acc;
  }, {});

  // Add counts for status-based folders
  counts['all_statuses'] = cvs.length; // Total count for the status folder
  counts['new'] = cvs.filter(cv => cv.status === 'new').length;
  counts['progress'] = cvs.filter(cv => cv.status === 'progress').length;
  counts['complete'] = cvs.filter(cv => cv.status === 'complete').length;

  cvs.forEach((cv) => {
    const f = cv.folder || "general";
    if (!counts[f]) counts[f] = 0;
    counts[f]++;
  });

  // Separate predefined and custom folders
  const predefinedFolderNames = DEPARTMENT_CATEGORIES.map((cat) => cat.name).filter(name => name !== 'all_statuses');
  const predefinedFolders = DEPARTMENT_CATEGORIES.filter((cat) =>
    folders.includes(cat.name),
  );
  const customFolders = folders.filter(
    (f) => !predefinedFolderNames.includes(f),
  );

  // Filter folders based on search
  const filteredPredefined = predefinedFolders.filter(
    (cat) =>
      cat.displayName.includes(searchTerm) ||
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredCustom = customFolders.filter((f) =>
    f.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, folder) => {
    e.preventDefault();
    setHover(null);
    const cvId = e.dataTransfer.getData("text/plain");
    if (cvId) onMove && onMove(cvId, folder);
  };

  const handleDragEnter = (e, folder) => {
    e.preventDefault();
    setHover(folder);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setHover(null);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddFolder = () => {
    const trimmedName = newFolderName.trim();
    console.log("FoldersPanel - handleAddFolder called with:", trimmedName);

    if (!trimmedName) {
      alert("الرجاء إدخال اسم المجلد");
      return;
    }

    if (!onAddFolder) {
      console.error("onAddFolder prop is not defined");
      alert("خطأ: وظيفة الإضافة غير متاحة");
      return;
    }

    console.log("Calling onAddFolder with:", trimmedName);
    onAddFolder(trimmedName);
    setNewFolderName("");
    setShowAddFolder(false);
  };

  // Status folder configuration
  const statusFolders = [
    { id: 'new', name: 'جديد', color: '#4299e1' },
    { id: 'progress', name: 'قيد التنفيذ', color: '#ed8936' },
    { id: 'complete', name: 'مكتمل', color: '#48bb78' },
  ];

  const renderStatusSubfolders = (parentFolder) => {
    if (!parentFolder.isStatusFolder) return null;

    return (
      <div className="status-subfolders" style={{ marginRight: '20px' }}>
        {statusFolders.map((status) => (
          <div
            key={status.id}
            className={`folder-item ${hover === `${parentFolder.name}-${status.id}` ? 'hover' : ''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, { name: parentFolder.name, status: status.id })}
            onDragEnter={(e) => handleDragEnter(e, `${parentFolder.name}-${status.id}`)}
            onDragLeave={handleDragLeave}
            onClick={() => onFilterByStatus && onFilterByStatus(status.id)}
            style={{
              padding: '6px 10px',
              margin: '2px 0',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: filters.status === status.id ? 'rgba(66, 153, 225, 0.1)' : (hover === `${parentFolder.name}-${status.id}` ? 'rgba(0, 0, 0, 0.05)' : 'transparent'),
              borderLeft: `3px solid ${status.color}`,
            }}
          >
            <div className="folder-info" style={{ flex: 1 }}>
              <div className="folder-name" style={{ color: '#2d3748', fontWeight: 600 }}>
                {status.name}
              </div>
            </div>
            <div
              className="folder-count"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                padding: '0 6px',
                fontSize: '0.8em',
                color: '#555',
              }}
            >
              {counts[status.id] || 0}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFolderItem = (
    folderName,
    displayName,
    icon,
    color,
    isCustom = false,
  ) => {
    const Icon = isCustom ? Folder : ICON_MAP[icon] || Folder;
    const itemColor = color || "#a0aec0";
    const isDragOver = hover === folderName;
    const count = counts[folderName] || 0;

    return (
      <div
        key={folderName}
        className={`folder-item ${isDragOver ? "dragover" : ""}`}
        style={{
          borderLeftColor: itemColor,
          backgroundColor: isDragOver ? `${itemColor}15` : "transparent",
        }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, folderName)}
        onDragEnter={(e) => handleDragEnter(e, folderName)}
        onDragLeave={handleDragLeave}
      >
        <div className="folder-icon" style={{ color: itemColor }}>
          <Icon size={20} />
        </div>
        <div className="folder-info">
          <div className="folder-name">{displayName}</div>
          {!isCustom && (
            <div
              className="folder-description"
              style={{ fontSize: "0.75rem", color: "#718096" }}
            >
              {
                DEPARTMENT_CATEGORIES.find((c) => c.name === folderName)
                  ?.description
              }
            </div>
          )}
        </div>
        <div
          className="folder-count"
          style={{
            backgroundColor: `${itemColor}20`,
            color: itemColor,
            fontWeight: "bold",
          }}
        >
          {count}
        </div>

        {/* Add: delete button for custom folders only */}
        {isCustom && (
          <button
            className="btn-icon-small"
            title="حذف المجلد"
            onClick={(e) => {
              e.stopPropagation();
              if (onDeleteFolder) onDeleteFolder(folderName);
            }}
            style={{ marginLeft: 8 }}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="folders-panel">
      <div className="folders-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="بحث في المجلدات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Status-based folder with subfolders */}
      <div className="folder-section">
        <div
          className="folder-section-header"
          onClick={() => toggleSection('status')}
        >
          {expandedSections.status ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
          <span>حالة السيرة الذاتية</span>
          <span className="section-count">({statusFolders.length})</span>
        </div>

        {expandedSections.status && (
          <div className="folders-list">
            {renderStatusSubfolders(STATUS_FOLDER)}
          </div>
        )}
      </div>

      {/* Predefined Departments */}
      <div className="folder-section">
        <div
          className="folder-section-header"
          onClick={() => toggleSection("predefined")}
        >
          {expandedSections.predefined ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
          <span>الأقسام الرئيسية</span>
          <span className="section-count">({filteredPredefined.length})</span>
        </div>

        {expandedSections.predefined && (
          <div className="folders-list">
            {filteredPredefined.length > 0 ? (
              filteredPredefined.map((cat) =>
                renderFolderItem(
                  cat.name,
                  cat.displayName,
                  cat.icon,
                  cat.color,
                ),
              )
            ) : (
              <div className="empty-message">لا توجد أقسام مطابقة</div>
            )}
          </div>
        )}
      </div>

      {/* Custom Folders */}
      {customFolders.length > 0 && (
        <div className="folder-section">
          <div
            className="folder-section-header"
            onClick={() => toggleSection("custom")}
          >
            {expandedSections.custom ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            <span>مجلدات مخصصة</span>
            <span className="section-count">({filteredCustom.length})</span>
          </div>

          {expandedSections.custom && (
            <div className="folders-list">
              {filteredCustom.length > 0 ? (
                filteredCustom.map((folderName) =>
                  renderFolderItem(
                    folderName,
                    folderName,
                    "Folder",
                    "#a0aec0",
                    true,
                  ),
                )
              ) : (
                <div className="empty-message">لا توجد مجلدات مطابقة</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      {/* تم إزالة قسم الإحصائيات: إجمالي المجلدات / إجمالي السير الذاتية */}
      {/* كان هنا:
          <div className="folder-stats">
            <div className="stat-item">
              <span>إجمالي المجلدات</span>
              <strong>{folders.length}</strong>
            </div>
            <div className="stat-item">
              <span>إجمالي السير الذاتية</span>
              <strong>{cvs.length}</strong>
            </div>
          </div>
      */}
    </div>
  );
});

export default FoldersPanel;
