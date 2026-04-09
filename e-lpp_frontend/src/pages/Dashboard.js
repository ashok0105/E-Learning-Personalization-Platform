import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ProgressBar,
  Button,
  Badge
} from "react-bootstrap";
import {
  FaChartLine,
  FaBookOpen,
  FaLaptopCode,
  FaCertificate,
  FaChevronRight
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";

const BASE_URL = "https://e-learning-personalization-platform-8.onrender.com";

const Dashboard = () => {
  const [stats, setStats] = useState({
    enrolledCount: 0,
    avgProgress: 0,
    certificatesEarned: 0,
    recentCourses: []
  });
  const [loading, setLoading] = useState(true);

  // Get user from localStorage
  const getUserData = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || { name: "Student" };
    } catch {
      return { name: "Student" };
    }
  };
  const user = getUserData();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const learningStats = [
    {
      title: "Enrolled Courses",
      value: loading ? "..." : stats.enrolledCount,
      icon: <FaBookOpen />,
      color: "primary"
    },
    {
      title: "Avg. Progress",
      value: loading ? "..." : `${stats.avgProgress}%`,
      icon: <FaLaptopCode />,
      color: "success"
    },
    {
      title: "Certificates",
      value: loading ? "..." : stats.certificatesEarned,
      icon: <FaCertificate />,
      color: "warning"
    }
  ];

  return (
    <div className="dashboard-wrapper">
      <Container fluid className="dashboard-container">
        {/* Header Section */}
        <Row className="dashboard-header mb-4">
          <Col>
            <div className="header-content">
              <h1 className="dashboard-title">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="dashboard-subtitle text-muted">
                Track your progress and continue your learning journey
              </p>
            </div>
          </Col>
        </Row>

        {/* Learning Stats */}
        <Row className="learning-stats mb-4">
          {learningStats.map((stat, index) => (
            <Col key={index} md={4}>
              <Card className="stat-card shadow-sm border-0">
                <Card.Body className="d-flex align-items-center">
                  <div className={`stat-icon bg-${stat.color}-soft text-${stat.color} me-3`}>
                    {stat.icon}
                  </div>
                  <div>
                    <h6 className="stat-title text-muted mb-1">{stat.title}</h6>
                    <h4 className={`stat-value text-${stat.color}`}>{stat.value}</h4>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Main Dashboard Content */}
        <Row>
          {/* Recent Courses */}
          <Col lg={8}>
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">My Current Courses</h5>
                  <Link to="/my-courses">
                    <Button variant="outline-primary" size="sm">
                      View All <FaChevronRight />
                    </Button>
                  </Link>
                </div>

                {loading ? (
                  <p className="text-muted">Loading your courses...</p>
                ) : stats.recentCourses.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted mb-3">You haven't enrolled in any courses yet.</p>
                    <Link to="/courses">
                      <Button variant="primary">Browse Courses</Button>
                    </Link>
                  </div>
                ) : (
                  stats.recentCourses.map((course, index) => (
                    <div key={index} className="course-progress-item mb-3 p-3 rounded">
                      <div className="d-flex justify-content-between mb-2">
                        <h6 className="mb-0">{course.title}</h6>
                        <span className="text-muted small">
                          {course.progress}% Complete
                        </span>
                      </div>
                      <div className="d-flex align-items-center">
                        <ProgressBar
                          now={course.progress}
                          className="flex-grow-1 me-3"
                          variant="primary"
                        />
                        <Badge bg="secondary">{course.category || "General"}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Links */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="card-title mb-3">Quick Actions</h5>
                <div className="d-grid gap-2">
                  <Link to="/courses">
                    <Button variant="outline-primary" className="w-100 text-start">
                      <FaChartLine className="me-2" /> Browse All Courses
                    </Button>
                  </Link>
                  <Link to="/my-courses">
                    <Button variant="outline-success" className="w-100 text-start">
                      <FaBookOpen className="me-2" /> My Enrolled Courses
                    </Button>
                  </Link>
                  <Link to="/quiz">
                    <Button variant="outline-warning" className="w-100 text-start">
                      <FaLaptopCode className="me-2" /> Take a Quiz
                    </Button>
                  </Link>
                  <Link to="/certificate">
                    <Button variant="outline-info" className="w-100 text-start">
                      <FaCertificate className="me-2" /> My Certificates
                    </Button>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
