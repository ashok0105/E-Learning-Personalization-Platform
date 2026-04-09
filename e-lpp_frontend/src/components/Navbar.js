import { Link, useNavigate } from "react-router-dom";
import { FaGraduationCap, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [user,           setUser]           = useState(null);
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* ── Read user from localStorage ── */
  const loadUser = () => {
    try {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    /* Load on first mount */
    loadUser();

    /*
     * Listen for the custom "auth-change" event fired by Login.js and
     * Sidebar.js logout. This makes Navbar re-read localStorage immediately
     * whenever the logged-in user changes — no AuthContext needed.
     */
    window.addEventListener("auth-change", loadUser);
    return () => window.removeEventListener("auth-change", loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    setUser(null);
    setDropdownOpen(false);
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login");
  };

  return (
    <nav className="custom-navbar navbar navbar-expand-lg fixed-top">
      <div className="container-fluid px-4">

        {/* Brand */}
        <Link
          to={user ? "/dashboard" : "/"}
          className="navbar-brand d-flex align-items-center gap-2 text-white fw-bold"
        >
          <FaGraduationCap size={28} className="text-success" />
          <span className="brand-text d-none d-md-inline">E-Learning Platform</span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler navbar-toggler-custom"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        {/* Right side */}
        <div className={`navbar-collapse ${mobileMenuOpen ? "show" : ""}`}>
          {!user ? (
            <div className="ms-auto d-flex gap-2 flex-wrap justify-content-end">
              <Link to="/login">
                <button className="btn btn-glass-light px-4">Login</button>
              </Link>
              <Link to="/signup">
                <button className="btn btn-glass-warning px-4">Sign Up</button>
              </Link>
            </div>
          ) : (
            <div className="ms-auto profile-wrapper position-relative">
              <div
                className="profile-trigger d-flex align-items-center gap-2 text-white"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ cursor: "pointer" }}
              >
                <FaUserCircle size={28} />
                <span className="welcome-text fw-semibold">{user.name}</span>
              </div>

              {dropdownOpen && (
                <div className="profile-dropdown shadow">
                  <button
                    className="dropdown-item"
                    onClick={() => { navigate("/profile"); setDropdownOpen(false); }}
                  >
                    Profile
                  </button>
                  <button
                    className="dropdown-item logout text-danger"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;