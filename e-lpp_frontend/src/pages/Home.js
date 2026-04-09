import { Link } from "react-router-dom";
import "../styles/homepage.css";
import Navbar from "../components/Navbar";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const features = [
  {
    icon: "bi-fire",
    title: "Study Streaks",
    description:
      "Maintain daily learning streaks by completing quizzes with 60%+ scores",
  },
  {
    icon: "bi-book",
    title: "Personalized Courses",
    description:
      "Get course recommendations tailored to your learning preferences",
  },
  {
    icon: "bi-download",
    title: "Offline Learning",
    description:
      "Download course materials and access them anytime, anywhere",
  },
  {
    icon: "bi-graph-up",
    title: "Progress Tracking",
    description:
      "Monitor your learning progress with detailed analytics and insights",
  },
  {
    icon: "bi-award",
    title: "Interactive Quizzes",
    description:
      "Test your knowledge with engaging quizzes and immediate feedback",
  },
  {
    icon: "bi-people",
    title: "Expert Instructors",
    description:
      "Learn from experienced instructors across various domains",
  },
];

function Home() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <>
      <Navbar />

      <div className="home">

        <section className="home-hero text-center">
          <div className="floating-shape shape1"></div>
          <div className="floating-shape shape2"></div>

          <div className="container position-relative">
            <h1 className="hero-title" data-aos="fade-up">
              E-Learning Personalization Platform
            </h1>

            <p className="hero-subtitle" data-aos="fade-up" data-aos-delay="200">
              Transform your learning journey with personalized course
              recommendations, study streaks, offline access, and progress tracking.
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

        <section className="features-section">
          <div className="container">
            <h2 className="section-title text-center" data-aos="fade-up">
              Why Choose Our Platform?
            </h2>

            <div className="row g-4">
              {features.map((feature, index) => (
                <div
                  className="col-md-6 col-lg-4"
                  key={index}
                  data-aos="zoom-in"
                  data-aos-delay={index * 100}
                >
                  <div className="feature-card glass-card">
                    <div className="icon-box">
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

        <section className="cta-section">
          <div className="container">
            <div className="cta-card text-center" data-aos="zoom-in">
              <h2>Ready to Start Your Learning Journey?</h2>
              <p>
                Join thousands of students already learning on our platform
              </p>
              <Link to="/signup" className="btn btn-light btn-lg px-4">
                Sign Up Now
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

export default Home;
