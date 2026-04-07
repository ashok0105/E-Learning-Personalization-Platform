import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function CertificatePage() {
  const { state } = useLocation();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserName(parsedUser.name);
    }
  }, []);

  const downloadPDF = () => {
    const input = document.getElementById("certificate");

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");

      pdf.addImage(imgData, "PNG", 10, 10, 277, 190);
      pdf.save("certificate.pdf");
    });
  };

  return (
    <div className="container text-center my-5">
      <div
        id="certificate"
        style={{
          padding: "40px",
          border: "10px solid #0d6efd",
          borderRadius: "15px",
          background: "#f8f9fa"
        }}
      >
        <h1 style={{ color: "#0d6efd" }}>
          Certificate of Completion
        </h1>

        <h4 className="mt-4">This certifies that</h4>

        <h2 className="fw-bold mt-2">
          {userName}
        </h2>

        <p className="mt-3">
          has successfully completed the course
        </p>

        <h4 className="fw-bold">
          {state?.course || "Course Name"}
        </h4>

        <p className="mt-3">
          with a score of <strong>{state?.percentage || 0}%</strong>
        </p>

        <p>
          Date: {state?.date || new Date().toLocaleDateString()}
        </p>
      </div>

      <button
        className="btn btn-primary mt-4"
        onClick={downloadPDF}
      >
        Download PDF Certificate
      </button>
    </div>
  );
}
