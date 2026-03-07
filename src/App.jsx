import React, { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/admin/Dashboard';
import { supabase } from './lib/supabase';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [branding, setBranding] = useState({
    portalLogo: null,
    loginBackground: null
  });

  React.useEffect(() => {
    const fetchBranding = async () => {
      const { data, error } = await supabase
        .from('portal_settings')
        .select('key, value');

      if (!error && data) {
        const brandingMap = {};
        data.forEach(item => {
          brandingMap[item.key] = item.value;
        });
        setBranding({
          portalLogo: brandingMap.portalLogo || null,
          loginBackground: brandingMap.loginBackground || null
        });
      }
    };
    fetchBranding();
  }, []);

  const handleBrandingUpdate = (key, value) => {
    setBranding(prev => ({ ...prev, [key]: value }));
  };

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} branding={branding} />
      ) : isLoggedIn ? (
        <Dashboard onLogout={handleLogout} branding={branding} onBrandingUpdate={handleBrandingUpdate} />
      ) : (
        <LoginScreen onLogin={handleLogin} branding={branding} />
      )}
    </>
  )
}

export default App;
