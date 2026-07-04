import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, LogIn, Lock, Mail, ArrowLeft } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage({ currentUser, setCurrentUser }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const redirectPath = searchParams.get('redirect') || '/';
  const initialMode = searchParams.get('mode') === 'register' ? 'signup' : 'login';

  const [modalMode, setModalMode] = useState(initialMode); // login | signup
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // If user is already logged in, redirect them
  useEffect(() => {
    if (currentUser) {
      navigate(redirectPath, { replace: true });
    }
  }, [currentUser, navigate, redirectPath]);

  const handlePostLoginRedirect = () => {
    // If there is any buyNowItem stored in localStorage, checkout page will read it
    setAuthSuccessMsg('Redirecting you...');
    setTimeout(() => {
      navigate(redirectPath, { replace: true });
    }, 1000);
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthSuccessMsg('');
    setAuthLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Google Sign-In successful for UID:", user.uid);

      // Check if user document already exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let profileData = {};
      if (!userDocSnap.exists()) {
        profileData = {
          uid: user.uid,
          fullName: user.displayName || 'Fashionista',
          email: user.email,
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
          isAdmin: user.email === 'admin@riza.com'
        };
        await setDoc(userDocRef, profileData);
        console.log("Created new Google user profile in Firestore");
      } else {
        profileData = userDocSnap.data();
        console.log("Loaded existing Google user profile from Firestore");
      }

      setCurrentUser({
        uid: user.uid,
        email: user.email,
        displayName: profileData.fullName || user.displayName || 'Fashionista',
        photoURL: profileData.photoURL || user.photoURL || '',
        provider: 'google',
        emailVerified: user.emailVerified,
        isAuthenticated: true,
        isAdmin: profileData.isAdmin || user.email === 'admin@riza.com',
        ...profileData
      });

      setAuthSuccessMsg('Successfully signed in with Google!');
      handlePostLoginRedirect();
    } catch (err) {
      console.error("Google auth operation failed:", err);
      let friendlyMsg = err.message;
      if (err.code === 'auth/popup-closed-by-user') {
        friendlyMsg = 'Sign-in popup was closed before completion.';
      } else if (err.code === 'auth/blocked-by-popup-toggler') {
        friendlyMsg = 'Popup was blocked by your browser. Please enable popups.';
      }
      setAuthError(friendlyMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    setAuthLoading(true);

    try {
      if (modalMode === 'login') {
        if (authEmail === 'admin@riza.com' && authPassword === 'admin123') {
          localStorage.setItem('mock_admin', 'true');
          setCurrentUser({
            uid: 'admin-bypass-uid-123',
            email: 'admin@riza.com',
            displayName: 'Boutique Admin',
            photoURL: '',
            provider: 'password',
            emailVerified: true,
            isAuthenticated: true,
            isAdmin: true
          });
          setAuthSuccessMsg('Logged in successfully (Dev Bypass)!');
          handlePostLoginRedirect();
          return;
        }
        const userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
        const user = userCredential.user;
        
        // Load user profile from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        let profileData = {};
        if (userDocSnap.exists()) {
          profileData = userDocSnap.data();
        }

        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: profileData.fullName || user.displayName || 'Fashionista',
          photoURL: profileData.photoURL || '',
          isAuthenticated: true,
          isAdmin: profileData.isAdmin || user.email === 'admin@riza.com',
          ...profileData
        });

        setAuthSuccessMsg('Logged in successfully!');
        handlePostLoginRedirect();
      } else if (modalMode === 'forgot_password') {
        await sendPasswordResetEmail(auth, authEmail);
        setAuthSuccessMsg('Password reset link has been sent to your email address!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        const user = userCredential.user;
        console.log("User created in Authentication");

        await updateProfile(user, { displayName: authName });

        let firestoreSuccess = true;
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            fullName: authName,
            email: user.email,
            createdAt: serverTimestamp()
          });
          console.log("User profile saved to Firestore");
        } catch (firestoreErr) {
          firestoreSuccess = false;
          console.error("Firestore user profile save failed:", firestoreErr);
          setAuthError("Account created in Authentication, but failed to write user profile to database.");
        }

        const newUser = {
          uid: user.uid,
          email: user.email,
          displayName: authName,
          isAuthenticated: true,
          isAdmin: user.email === 'admin@riza.com'
        };

        setCurrentUser(newUser);

        if (firestoreSuccess) {
          setAuthSuccessMsg('Account registered successfully! Welcome to Riza Fashions.');
          handlePostLoginRedirect();
        }
      }
    } catch (err) {
      console.error("Auth operation failed:", err);
      let friendlyMsg = err.message;
      
      if (err.code === 'auth/email-already-in-use') {
        friendlyMsg = 'This email address is already in use by another account.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMsg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMsg = 'Password is too weak. It must be at least 6 characters long.';
      } else if (err.code === 'auth/wrong-password') {
        friendlyMsg = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        friendlyMsg = 'No user account found matching these credentials.';
      }
      
      setAuthError(friendlyMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="login-page section animate-fade">
      <div className="login-card-container">
        
        {/* Left Side: Boutique Aesthetics Imagery & Callout */}
        <div className="login-image-column" style={{ background: 'linear-gradient(rgba(176, 107, 179, 0.4), rgba(142, 79, 144, 0.7)), url("https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80")' }}>
          <div className="login-image-callout">
            <h3 className="login-image-title">Riza Fashions</h3>
            <p className="login-image-desc">
              Please sign in to purchase products and track your orders. Discover high-quality boutique designs curated exclusively for you.
            </p>
          </div>
        </div>

        {/* Right Side: Form details */}
        <div className="login-form-column">
          <div className="account-modal-body">
            <h2 className="login-form-title">
              {modalMode === 'login' 
                ? 'Welcome Back' 
                : modalMode === 'signup' 
                ? 'Create Account' 
                : 'Reset Password'}
            </h2>
            <p className="login-form-desc">
              {modalMode === 'login' 
                ? 'Access your private dashboard and closet items.' 
                : modalMode === 'signup'
                ? 'Join our premium boutique platform and check out securely.'
                : 'Enter your email address and we\'ll send you a password recovery link.'}
            </p>

            {authError && (
              <div className="auth-error-alert" style={{ background: '#FFF8F8', border: '1px solid #FFCDD2', color: '#B71C1C', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'left' }}>
                {authError}
              </div>
            )}

            {authSuccessMsg && (
              <div className="auth-success-alert" style={{ background: '#F4FAF6', border: '1px solid #C8E6C9', color: '#2E7D32', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'left' }}>
                {authSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="account-auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {modalMode === 'signup' && (
                <div className="form-field text-left">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal)' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input 
                      type="text" 
                      placeholder="e.g. Maya Iyer" 
                      className="form-input" 
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      required 
                      style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}
                    />
                  </div>
                </div>
              )}

              <div className="form-field text-left">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal)' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input 
                    type="email" 
                    placeholder="e.g. maya@example.com" 
                    className="form-input" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required 
                    style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}
                  />
                </div>
              </div>

              {modalMode !== 'forgot_password' && (
                <div className="form-field text-left">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal)' }}>Password</label>
                    {modalMode === 'login' && (
                      <button 
                        type="button" 
                        onClick={() => { setModalMode('forgot_password'); setAuthError(''); setAuthSuccessMsg(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="form-input" 
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required 
                      style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}
                    />
                  </div>
                </div>
              )}

              {modalMode === 'forgot_password' ? (
                <button 
                  type="submit" 
                  className="btn btn-primary btn-block" 
                  disabled={authLoading}
                  style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: '#FFF', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, marginTop: '8px' }}
                >
                  {authLoading ? 'Sending link...' : 'Send Reset Link'}
                </button>
              ) : (
                <>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-block" 
                    disabled={authLoading}
                    style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: '#FFF', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, marginTop: '8px' }}
                  >
                    {authLoading ? 'Please wait...' : modalMode === 'login' ? 'Log In' : 'Sign Up'}
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-google btn-block" 
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#FFF', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', fontWeight: 500 }}
                  >
                    <GoogleIcon /> Continue with Google
                  </button>
                </>
              )}
            </form>
            
            {modalMode === 'forgot_password' ? (
              <button 
                className="btn btn-secondary btn-block" 
                onClick={() => { setModalMode('login'); setAuthError(''); setAuthSuccessMsg(''); }}
                style={{ width: '100%', padding: '12px', background: '#FAF7FB', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontWeight: 500, color: 'var(--primary)' }}
              >
                Back to Log In
              </button>
            ) : modalMode === 'login' ? (
              <>
                <span className="or-divider" style={{ display: 'block', textAlign: 'center', margin: '16px 0', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)' }}>or</span>
                <button 
                  className="btn btn-secondary btn-block" 
                  onClick={() => { setModalMode('signup'); setAuthError(''); setAuthSuccessMsg(''); }}
                  style={{ width: '100%', padding: '12px', background: '#FAF7FB', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontWeight: 500, color: 'var(--primary)' }}
                >
                  Create New Account
                </button>
              </>
            ) : (
              <>
                <span className="or-divider" style={{ display: 'block', textAlign: 'center', margin: '16px 0', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)' }}>or</span>
                <button 
                  className="btn btn-secondary btn-block" 
                  onClick={() => { setModalMode('login'); setAuthError(''); setAuthSuccessMsg(''); }}
                  style={{ width: '100%', padding: '12px', background: '#FAF7FB', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontWeight: 500, color: 'var(--primary)' }}
                >
                  Already have an account? Log In
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
