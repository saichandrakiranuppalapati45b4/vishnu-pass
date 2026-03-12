import React, { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/admin/Dashboard';
import StudentDashboard from './components/student/StudentDashboard';
import GuardDashboard from './components/guard/GuardDashboard';
import { supabase } from './lib/supabase';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'student' | 'guard'
  const [userData, setUserData] = useState(null);
  const [branding, setBranding] = useState({
    portalLogo: null,
    loginBackground: null,
    adminName: 'Admin User'
  });

  React.useEffect(() => {
    let mounted = true;

    const fetchBranding = async () => {
      const { data, error } = await supabase
        .from('portal_settings')
        .select('key, value');

      if (!error && data && mounted) {
        const brandingMap = {};
        data.forEach(item => {
          brandingMap[item.key] = item.value;
        });
        setBranding({
          portalLogo: brandingMap.portalLogo || null,
          loginBackground: brandingMap.loginBackground || null,
          adminName: brandingMap.adminName || 'Admin User'
        });
      }
    };

    const handleSession = async (user) => {
      if (!user || !user.email) return;

      try {
        // Check admin
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('email', user.email)
          .single();

        if (adminData && mounted) {
          setUserRole('admin');
          setUserData(adminData);
          setIsLoggedIn(true);
          setIsAuthLoading(false);
          return;
        }

        // Check student
        const { data: studentData } = await supabase
          .from('students')
          .select('*, departments(name)')
          .eq('email', user.email)
          .single();

        if (studentData && mounted) {
          setUserRole('student');
          setUserData(studentData);
          setIsLoggedIn(true);
          setIsAuthLoading(false);
          return;
        }

        // Check guard
        const { data: guardData } = await supabase
          .from('guards')
          .select('*, guard_gates(name), guard_shifts(name)')
          .eq('email', user.email)
          .single();

        if (guardData && mounted) {
          setUserRole('guard');
          setUserData(guardData);
          setIsLoggedIn(true);
          setIsAuthLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error resolving user role:", error);
      }

      if (mounted) setIsAuthLoading(false);
    };

    const initializeSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          handleSession(session.user);
        } else if (mounted) {
          setIsAuthLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setIsAuthLoading(false);
      }
    };

    fetchBranding();
    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' && mounted) {
        setUserRole(null);
        setUserData(null);
        setIsLoggedIn(false);
      } else if (event === 'SIGNED_IN' && session?.user && mounted) {
        // Only handle dynamically if we aren't already initialized
        // LoginScreen handles interactive login state directly.
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleBrandingUpdate = (key, value) => {
    setBranding(prev => ({ ...prev, [key]: value }));
  };

  const handleLogin = (role, data) => {
    setUserRole(role);
    setUserData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    setUserData(null);
    setIsLoggedIn(false);
  };

  return (
    <>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} branding={branding} />
      ) : isAuthLoading ? (
        <div className="flex items-center justify-center min-h-screen bg-[#f9fafb]">
          <div className="w-10 h-10 border-4 border-[#f47c20] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : isLoggedIn ? (
        userRole === 'admin' ? (
          <Dashboard onLogout={handleLogout} branding={branding} onBrandingUpdate={handleBrandingUpdate} adminData={userData} />
        ) : userRole === 'guard' ? (
          <GuardDashboard onLogout={handleLogout} guardData={userData} />
        ) : (
          <StudentDashboard onLogout={handleLogout} studentData={userData} />
        )
      ) : (
        <LoginScreen onLogin={handleLogin} branding={branding} />
      )}
    </>
  )
}

export default App;
