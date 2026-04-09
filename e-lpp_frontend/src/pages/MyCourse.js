import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/mycourse.css";

const BASE_URL = "http://localhost:5000";
const DEFAULT_COURSE_IMAGE = "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=350&h=200&fit=crop";

function MyCourse() {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to see your courses.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/api/enrollment/my-courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (res.ok) {
          setMyCourses(data);
        } else {
          setError(data.message || "Failed to load your courses");
        }
      } catch (err) {
        console.error("My courses error:", err);
        setError("Server error. Please make sure backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content container-fluid">
        <div className="page-header">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="page-title mb-2">My Learning Journey</h2>
              <p className="page-subtitle text-muted">
                Continue learning and growing your skills
              </p>
            </div>
            {myCourses.length > 0 && (
              <Link to="/courses" className="btn btn-outline-primary">
                Explore More Courses
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading your courses...</p>
          </div>
        ) : error ? (
          <div className="alert alert-warning">{error}</div>
        ) : myCourses.length === 0 ? (
          <div className="empty-state text-center">
            <div className="empty-state-content">
              <i className="bi bi-book-half mb-3 text-primary display-4"></i>
              <h4 className="mb-3">Your Course Catalog is Empty</h4>
              <p className="text-muted mb-4">
                Start your learning adventure and unlock new possibilities
              </p>
              <Link to="/courses" className="btn btn-primary btn-lg">
                Discover Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {myCourses.map((course) => (
              <div key={course.id || course._id} className="col-md-6 col-lg-4">
                <div className="course-card">
                  <div className="course-image-container mb-3">
                    <img
                      src={course.imageUrl || course.image || DEFAULT_COURSE_IMAGE}
                      alt={course.title}
                      className="course-image img-fluid"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_COURSE_IMAGE;
                      }}
                    />
                    <div className="course-category-overlay">
                      <span className="course-category badge">
                        {course.category || "General"}
                      </span>
                    </div>
                  </div>
                  <div className="course-card-content">
                    <div className="course-card-header">
                      <h5 className="course-title mb-2">{course.title}</h5>
                    </div>
                    <p className="course-description text-muted mb-3">
                      {course.description}
                    </p>
                    <div className="course-progress mb-3">
                      <div className="progress" style={{ height: "6px" }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${course.progress || 0}%` }}
                          aria-valuenow={course.progress || 0}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                      <small className="text-muted">
                        {course.progress || 0}% Complete
                      </small>
                    </div>
                    <Link
                      to={`/courses/${course.id || course._id}`}
                      state={{ fromMyCourse: true, courseId: course.id || course._id }}
                      className="w-100"
                    >
                      <button className="btn btn-primary w-100">
                        Continue Learning
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCourse;