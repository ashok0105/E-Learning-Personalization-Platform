import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaClock,
  FaUsers,
  FaStar,
  FaSearch,
  FaHeart,
  FaBookOpen
} from "react-icons/fa";
import { useState, useEffect } from "react";
import "../styles/courses.css";

const BASE_URL = "https://e-learning-personalization-platform-8.onrender.com";
pr
function Courses() {
  const [allCourses,  setAllCourses]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [searchTerm,  setSearchTerm]  = useState("");
  const [category,    setCategory]    = useState("All");
  const [wishlist,    setWishlist]    = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/courses`);
        const data     = await response.json();
        if (response.ok) {
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
    fetchCourses();
  }, []);

  const toggleWishlist = (id) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  /* Build category list dynamically from actual courses */
  const categories = ["All", ...new Set(allCourses.map(c => c.category).filter(Boolean))];

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch   = (course.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === "All" || course.category === category;
    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < Math.round(rating || 0) ? "star filled" : "star"} />
    ));

  return (
    <div className="courses-layout">
      <Sidebar />

      <div className="courses-main">

        {/* ── Header ── */}
        <div className="courses-page-header mb-4">
          <div>
            <h2 className="courses-page-title">Explore Courses</h2>
            <p className="courses-page-sub">Upgrade your skills with our curated courses</p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="row mb-4 g-3">
          <div className="col-sm-4">
            <div className="courses-stat-card">
              <div className="courses-stat-icon">
                <FaBookOpen />
              </div>
              <div>
                <div className="courses-stat-value">{allCourses.length}</div>
                <div className="courses-stat-label">Total Courses</div>
              </div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="courses-stat-card">
              <div className="courses-stat-icon wishlist-icon-stat">
                <FaHeart />
              </div>
              <div>
                <div className="courses-stat-value">{wishlist.length}</div>
                <div className="courses-stat-label">Wishlist</div>
              </div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="courses-stat-card">
              <div className="courses-stat-icon showing-icon-stat">
                <FaSearch />
              </div>
              <div>
                <div className="courses-stat-value">{filteredCourses.length}</div>
                <div className="courses-stat-label">Showing</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="courses-controls mb-4">
          <div className="courses-category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`courses-pill ${category === cat ? "active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="courses-search-box">
            <FaSearch className="courses-search-icon" />
            <input
              type="text"
              className="courses-search-input"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="courses-loading">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="courses-empty">
            <FaBookOpen className="courses-empty-icon" />
            <h5>No courses found</h5>
            <p className="text-muted">
              {searchTerm ? `No results for "${searchTerm}"` : "No courses available yet."}
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredCourses.map((course) => {
              const courseId = course.id || course._id;
              const wishlisted = wishlist.includes(courseId);

              return (
                <div className="col-md-6 col-lg-4" key={courseId}>
                  <div className="course-card">

                    {/* Image */}
                    <div className="course-card-img-wrap">
                      <img
                        src={
                          course.image ||
                          "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop"
                        }
                        alt={course.title}
                        className="course-card-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop";
                        }}
                      />

                      {/* Category badge */}
                      {course.category && (
                        <span className="course-card-badge">{course.category}</span>
                      )}

                      {/* Wishlist button */}
                      <button
                        className={`course-card-wishlist ${wishlisted ? "active" : ""}`}
                        onClick={() => toggleWishlist(courseId)}
                        title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <FaHeart />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="course-card-body">
                      <h5 className="course-card-title">{course.title}</h5>

                      <p className="course-card-desc">
                        {course.description?.length > 90
                          ? course.description.slice(0, 90) + "…"
                          : course.description}
                      </p>

                      {/* Stars */}
                      <div className="course-card-stars">
                        {renderStars(course.rating)}
                        {course.rating > 0 && (
                          <span className="course-card-rating-num">
                            {Number(course.rating).toFixed(1)}
                          </span>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="course-card-meta">
                        <span>
                          <FaClock className="meta-icon" />
                          {course.duration || "Self-paced"}
                        </span>
                        <span>
                          <FaUsers className="meta-icon" />
                          {(course.students || 0).toLocaleString()} students
                        </span>
                      </div>

                      {/* CTA */}
                      <Link to={`/courses/${courseId}`} className="course-card-btn-link">
                        <button className="course-card-btn">View Course</button>
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default Courses;
