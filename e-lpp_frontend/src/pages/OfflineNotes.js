import { useState, useEffect, useMemo, useRef } from "react";
import "../styles/offlineNotes.css";

const BASE_URL  ="https://e-learning-personalization-platform-8.onrender.com";
const MAX_BYTES = 10 * 1024 * 1024;                          // 10 MB
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

export default function OfflineNotes() {
  const [notes,        setNotes]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [sortOption,   setSortOption]   = useState("date");

  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form,      setForm]      = useState({ title: "", course: "", size: "", fileUrl: "" });
  const [fileError, setFileError] = useState("");
  const [fileName,  setFileName]  = useState("");

  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");

  /* ── Fetch notes ── */
  const fetchNotes = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/api/offline-notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setNotes(data);
    } catch (err) {
      console.error("Fetch notes error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []); // eslint-disable-line

  /* ── File picker ── */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError("");
    setFileName("");

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Only PDF, PNG, or JPG files are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_BYTES) {
      setFileError(
        `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 10 MB.`
      );
      e.target.value = "";
      return;
    }

    const sizeStr = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / 1024 / 1024).toFixed(2)} MB`;

    setFileName(file.name);
    setForm(prev => ({
      ...prev,
      size:    sizeStr,
      fileUrl: URL.createObjectURL(file)   // local preview URL
    }));
  };

  /* ── Create ── */
  const handleCreate = async () => {
    if (!form.title || !form.course) { alert("Title and Course are required"); return; }
    try {
      const res  = await fetch(`${BASE_URL}/api/offline-notes`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) { setNotes(prev => [data.note, ...prev]); resetForm(); }
      else        alert(data.message || "Failed to create note");
    } catch { alert("Error creating note"); }
  };

  /* ── Update ── */
  const handleUpdate = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/api/offline-notes/${editingId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) { setNotes(prev => prev.map(n => n._id === editingId ? data.note : n)); resetForm(); }
      else        alert(data.message || "Failed to update note");
    } catch { alert("Error updating note"); }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this note?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/offline-notes/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setNotes(prev => prev.filter(n => n._id !== id));
      else { const d = await res.json(); alert(d.message || "Failed to delete"); }
    } catch { alert("Error deleting note"); }
  };

  const startEdit = (note) => {
    setEditingId(note._id);
    setFileName("");
    setFileError("");
    setForm({ title: note.title, course: note.course, size: note.size || "", fileUrl: note.fileUrl || "" });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFileName("");
    setFileError("");
    setForm({ title: "", course: "", size: "", fileUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) handleUpdate(); else handleCreate();
  };

  /* ── Helpers ── */
  const getSizeInMB = (size) => {
    if (!size) return 0;
    if (size.includes("KB")) return parseFloat(size) / 1024;
    return parseFloat(size) || 0;
  };

  const courses = ["All", ...new Set(notes.map(n => n.course))];

  const filteredNotes = useMemo(() => {
    let list = [...notes];
    if (search)                list = list.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));
    if (filterCourse !== "All") list = list.filter(n => n.course === filterCourse);
    if (sortOption === "date") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortOption === "size") list.sort((a, b) => getSizeInMB(b.size) - getSizeInMB(a.size));
    return list;
  }, [notes, search, filterCourse, sortOption]);

  const totalStorage = notes.reduce((acc, n) => acc + getSizeInMB(n.size), 0).toFixed(1);

  const fileIcon = (url = "") => {
    if (url.includes("pdf"))                   return "📄";
    if (url.match(/\.(png|jpg|jpeg)($|\?)/i))  return "🖼️";
    return "📎";
  };

  return (
    <div className="container offline-container py-4">

      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h2 className="fw-bold">Offline Notes & PDFs</h2>
          <p className="text-muted">Access your downloaded course materials anytime</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Add Note
        </button>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body">
            <h5 className="fw-semibold mb-3">{editingId ? "Edit Note" : "Add New Note"}</h5>

            {/* Info banner */}
            <div className="alert alert-info py-2 px-3 mb-3" style={{ fontSize: 13 }}>
              <strong>Allowed files:</strong> PDF, PNG, JPG &nbsp;·&nbsp;
              <strong>Max size:</strong> 10 MB per file &nbsp;·&nbsp;
              Or paste a Google Drive / Dropbox link below
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Note Title <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Chapter 1 — Introduction"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Course Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Machine Learning Foundations"
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    required
                  />
                </div>

                {/* File upload */}
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Upload File&nbsp;
                    <span className="text-muted fw-normal" style={{ fontSize: 12 }}>
                      (PDF / PNG / JPG — max 10 MB)
                    </span>
                  </label>

                  <div
                    className="upload-drop-area"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {fileName ? (
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: 22 }}>📄</span>
                        <span className="fw-semibold text-primary" style={{ fontSize: 14 }}>
                          {fileName}
                        </span>
                        <span className="text-muted small">({form.size})</span>
                      </div>
                    ) : (
                      <div className="text-center text-muted" style={{ fontSize: 13 }}>
                        <div style={{ fontSize: 30, marginBottom: 6 }}>📁</div>
                        Click to choose a file
                        <div style={{ fontSize: 11, marginTop: 4 }}>PDF, PNG, JPG — max 10 MB</div>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />

                  {fileError && (
                    <div className="text-danger mt-1" style={{ fontSize: 13 }}>
                      ⚠️ {fileError}
                    </div>
                  )}
                </div>

                {/* URL fallback */}
                <div className={fileName ? "col-12" : "col-md-8"}>
                  <label className="form-label fw-semibold">
                    Or Paste File URL&nbsp;
                    <span className="text-muted fw-normal" style={{ fontSize: 12 }}>
                      (Google Drive, Dropbox, etc.)
                    </span>
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://drive.google.com/file/d/..."
                    value={fileName ? "" : form.fileUrl}
                    disabled={!!fileName}
                    onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                  />
                  {fileName && (
                    <small className="text-muted">
                      File selected above — URL field disabled.&nbsp;
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0"
                        onClick={() => {
                          setFileName("");
                          setForm(prev => ({ ...prev, size: "", fileUrl: "" }));
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        Clear file
                      </button>
                    </small>
                  )}
                </div>

                {/* Manual size — only when URL is pasted */}
                {!fileName && (
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      File Size&nbsp;
                      <span className="text-muted fw-normal" style={{ fontSize: 12 }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 2.4 MB"
                      value={form.size}
                      onChange={(e) => setForm({ ...form, size: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="mt-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update" : "Save"}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Storage bar */}
      <div className="card storage-card mb-4 border-0 shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h6 className="fw-semibold mb-1">Storage Used</h6>
            <p className="text-muted small mb-0">Total files: {notes.length}</p>
          </div>
          <div className="text-end">
            <h5 className="fw-bold text-primary mb-0">{totalStorage} MB</h5>
            <small className="text-muted">10 MB limit per file</small>
          </div>
        </div>
      </div>

      {/* Search + Filter + Sort */}
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
            {courses.map((c, i) => <option key={i}>{c}</option>)}
          </select>
        </div>
        <div className="col-md-4">
          <select className="form-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="date">Sort by Date</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Loading notes...</p>
        </div>
      ) : filteredNotes.length > 0 ? (
        filteredNotes.map((note) => (
          <div key={note._id} className="card note-card mb-3 border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center flex-wrap">
              <div className="d-flex gap-3 flex-grow-1">
                <div className="file-icon">{fileIcon(note.fileUrl)}</div>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h6 className="mb-0 fw-semibold">{note.title}</h6>
                    <span className="badge offline-badge">Offline</span>
                  </div>
                  <p className="mb-1 text-muted small">{note.course}</p>
                  <div className="text-muted small d-flex gap-4 flex-wrap">
                    <span>📦 {note.size || "N/A"}</span>
                    <span>📅 {new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 mt-3 mt-md-0">
                {note.fileUrl && (
                  <a href={note.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="btn btn-primary btn-sm px-3">Open</a>
                )}
                <button className="btn btn-outline-primary btn-sm px-3" onClick={() => startEdit(note)}>
                  Edit
                </button>
                <button className="btn btn-outline-danger btn-sm px-3" onClick={() => handleDelete(note._id)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="card empty-card text-center p-5 border-0 shadow-sm">
          <h5>No Notes Found</h5>
          <p className="text-muted">
            {notes.length === 0
              ? 'Click "+ Add Note" to create your first note'
              : "Try adjusting the search or filter options"}
          </p>
        </div>
      )}
    </div>
  );
}
