import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <Sidebar />

      <main
        style={{
          marginLeft: "250px",   // sidebar width
          marginTop: "64px",     // navbar height
          padding: "24px",
          minHeight: "100vh",
          background: "#f9fafb"
        }}
      >
        {children}
      </main>
    </>
  );
}

export default MainLayout;

