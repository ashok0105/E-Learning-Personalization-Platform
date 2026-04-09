import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBookOpen,
  FaDownload,
  FaChartLine,
  FaUser,
  FaShieldAlt,
  FaChalkboardTeacher,
  FaSignOutAlt,
  FaTimes
} from "react-icons/fa";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const role      = localStorage.getItem("userRole");
  const [isOpen, setIsOpen] = useState(true);

  if (!role) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("user");          // ← also clear user key

    /*
     * Fire the custom event so Navbar re-reads localStorage and clears
     * the displayed username immediately — no AuthContext needed.
     */
    window.dispatchEvent(new Event("auth-change"));

    navigate("/login");
  };

  const studentMenu = [
    { icon: <FaTachometerAlt />, label: "Dashboard",     path: "/dashboard"     },
    { icon: <FaBookOpen />,      label: "Courses",        path: "/courses"       },
    { icon: <FaBookOpen />,      label: "My Courses",     path: "/my-courses"    },
    { icon: <FaDownload />,      label: "Offline Notes",  path: "/offline-notes" },
    { icon: <FaChartLine />,     label: "Progress",       path: "/progress"      },
    { icon: <FaUser />,          label: "Profile",        path: "/profile"       }
  ];

  const instructorMenu = [
    { icon: <FaTachometerAlt />,      label: "Dashboard",       path: "/dashboard"  },
    { icon: <FaBookOpen />,           label: "Courses",          path: "/courses"    },
    { icon: <FaChalkboardTeacher />,  label: "Instructor Panel", path: "/instructor" }
  ];

  const adminMenu = [
    { icon: <FaShieldAlt />, label: "Admin Panel", path: "/admin" }
  ];

  let menuItems = [];
  if (role === "student")    menuItems = studentMenu;
  if (role === "instructor") menuItems = instructorMenu;
  if (role === "admin")      menuItems = adminMenu;

  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <button
          className="btn-collapse"
          onClick={() => setIsOpen(!isOpen)}
          title="Toggle Sidebar"
        >
          <FaTimes />
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? "active-link" : ""}`}
              title={item.label}
            >
              <span className="icon">{item.icon}</span>
              {isOpen && <span className="label">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2"
          title="Sign Out"
        >
          <FaSignOutAlt />
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;