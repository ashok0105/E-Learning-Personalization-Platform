import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/signup.css";

const BASE_URL          = "https://e-learning-personalization-platform-8.onrender.com";
const INSTRUCTOR_DOMAIN = "elpp.ac.in";    // instructor must use  name@elpp.ac.in
const ADMIN_DOMAIN      = "elpp.ac.in";    // admin must also use  name@elpp.ac.in
const ADMIN_SECRET_KEY  = "ELPP@Admin2024"; // shown only on admin role select

function SignUp() {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", role: "student"
  });
  const [adminKey,     setAdminKey]     = useState("");
  const [emailError,   setEmailError]   = useState("");
  const [passError,    setPassError]    = useState("");
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const navigate = useNavigate();

  // ── Email domain rule per role ──────────────────────────────────────────
  const getEmailError = (email, role) => {
    if (!email) return "";
    const domain = email.split("@")[1]?.toLowerCase();
    if (role === "instructor" && domain !== INSTRUCTOR_DOMAIN)
      return `Instructor email must end with @${INSTRUCTOR_DOMAIN}`;
    if (role === "admin" && domain !== ADMIN_DOMAIN)
      return `Admin email must end with @${ADMIN_DOMAIN}`;
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (name === "email" || name === "role")
      setEmailError(getEmailError(
        name === "email" ? value : formData.email,
        name === "role"  ? value : formData.role
      ));

    if (name === "password" || name === "confirmPassword") {
      const pw  = name === "password"        ? value : formData.password;
      const cpw = name === "confirmPassword" ? value : formData.confirmPassword;
      setPassError(pw && cpw && pw !== cpw ? "Passwords do not match" : "");
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role } = formData;

    if (!name || !email || !password || !confirmPassword) { alert("Please fill all fields"); return; }
    if (password !== confirmPassword)  { setPassError("Passwords do not match"); return; }
    if (password.length < 6)           { alert("Password must be at least 6 characters"); return; }

    const emailErr = getEmailError(email, role);
    if (emailErr) { setEmailError(emailErr); return; }

    if (role === "admin" && adminKey !== ADMIN_SECRET_KEY) {
      alert("❌ Invalid Admin Secret Key.\nContact the system administrator if you need access.");
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/signup`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password, role, adminKey })
      });
      const data = await res.json();

      if (res.ok) {
        alert(`✅ ${role.charAt(0).toUpperCase() + role.slice(1)} account created!\nPlease login.`);
        navigate("/login");
      } else {
        alert(data.msg || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Server is not responding. Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  const { role } = formData;
  const isInstructor = role === "instructor";
  const isAdmin      = role === "admin";

  return (
    <>
      <Navbar />
      <div className="signup-wrapper">
        <div className="card signup-card shadow-lg">
          <div className="card-body p-4">

            {/* ── Title ── */}
            <div className="text-center mb-4">
              <h2 className="signup-title">Create Account</h2>
              <p className="text-muted">Join the E-Learning Platform</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" name="name"
                  className="form-control custom-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange} required />
              </div>

              {/* Role */}
              <div className="mb-3">
                <label className="form-label">Select Role</label>
                <select name="role"
                  className="form-select custom-input"
                  value={role}
                  onChange={handleChange}>
                  <option value="student">🎓  Student</option>
                  <option value="instructor">🏫  Instructor</option>
                  <option value="admin">🔐  Admin</option>
                </select>

                {/* Instructor hint */}
                {isInstructor && (
                  <div className="mt-2 p-2 rounded"
                    style={{ background: "#fffbeb", border: "1px solid #f59e0b", fontSize: 13, color: "#92400e" }}>
                    🏫 <strong>Instructor accounts</strong> require an official email ending in{" "}
                    <strong>@{INSTRUCTOR_DOMAIN}</strong> — e.g. <em>yourname@{INSTRUCTOR_DOMAIN}</em>
                  </div>
                )}

                {/* Admin hint */}
                {isAdmin && (
                  <div className="mt-2 p-2 rounded"
                    style={{ background: "#fef2f2", border: "1px solid #ef4444", fontSize: 13, color: "#b91c1c" }}>
                    🔐 <strong>Admin accounts</strong> require an official email ending in{" "}
                    <strong>@{ADMIN_DOMAIN}</strong> AND the admin secret key provided by the system owner.
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input type="email" name="email"
                  className={`form-control custom-input ${emailError ? "is-invalid" : ""}`}
                  placeholder={
                    isInstructor ? `yourname@${INSTRUCTOR_DOMAIN}` :
                    isAdmin      ? `admin@${ADMIN_DOMAIN}` :
                                   "student@example.com"
                  }
                  value={formData.email}
                  onChange={handleChange} required />
                {emailError && (
                  <div style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>⚠️ {emailError}</div>
                )}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" name="password"
                  className="form-control custom-input"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange} required />
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input type="password" name="confirmPassword"
                  className={`form-control custom-input ${passError ? "is-invalid" : ""}`}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange} required />
                {passError && (
                  <div style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>⚠️ {passError}</div>
                )}
              </div>

              {/* Admin Secret Key — only visible when Admin role is selected */}
              {isAdmin && (
                <div className="mb-3 p-3 rounded"
                  style={{ background: "#1a0a0a", border: "1px solid #ef4444" }}>
                  <label className="form-label fw-semibold" style={{ color: "#fca5a5" }}>
                    🔑 Admin Secret Key
                  </label>
                  <div className="input-group">
                    <input
                      type={showAdminKey ? "text" : "password"}
                      className="form-control custom-input"
                      placeholder="Enter the admin secret key"
                      value={adminKey}
                      onChange={e => setAdminKey(e.target.value)}
                      required />
                    <button type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowAdminKey(p => !p)}
                      style={{ borderColor: "rgba(255,255,255,0.2)", color: "#e2e8f0" }}>
                      {showAdminKey ? "🙈 Hide" : "👁️ Show"}
                    </button>
                  </div>
                  <small style={{ color: "#fca5a5", fontSize: 11 }}>
                    This key is provided by the system owner only.
                  </small>
                </div>
              )}

              {/* Submit button — colour changes per role */}
              <button type="submit"
                className="btn w-100 signup-btn mt-2"
                disabled={loading || !!emailError || !!passError}
                style={{
                  background: isAdmin
                    ? "linear-gradient(135deg, #dc2626, #b91c1c)"
                    : isInstructor
                    ? "linear-gradient(135deg, #d97706, #b45309)"
                    : "linear-gradient(135deg, #22c55e, #16a34a)",
                  border: "none", color: "#fff",
                  fontWeight: 700, borderRadius: 12, padding: "10px 0"
                }}>
                {loading
                  ? "Creating Account..."
                  : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-muted">Already have an account?</span>{" "}
              <Link to="/login" className="login-link">Login</Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default SignUp;
