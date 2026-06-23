import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SeasonPage from './pages/SeasonPage';
import WatchPage from './pages/WatchPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, authLoading } = useStore();
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--night)' }}>
      <div
        className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'var(--water-light)', borderTopColor: 'transparent' }}
      />
    </div>
  );
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
};

function App() {
  const { authLoading } = useStore();
  if (authLoading) return null;

  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans" style={{ background: 'var(--night)', color: 'var(--parchment)' }}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          <Route
            path="/watch/:seasonNumber/:episodeNumber"
            element={<ProtectedRoute><WatchPage /></ProtectedRoute>}
          />

          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Navbar />
                <div className="flex-1 w-full flex flex-col">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/season/:seasonNumber" element={<SeasonPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/:username" element={<ProfilePage />} />
                  </Routes>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;