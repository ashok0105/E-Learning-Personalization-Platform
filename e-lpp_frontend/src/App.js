import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import MyCourse from "./pages/MyCourse";
import CourseDetails from "./pages/CourseDetails";
import Quiz from "./pages/Quiz";
import OfflineNotes from "./pages/OfflineNotes";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ProgressPage from "./pages/ProgressPage";
import ProfilePage from "./pages/ProfilePage";
import Admin from "./pages/Admin";
import CertificatePage from "./pages/CertificatePage";
import Instructor from "./pages/Instructor";
//import Contact from "./pages/Contact";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected / App pages */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />

        <Route
          path="/courses"
          element={
            <MainLayout>
              <Courses />
            </MainLayout>
          }
        />

        <Route path="/my-courses" 
        element={
          <MainLayout>
        <MyCourse />
        </MainLayout>
        } 
        />

         <Route path="/courses/:id" 
         element={
           <MainLayout>
         <CourseDetails />
         </MainLayout>
         } 
         />

        <Route
          path="/quiz"
          element={
            <MainLayout>
              <Quiz />
            </MainLayout>
          }
        />

        <Route
          path="/offline-notes"
          element={
            <MainLayout>
              <OfflineNotes />
            </MainLayout>
          }
        />
        <Route
          path="/progress"
          element={
            <MainLayout>
              <ProgressPage />
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <ProfilePage/>
            </MainLayout>
          }
        />
         <Route
          path="/admin"
          element={
            <MainLayout>
              <Admin/>
            </MainLayout>
          }
        />
        <Route path="/certificate" 
        element={
          <MainLayout>
        <CertificatePage />
        </MainLayout>
        } 
        />

        <Route
          path="/instructor"
          element={
            <MainLayout>
              <Instructor />
            </MainLayout>
          }
        />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
