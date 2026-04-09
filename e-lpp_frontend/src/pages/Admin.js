import React, { useState, useEffect } from "react";
import "../styles/adminpage.css";
import { Navigate } from "react-router-dom";
import {
  FaUsers,
  FaBook,
  FaClipboardCheck,
  FaChartLine,
  FaSearch
} from "react-icons/fa";

const BASE_URL = "http://localhost:5000";

export default function Admin() {
  const [allCourses, setAllCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const coursesPerPage = 5;

  /* ================= FETCH ALL COURSES FROM BACKEND ================= */
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/admin/all-courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAllCourses(data);
      } else {
        console.error("Failed to load courses:", data.message);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const role = localStorage.getItem("userRole");
  if (role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  /* ================= APPROVE COURSE ================= */
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/admin/approve/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Update local state
        setAllCourses(prev =>
          prev.map(c => c._id === id ? { ...c, status: "Approved" } : c)
        );
      } else {
        alert(data.message || "Failed to approve");
      }
    } catch (error) {
      console.error("Approve error:", error);
      alert("Error approving course");
    }
  };

  /* ================= REJECT COURSE ================= */
  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/admin/reject/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAllCourses(prev =>
          prev.map(c => c._id === id ? { ...c, status: "Rejected" } : c)
        );
      } else {
        alert(data.message || "Failed to reject");
      }
    } catch (error) {
      console.error("Reject error:", error);
      alert("Error rejecting course");
    }
  };

  /* ================= DELETE COURSE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAllCourses(prev => prev.filter(c => c._id !== id));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting course");
    }
  };

  /* ================= RATING CHANGE ================= */
  const handleRatingChange = async (id, newRating) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BASE_URL}/api/courses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating: Number(newRating) })
      });
      setAllCourses(prev =>
        prev.map(c => c._id === id ? { ...c, rating: Number(newRating) } : c)
      );
    } catch (error) {
      console.error("Rating update error:", error);
    }
  };

  /* ================= COMPUTED STATS ================= */
  const totalCourses = allCourses.length;
  const pendingCount = allCourses.filter(c => c.status === "Pending").length;
  const approvedCount = allCourses.filter(c => c.status === "Approved").length;
  const rejectedCount = allCourses.filter(c => c.status === "Rejected").length;

  const systemStats = [
    { label: "Total Courses", value: totalCourses, icon: <FaBook /> },
    { label: "Pending", value: pendingCount, icon: <FaClipboardCheck /> },
    { label: "Approved", value: approvedCount, icon: <FaChartLine /> },
    { label: "Rejected", value: rejectedCount, icon: <FaUsers /> },
  ];

  /* ================= SEARCH + FILTER ================= */
  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "All" || course.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  /* ================= PAGINATION ================= */
  const indexOfLast = currentPage * coursesPerPage;
  const indexOfFirst = indexOfLast - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  return (
    <div className="admin-wrapper container-fluid">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
      </div>

      {/* ================= STATS ================= */}
      <div className="row g-4 my-3">
        {systemStats.map((stat, i) => (
          <div className="col-md-3" key={i}>
            <div className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div>
                <p>{stat.label}</p>
                <h3>{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= COURSE APPROVAL CARD ================= */}
      <div className="card saas-card mt-4">
        <div className="card-header saas-header">
          <h5 className="mb-0">Course Approval</h5>

          <div className="header-controls">
            {/* Search */}
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search course or instructor..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Filter */}
            <select
              className="form-select status-filter"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="card-body table-responsive">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">Loading courses...</p>
            </div>
          ) : (
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Instructor</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCourses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No matching courses found
                    </td>
                  </tr>
                ) : (
                  currentCourses.map((course) => (
                    <tr key={course._id}>
                      <td className="fw-semibold">{course.title}</td>
                      <td>{course.instructorName || course.instructor?.name || "N/A"}</td>
                      <td>{course.category || "General"}</td>

                      <td>
                        <span
                          className={`badge ${
                            course.status === "Approved"
                              ? "bg-success"
                              : course.status === "Rejected"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {course.status}
                        </span>
                      </td>

                      <td>
                        {course.status === "Approved" ? (
                          <select
                            className="form-select form-select-sm"
                            value={course.rating || 4}
                            onChange={(e) =>
                              handleRatingChange(course._id, e.target.value)
                            }
                          >
                            {[5, 4, 3, 2, 1].map((num) => (
                              <option key={num} value={num}>
                                {num} ⭐
                              </option>
                            ))}
                          </select>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="text-center">
                        {course.status === "Pending" && (
                          <>
                            <button
                              className="btn btn-success btn-sm me-2"
                              onClick={() => handleApprove(course._id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm me-2"
                              onClick={() => handleReject(course._id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleDelete(course._id)}
                          title="Delete course"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* ================= PAGINATION ================= */}
          {totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-end mt-3">
                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
