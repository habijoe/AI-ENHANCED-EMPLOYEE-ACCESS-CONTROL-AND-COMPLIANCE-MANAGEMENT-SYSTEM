// AuthContext.jsx - Updated
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext();
const BASE_URL = "http://127.0.0.1:8000";

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  // Helper function to map API user to app user
  const mapApiUserToAppUser = (apiUser) => {
    if (!apiUser) return null;
    
    return {
      id: apiUser.id?.toString() || '',
      name: apiUser.name || apiUser.full_name || '',
      full_name: apiUser.full_name || '',
      email: apiUser.email || apiUser.work_mail_address || '',
      work_mail_address: apiUser.work_mail_address || '',
      role: apiUser.role || 'employee',
      department: apiUser.department || '',
      phone_number: apiUser.phone_number || '',
      avatar: apiUser.avatar,
      is_admin: apiUser.is_admin,
    };
  };

  // Verify token with backend
  const verifyToken = async (accessToken) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/verify-token/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { valid: true, user: data.user };
      }
      return { valid: false };
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false };
    }
  };

  // Initial load effect
  useEffect(() => {
    if (hasInitialized.current) return;
    
    const initializeAuth = async () => {
      console.log("=== AuthContext: Initializing ===");
      
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('access_token');

        if (storedUser && accessToken) {
          // Verify token with backend
          const { valid, user: verifiedUser } = await verifyToken(accessToken);

          if (valid && verifiedUser) {
            console.log("Token valid, user authenticated");
            const mappedUser = mapApiUserToAppUser(verifiedUser);
            setUserState(mappedUser);
          } else {
            // Token invalid, clear everything
            console.log("Token invalid, clearing auth data");
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        } else {
          console.log("No stored auth data");
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setIsLoading(false);
        hasInitialized.current = true;
        console.log("=== AuthContext: Initialization Complete ===");
      }
    };

    initializeAuth();
  }, []);

  // Set auth tokens
  const setAuthTokens = (tokens) => {
    if (tokens && tokens.access && tokens.refresh) {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      console.log("Tokens saved to localStorage");
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      console.log("Tokens removed from localStorage");
    }
  };

  // Update user function
  const setUser = (newUser) => {
    console.log("=== AuthContext: setUser called ===");
    
    const mappedUser = mapApiUserToAppUser(newUser);
    setUserState(mappedUser);
    
    if (mappedUser) {
      localStorage.setItem('user', JSON.stringify(mappedUser));
      console.log("User saved to localStorage");
    } else {
      localStorage.removeItem('user');
      console.log("User removed from localStorage");
    }
  };

  // Complete login function
  const completeLogin = (data) => {
    console.log("=== AuthContext: completeLogin ===");
    
    // Store tokens
    if (data.tokens) {
      setAuthTokens(data.tokens);
    }
    
    // Store user data
    if (data.user) {
      const mappedUser = mapApiUserToAppUser(data.user);
      setUserState(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
    }
  };

  // Check authentication status
  const checkAuth = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return false;
    
    const { valid } = await verifyToken(accessToken);
    return valid;
  };

  // Logout function
  const logout = async () => {
    console.log("=== AuthContext: Logout ===");
    
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const accessToken = localStorage.getItem('access_token');
      
      // Call backend logout endpoint
      if (refreshToken && accessToken) {
        await fetch(`${BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken
          }),
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    // Clear all auth data
    setUserState(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Note: Navigation is handled by the component using useNavigate()
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    setAuthTokens,
    completeLogin,
    checkAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};