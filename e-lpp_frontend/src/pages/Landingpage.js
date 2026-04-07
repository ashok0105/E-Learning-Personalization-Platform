import { Link } from "react-router-dom";
import "../styles/landingpage.css";
import Navbar from "../components/Navbar";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

export default function Landingpage() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const features = [
    {
      icon: "bi-book",
      title: "Personalized Learning",
      description:
        "Get course recommendations tailored to your learning style and goals",
    },
    {
      icon: "bi-download",
      title: "Offline Access",
      description:
        "Download notes and PDFs to study anytime, anywhere without internet",
    },
    {
      icon: "bi-fire",
      title: "Study Streaks",
      description:
        "Stay motivated with learning streaks based on quiz performance",
    },
    {
      icon: "bi-graph-up",
      title: "Progress Tracking",
      description:
        "Monitor your learning journey with detailed progress analytics",
    },
  ];

  return (
    <>
      <Navbar />

      <div className="landing-page">

        {/* HERO SECTION */}
        <section className="hero-section text-center">
          <div className="floating-shape shape1"></div>
          <div className="floating-shape shape2"></div>
          <div className="floating-shape shape3"></div>

          <div className="container position-relative">
            <i className="bi bi-mortarboard hero-icon"></i>

            <h1 className="hero-title" data-aos="fade-up">
              E-Learning Personalization Platform
            </h1>

            <p
              className="hero-subtitle"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Transform your learning experience with personalized courses,
              offline access, and motivation through study streaks
            </p>

            <div
              className="d-flex justify-content-center gap-3 flex-wrap"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <Link to="/signup" className="btn btn-light btn-lg px-4">
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                Login
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-section">
          <div className="container">
            <h2 className="section-title text-center" data-aos="fade-up">
              Key Features
            </h2>

            <div className="row g-4">
              {features.map((feature, index) => (
                <div
                  className="col-md-6 col-lg-3"
                  key={index}
                  data-aos="zoom-in"
                  data-aos-delay={index * 100}
                >
                  <div className="feature-card glass-card text-center">
                    <div className="icon-circle">
                      <i className={`bi ${feature.icon}`}></i>
                    </div>
                    <h5>{feature.title}</h5>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-it-works">
          <div className="container">
            <h2 className="section-title text-center" data-aos="fade-up">
              How It Works
            </h2>

            <div className="row g-4">
              <div className="col-md-4 text-center" data-aos="fade-up">
                <div className="step-circle">1</div>
                <h5>Sign Up</h5>
                <p>Create your account as a student or instructor</p>
              </div>

              <div
                className="col-md-4 text-center"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <div className="step-circle">2</div>
                <h5>Choose Courses</h5>
                <p>Browse and enroll in courses that match your interests</p>
              </div>

              <div
                className="col-md-4 text-center"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                <div className="step-circle">3</div>
                <h5>Start Learning</h5>
                <p>
                  Watch videos, download notes, take quizzes, and build your
                  streak
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="container text-center">
            <div className="cta-box" data-aos="zoom-in">
              <h2>Ready to Start Your Learning Journey?</h2>
              <p>
                Join thousands of students already learning with our platform
              </p>
              <Link to="/signup" className="btn btn-light btn-lg px-4">
                Sign Up Now – It's Free
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
