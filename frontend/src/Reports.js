import React, { useEffect, useRef, useState } from "react";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
);

export default function Reports({ onClose }) {
  const [summary, setSummary] = useState(null);
  const [byFolder, setByFolder] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    fetchSummary();
    fetchByFolder();
  }, []);

  const fetchSummary = async () => {
    const params = new URLSearchParams();
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    const url = `/api/reports/summary${params.toString() ? "?" + params.toString() : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    if (res.ok) setSummary(data.summary);
  };
  const fetchByFolder = async () => {
    const params = new URLSearchParams();
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    const url = `/api/reports/by-folder${params.toString() ? "?" + params.toString() : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    if (res.ok) setByFolder(data.byFolder);
  };

  useEffect(() => {
    if (!byFolder || !chartRef.current) return;
    const labels = byFolder.map((b) => b.folder);
    const counts = byFolder.map((b) => b.cvs.length);
    if (chartInstance.current) chartInstance.current.destroy();
    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "CVs per folder", data: counts, backgroundColor: "#667eea" },
        ],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });
  }, [byFolder]);

  const exportPDF = async () => {
    // ensure charts rendered
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(18);
    doc.text("CV Management - Summary Report", 14, 20);
    if (summary) {
      doc.setFontSize(12);
      doc.text(`Total CVs: ${summary.totalCVs}`, 14, 34);
      doc.text(`Total Folders: ${summary.totalFolders}`, 14, 42);
      doc.text(`Old CVs (30+ days): ${summary.oldCVs || 0}`, 14, 50);
      // top skills
      let y = 60;
      doc.text("Top Skills:", 14, y);
      y += 6;
      (summary.topSkills || []).forEach((ts) => {
        doc.text(`${ts.skill} - ${ts.count}`, 16, y);
        y += 6;
      });
    }
    // add chart image
    if (chartRef.current) {
      const canvas = chartRef.current;
      const imgData = canvas.toDataURL("image/png", 1.0);
      doc.addImage(imgData, "PNG", 14, 90, 260, 80);
    }
    doc.save("summary-report.pdf");
  };

  const exportExcel = async () => {
    // get all cvs
    const res = await fetch("/api/cvs");
    const data = await res.json();
    if (!res.ok) {
      alert("Failed to fetch CVs for Excel");
      return;
    }
    const cvs = data.cvs || [];
    const sheet = XLSX.utils.json_to_sheet(
      cvs.map((cv) => ({
        id: cv.id,
        name: cv.candidateName,
        folder: cv.folder,
        skills: cv.skills ? cv.skills.join(", ") : "",
        uploadDate: cv.uploadDate,
        fileSize: cv.fileSize,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "CVs");
    XLSX.writeFile(wb, "cvs.xlsx");
  };

  return (
    <div className="report-modal">
      <div className="report-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>تقارير</h3>
          <div>
            <button className="btn btn-secondary" onClick={exportExcel}>
              تصدير Excel
            </button>
            <button
              className="btn btn-primary"
              onClick={exportPDF}
              style={{ marginLeft: 8 }}
            >
              تصدير PDF
            </button>
            <button
              className="btn btn-secondary"
              onClick={onClose}
              style={{ marginLeft: 8 }}
            >
              اغلاق
            </button>
          </div>
        </div>
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <h4>فلترة حسب التاريخ:</h4>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div>
              <label style={{ fontSize: "0.875rem", marginLeft: 8 }}>من:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ddd",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.875rem", marginLeft: 8 }}>
                إلى:
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ddd",
                }}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                fetchSummary();
                fetchByFolder();
              }}
              style={{ padding: "8px 16px" }}
            >
              تطبيق
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                fetchSummary();
                fetchByFolder();
              }}
              style={{ padding: "8px 16px" }}
            >
              إعادة تعيين
            </button>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          {summary ? (
            <div>
              <p>
                إجمالي السير الذاتية: <b>{summary.totalCVs}</b>
              </p>
              <p>
                إجمالي المجلدات: <b>{summary.totalFolders}</b>
              </p>
              <p>
                السير الذاتية القديمة (أكثر من 30 يوم):{" "}
                <b>{summary.oldCVs || 0}</b>
              </p>
            </div>
          ) : (
            <p>جاري التحميل...</p>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <canvas ref={chartRef} width={800} height={300}></canvas>
        </div>
      </div>
    </div>
  );
}
