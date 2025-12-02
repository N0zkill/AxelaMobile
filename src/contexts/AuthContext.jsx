import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  // Mock authentication state for development
  const mockAuthState = {
    isAuthenticated: true,
    user: { id: 'mock-user-id', email: 'mock@example.com' },
    profile: { id: 'mock-profile-id', username: 'Mock User' },
    isLoading: false,
    session: { user: { id: 'mock-user-id' } }
  };

  // Mock authentication functions
  const signIn = async () => {
    console.log('Mock sign in');
    return { user: mockAuthState.user };
  };

  const signUp = async () => {
    console.log('Mock sign up');
    return { user: mockAuthState.user };
  };

  const signOut = async () => {
    console.log('Mock sign out');
  };

  const signInWithGoogle = async () => {
    console.log('Mock Google sign in');
    return { user: mockAuthState.user };
  };

  const signInWithGithub = async () => {
    console.log('Mock GitHub sign in');
    return { user: mockAuthState.user };
  };

  const value = {
    ...mockAuthState,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGithub
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
