import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar  from './components/Navbar';
import Footer  from './components/Footer';

import Home            from './pages/Home';
import Login           from './pages/Login';
import Register        from './pages/Register';
import LawyerList      from './pages/LawyerList';
import LawyerDetail    from './pages/LawyerDetail';
import BookAppointment from './pages/BookAppointment';
import CitizenDashboard from './pages/CitizenDashboard';
import LawyerDashboard  from './pages/LawyerDashboard';
import AdminDashboard   from './pages/AdminDashboard';
import Profile          from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/lawyers"      element={<LawyerList />} />
            <Route path="/lawyers/:id"  element={<LawyerDetail />} />

            <Route path="/book/:lawyerId" element={
              <ProtectedRoute roles={['CITIZEN']}>
                <BookAppointment />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['CITIZEN']}>
                <CitizenDashboard />
              </ProtectedRoute>
            } />
            <Route path="/lawyer" element={
              <ProtectedRoute roles={['LAWYER']}>
                <LawyerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="*" element={
              <div className="page-container" style={{ textAlign: 'center', paddingTop: '8rem' }}>
                <h1 style={{ fontSize: '6rem' }}>404</h1>
                <p>Page not found</p>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
