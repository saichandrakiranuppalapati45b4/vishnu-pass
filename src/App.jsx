import React, { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/admin/Dashboard';
import StudentDashboard from './components/student/StudentDashboard';
import GuardDashboard from './components/guard/GuardDashboard';
import { supabase } from './lib/supabase';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';

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
        const metadataRole = user.user_metadata?.role;
        let finalRole = metadataRole;
        let finalData = null;

        // 1. Check Admin
        if (finalRole === 'admin' || !finalRole) {
          const { data: adminData } = await supabase
            .from('admins')
            .select('*')
            .eq('email', user.email)
            .single();

          if (adminData) {
            finalRole = 'admin';
            finalData = adminData;
          }
        }

        // 2. Check Student
        if (!finalData && (finalRole === 'student' || !finalRole)) {
          const { data: studentData } = await supabase
            .from('students')
            .select('*, departments(name)')
            .eq('email', user.email)
            .single();

          if (studentData) {
            if (studentData.status === 'Approved') {
              // Automatically transition back to Active if they were approved
              await supabase
                .from('students')
                .update({ 
                  status: 'Active',
                  login_requested_at: null
                })
                .eq('id', studentData.id);
              finalRole = 'student';
              finalData = { ...studentData, status: 'Active' };
            } else if (studentData.status === 'Active') {
              // Already active, allow session restoration
              finalRole = 'student';
              finalData = studentData;
            } else {
              // Pending or Logged Out - force logout
              await supabase.auth.signOut();
              setIsAuthLoading(false);
              return;
            }
          }
        }

        // 3. Check Guard
        if (!finalData && (finalRole === 'guard' || !finalRole)) {
          const { data: guardData } = await supabase
            .from('guards')
            .select('*, guard_gates(name), guard_shifts(name)')
            .eq('email', user.email)
            .single();

          if (guardData) {
            finalRole = 'guard';
            finalData = guardData;
          }
        }

        if (finalData && mounted) {
          setUserRole(finalRole);
          setUserData(finalData);
          setIsLoggedIn(true);
          setIsAuthLoading(false);
          return;
        }

        // If no record found in any table
        await supabase.auth.signOut();
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

  const handleSplashFinish = React.useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleLogout = async () => {
    if (userRole === 'student' && userData?.id) {
      try {
        await supabase
          .from('students')
          .update({ 
            status: 'Logged Out',
            login_requested_at: null 
          })
          .eq('id', userData.id);
      } catch (err) {
        console.error("Error resetting student status on logout:", err);
      }
    }

    await supabase.auth.signOut();
    setUserRole(null);
    setUserData(null);
    setIsLoggedIn(false);
  };

  return (
    <LanguageProvider>
      <NotificationProvider>
        {showSplash ? (
          <SplashScreen onFinish={handleSplashFinish} branding={branding} />
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
      </NotificationProvider>
    </LanguageProvider>
  )
}

export default App;
