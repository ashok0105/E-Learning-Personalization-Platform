import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Card } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";   // npm install @react-oauth/google
import Navbar from "../components/Navbar";
import "../styles/login.css";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Login() {
  const [formData,  setFormData]  = useState({ email: "", password: "" });
  const [errors,    setErrors]    = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ── Shared post-login handler (email or Google) ──────────────────────────
  const handleLoginSuccess = (data) => {
    localStorage.setItem("token",    data.token);
    localStorage.setItem("userRole", data.user.role);
    localStorage.setItem("user",     JSON.stringify(data.user));
    window.dispatchEvent(new Event("auth-change"));
    navigate("/dashboard");
  };

  // ── Email / password login ────────────────────────────────────────────────
  const validateForm = () => {
    const e = {};
    if (!formData.email)    e.email    = "Email is required";
    if (!formData.password) e.password = "Password is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      e.email = "Email is invalid";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        handleLoginSuccess(data);
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google login ──────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/google`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await response.json();
      if (response.ok) {
        handleLoginSuccess(data);
      } else {
        alert(data.message || "Google login failed");
      }
    } catch (err) {
      console.error("Google login error:", err);
      alert("Server error during Google login.");
    }
  };

  return (
    <>
      <Navbar />
      <Container fluid className="login-wrapper">
        <Card className="login-card shadow-lg">
          <Card.Body>
            <h3 className="text-center fw-bold mb-2">Welcome Back</h3>
            <p className="text-center text-muted mb-4">
              Login to continue your learning journey
            </p>

            {/* ── Google Sign-In button ── */}
            <div className="d-flex justify-content-center mb-3">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert("Google Sign-In failed. Please try again.")}
                useOneTap
                theme="filled_black"
                shape="pill"
                text="signin_with"
                size="large"
              />
            </div>

            <div className="divider-text text-center text-muted mb-3">
              <span>or sign in with email</span>
            </div>

            {/* ── Email / password form ── */}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  className="form-control-enhanced"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  className="form-control-enhanced"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <button
                type="submit"
                className="btn btn-gradient w-100 login-btn"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </Form>

            <div className="text-center mt-4">
              <span className="text-muted">Don't have an account? </span>
              <Link to="/signup" className="fw-semibold text-decoration-none">
                Sign Up
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default Login;