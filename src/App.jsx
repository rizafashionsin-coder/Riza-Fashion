import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, useParams, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { subscribeToAuthState } from './services/firebaseServices';
import { products as initialProducts } from './data/products';
import { HelpCircle, Star, Phone, MessageSquare, ShieldCheck, Truck, RefreshCw, User } from 'lucide-react';

// Import our custom boutique UI components
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import Hero from './components/Hero';
import CategorySection from './components/CategorySection';
import PromoBanner from './components/PromoBanner';
import ProductCard from './components/ProductCard';
import ProductQuickView from './components/ProductQuickView';
import CartDrawer from './components/CartDrawer';
import CheckoutFlow from './components/CheckoutFlow';

import Testimonials from './components/Testimonials';
import InstagramGallery from './components/InstagramGallery';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

// Import newly created dedicated pages
import CategoryPage from './components/CategoryPage';
import ProductDetailsPage from './components/ProductDetailsPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import ContactPage from './components/ContactPage';
import FirebaseTestPage from './components/FirebaseTestPage';
import AdminDashboard from './components/AdminDashboard';
import CustomerOrdersPage from './components/CustomerOrdersPage';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';


// ProtectedRoute wrapper to safeguard pages requiring authentication
function ProtectedRoute({ children, currentUser, isAuthChecking }) {
  const location = useLocation();
  if (isAuthChecking) {
    return (
      <div className="text-center animate-fade" style={{ padding: '100px 20px', color: 'var(--primary)' }}>
        <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
        <p>Loading profile...</p>
      </div>
    );
  }
  if (!currentUser) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return children;
}

// Wrapper components for React Router parameters to prevent full app rebuild on param changes
function CategoryPageWrapper({
  products,
  wishlist,
  onWishlistToggle,
  onAddToCart,
  onQuickView,
  onNavigate,
  categories
}) {
  const { categoryName } = useParams();
  const mappedCategory = categoryName === 'nightwears' ? 'nightwear' : categoryName;
  return (
    <CategoryPage
      categoryName={mappedCategory || null}
      products={products}
      wishlist={wishlist}
      onWishlistToggle={onWishlistToggle}
      onAddToCart={onAddToCart}
      onQuickView={onQuickView}
      onNavigate={onNavigate}
      categories={categories}
    />
  );
}

function ProductDetailsPageWrapper({
  products,
  wishlist,
  onWishlistToggle,
  onAddToCart,
  onNavigate,
  onAddReview,
  onQuickView,
  triggerAuthCheck
}) {
  const { productId } = useParams();
  return (
    <ProductDetailsPage
      productId={productId}
      products={products}
      wishlist={wishlist}
      onWishlistToggle={onWishlistToggle}
      onAddToCart={onAddToCart}
      onNavigate={onNavigate}
      onAddReview={onAddReview}
      onQuickView={onQuickView}
      triggerAuthCheck={triggerAuthCheck}
    />
  );
}

function HomeView({
  products,
  isProductWishlisted,
  handleWishlistToggle,
  handleCardAddToCart,
  setActiveQuickViewProduct,
  handleNavigate,
  categories
}) {
  return (
    <div className="page-home animate-fade">
      <Hero onNavigate={handleNavigate} />
      <CategorySection onNavigate={handleNavigate} categories={categories} />
      <PromoBanner onNavigate={handleNavigate} />
      
      {/* Featured Grid Section */}
      <section className="section featured-products-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Exquisite Handpicks</span>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-description">
              Explore our top selling statements designed to elevate your silhouette and bring luxurious style to light.
            </p>
          </div>

          <div className="product-grid">
            {products
              .filter(p => p.isFeatured)
              .slice(0, 4)
              .map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={isProductWishlisted(product)}
                  onWishlistToggle={handleWishlistToggle}
                  onAddToCart={handleCardAddToCart}
                  onQuickView={setActiveQuickViewProduct}
                />
              ))
            }
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="section new-arrivals-section bg-secondary">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Fresh Drops</span>
            <h2 className="section-title">New Arrivals</h2>
            <p className="section-description">
              Stay ahead of the curve. Discover our newest drapes, loungewear sets, and premium accessories fresh off the runway.
            </p>
          </div>

          <div className="product-grid">
            {products
              .filter(p => p.isNew)
              .slice(0, 4)
              .map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={isProductWishlisted(product)}
                  onWishlistToggle={handleWishlistToggle}
                  onAddToCart={handleCardAddToCart}
                  onQuickView={setActiveQuickViewProduct}
                />
              ))
            }
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section why-choose-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Riza Assurance</span>
            <h2 className="section-title">Why Shop With Us</h2>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <Star size={32} className="why-icon" />
              <h4>Premium Quality</h4>
              <p>Finest georgettes, organic cotton knits, and 18k gold plating details.</p>
            </div>
            <div className="why-card">
              <ShieldCheck size={32} className="why-icon" />
              <h4>Secure Payments</h4>
              <p>Encrypted checkouts shielding card data and local UPI gateways.</p>
            </div>
            <div className="why-card">
              <Truck size={32} className="why-icon" />
              <h4>Fast Delivery</h4>
              <p>Free express logistics to your doorstep on orders exceeding ₹1499.</p>
            </div>
            <div className="why-card">
              <RefreshCw size={32} className="why-icon" />
              <h4>Easy Returns</h4>
              <p>No questions asked 15-day return and instant wallet replacements.</p>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />
      <InstagramGallery />
      <Newsletter />
    </div>
  );
}

export default function App() {
  // Loading screen states
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Trigger loading screen fade out and unmount
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1200);

    const removeTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1650);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top smoothly on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Sync scroll and path on navigating
  const handleNavigate = (page, category = null, isSale = false, isNew = false, productId = null) => {
    setOnlySaleItems(isSale);
    setOnlyNewArrivals(isNew);
    
    if (page !== 'shop' && page !== 'category') {
      setSearchQuery('');
    }
    
    if (productId) {
      navigate(`/product/${productId}`);
    } else if (page === 'home') {
      navigate('/');
    } else if (page === 'cart') {
      navigate('/cart');
    } else if (page === 'checkout') {
      navigate('/checkout');
    } else if (page === 'tracking') {
      navigate('/orders');
    } else if (page === 'contact') {
      navigate('/contact');
    } else if (page === 'wishlist') {
      navigate('/wishlist');
    } else if (page === 'firebase-test') {
      navigate('/firebase-test');
    } else if (page === 'orders') {
      navigate('/orders');
    } else if (page === 'profile') {
      navigate('/profile');
    } else if (page === 'login') {
      navigate('/login');
    } else if (page === 'shop') {
      if (category) {
        let catUrl = category;
        if (category === 'nightwear') catUrl = 'nightwears';
        navigate(`/category/${catUrl}`);
      } else {
        navigate('/shop');
      }
    } else {
      navigate('/');
    }
  };

  // Derive simple navigation states dynamically from current location path
  const currentPage = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path === '/' || path === '') return 'home';
    if (path === '/cart') return 'cart';
    if (path === '/checkout') return 'checkout';
    if (path === '/tracking') return 'orders';
    if (path === '/contact') return 'contact';
    if (path === '/wishlist') return 'wishlist';
    if (path === '/orders') return 'orders';
    if (path === '/firebase-test') return 'firebase-test';
    if (path === '/shop') return 'shop';
    if (path.startsWith('/category/')) return 'category';
    if (path.startsWith('/product/')) return 'product';

    return 'home';
  }, [location.pathname]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [onlySaleItems, setOnlySaleItems] = useState(false);
  const [onlyNewArrivals, setOnlyNewArrivals] = useState(false);

  // Authentication States
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [pendingAction, setPendingAction] = useState(null);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState('');

  const triggerAuthCheck = (action, message = "Please login to continue shopping.") => {
    // Check using standard Firebase auth context directly or the synced state
    if (currentUser || auth.currentUser) {
      action();
      return true;
    }
    setPendingAction(() => action);
    setAuthPromptMessage(message);
    setIsAuthPromptOpen(true);
    setIsCartOpen(false); // Close the cart drawer
    return false;
  };

  // Execute pending action once user becomes authenticated
  useEffect(() => {
    if (currentUser && pendingAction) {
      console.log("Executing pending action after successful login...");
      pendingAction();
      setPendingAction(null);
    }
  }, [currentUser, pendingAction]);

  const [modalMode, setModalMode] = useState('login'); // login | signup
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

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
        // Create a new Firestore document for first-time Google user
        profileData = {
          uid: user.uid,
          fullName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          provider: 'google',
          createdAt: serverTimestamp()
        };
        await setDoc(userDocRef, profileData);
        console.log("Created Firestore document for first-time Google user");
        setAuthSuccessMsg('Successfully registered and logged in with Google!');
      } else {
        // Load existing profile from Firestore
        profileData = userDocSnap.data();
        console.log("Loaded existing Google user profile from Firestore");
        setAuthSuccessMsg('Logged in with Google successfully!');
      }

      // Update account state immediately after Google login
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

      // Clear any fields and close modal
      setTimeout(() => {
        setIsAccountOpen(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
      }, 1000);

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


  // Sync with Auth Listener
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      try {
        if (user.isAuthenticated) {
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const profileData = userDocSnap.data();
              console.log("User profile loaded from Firestore");
              setCurrentUser({
                ...user,
                displayName: profileData.fullName || user.displayName,
                fullName: profileData.fullName,
                isAdmin: profileData.isAdmin || user.email === 'admin@riza.com',
                ...profileData
              });
            } else {
              setCurrentUser({
                ...user,
                isAdmin: user.email === 'admin@riza.com'
              });
            }
          } catch (error) {
            console.error("Failed to load user profile from Firestore:", error);
            setCurrentUser(user);
          }
        } else {
          setCurrentUser(null);
        }
      } finally {
        setIsAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Global E-commerce States
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState([]);
  const [deliverySettings, setDeliverySettings] = useState(null);

  // Fetch delivery settings from Firestore and auto-seed defaults if missing
  useEffect(() => {
    const deliveryDocRef = doc(db, 'settings', 'delivery');
    const unsubscribe = onSnapshot(deliveryDocRef, async (docSnap) => {
      if (!docSnap.exists()) {
        console.log("Firestore delivery settings missing. Seeding defaults from App.jsx...");
        const defaultDeliverySettings = {
          defaultCharge: 150,
          freeShippingThreshold: 1499,
          charges: {
            "chennai": 60,
            "coimbatore": 90,
            "madurai": 90,
            "tiruchirappalli": 90,
            "salem": 90,
            "tiruppur": 90,
            "erode": 90,
            "vellore": 90,
            "thanjavur": 90,
            "dindigul": 90,
            "ranipet": 90,
            "tirupathur": 90,
            "kanchipuram": 90,
            "chengalpattu": 90,
            "tiruvallur": 90,
            "tiruvannamalai": 90,
            "viluppuram": 90,
            "kallakurichi": 90,
            "cuddalore": 90,
            "dharmapuri": 90,
            "krishnagiri": 90,
            "namakkal": 90,
            "nilgiris": 100,
            "karur": 90,
            "perambalur": 90,
            "ariyalur": 90,
            "nagapattinam": 90,
            "mayiladuthurai": 90,
            "tiruvarur": 90,
            "pudukkottai": 90,
            "sivaganga": 90,
            "ramanathapuram": 90,
            "virudhunagar": 90,
            "theni": 90,
            "tenkasi": 90,
            "tirunelveli": 90,
            "thoothukudi": 90,
            "kanyakumari": 100
          }
        };
        try {
          await setDoc(deliveryDocRef, defaultDeliverySettings);
          console.log("Delivery settings seeded successfully!");
          setDeliverySettings(defaultDeliverySettings);
        } catch (e) {
          console.error("Failed to seed delivery settings:", e);
        }
      } else {
        setDeliverySettings(docSnap.data());
      }
    }, (err) => {
      console.error("Error listening to delivery settings:", err);
    });
    return () => unsubscribe();
  }, []);

  // Fetch categories from Firestore with real-time sync and auto-seed if empty
  useEffect(() => {
    const categoriesQuery = collection(db, 'categories');
    const unsubscribe = onSnapshot(categoriesQuery, async (querySnapshot) => {
      const catsList = [];
      querySnapshot.forEach((doc) => {
        catsList.push({ id: doc.id, ...doc.data() });
      });
      
      if (catsList.length === 0) {
        console.log("Firestore categories collection is empty. Seeding defaults from App.jsx...");
        const defaultCategories = [
          { id: 'sarees', name: 'Sarees', description: 'Elegant drapes & silk fabrics', offer: 'Flat 10% OFF', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
          { id: 'kurtis', name: 'Kurtis', description: 'Ethnic and modern wear fusion', offer: 'New Season', image: 'https://images.unsplash.com/photo-1608930261073-455b55021571?auto=format&fit=crop&w=600&q=80' },
          { id: 'maxi', name: 'Maxi Dresses', description: 'Flowing silhouettes for dinners', offer: 'Up to 30% OFF', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80' },
          { id: 'nightwear', name: 'Night Wears', description: 'Unwind in pure satin and cotton', offer: 'Buy 2 Get 1', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80' },
          { id: 'hijabs', name: 'Hijabs', description: 'Breathable premium wraps', offer: 'Starting ₹399', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
          { id: 'accessories', name: 'Accessories', description: 'Luxury handbags & pendant sets', offer: 'Rose Gold Plated', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80' }
        ];
        
        try {
          for (const cat of defaultCategories) {
            await setDoc(doc(db, 'categories', cat.id), cat);
          }
          console.log("Categories seeded successfully.");
        } catch (e) {
          console.error("Failed to seed default categories:", e);
        }
      } else {
        // Sort categories to maintain consistent display order
        catsList.sort((a, b) => a.id.localeCompare(b.id));
        setCategories(catsList);
      }
    }, (err) => {
      console.error("Error listening to categories in App.jsx:", err);
    });
    return () => unsubscribe();
  }, []);

  // Sync products list with Firestore and auto-seed if empty
  useEffect(() => {
    const loadAndSeedProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const fetchedProds = [];
        querySnapshot.forEach((doc) => {
          fetchedProds.push({ id: doc.id, ...doc.data() });
        });

        if (fetchedProds.length === 0) {
          console.log("Firestore products collection is empty. Seeding defaults...");
          for (const item of initialProducts) {
            await setDoc(doc(db, 'products', item.id), item);
          }
          console.log("Seeding complete!");
          setProducts(initialProducts);
        } else {
          console.log("Loaded products from Firestore:", fetchedProds.length);
          setProducts(fetchedProds);
        }
      } catch (err) {
        console.error("Failed to load products from Firestore, falling back to static mock data:", err);
        setProducts(initialProducts);
      }
    };

    loadAndSeedProducts();
  }, []);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('riza_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('riza_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [ordersList, setOrdersList] = useState(() => {
    try {
      const saved = localStorage.getItem('riza_orders');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeCoupon, setActiveCoupon] = useState('');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('riza_cart', JSON.stringify(cart));
    } catch (err) {
      console.error("Failed to save cart:", err);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('riza_wishlist', JSON.stringify(wishlist));
    } catch (err) {
      console.error("Failed to save wishlist:", err);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('riza_orders', JSON.stringify(ordersList));
    } catch (err) {
      console.error("Failed to save orders:", err);
    }
  }, [ordersList]);

  // UI Modal Overlays States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [activeQuickViewProduct, setActiveQuickViewProduct] = useState(null);





  // 1. Wishlist Handlers
  const handleWishlistToggle = (product) => {
    triggerAuthCheck(() => {
      setWishlist(prev => {
        const exists = prev.find(item => item.id === product.id);
        if (exists) {
          return prev.filter(item => item.id !== product.id);
        } else {
          return [...prev, product];
        }
      });
    }, "Please login to continue shopping.");
  };

  const isProductWishlisted = (product) => {
    return wishlist.some(item => item.id === product.id);
  };

  // 2. Cart Handlers
  const handleAddToCart = (cartItem) => {
    setCart(prev => {
      // Check if item with same ID, size, and color is already present
      const matchIdx = prev.findIndex(item => 
        item.id === cartItem.id && 
        item.selectedSize === cartItem.selectedSize &&
        item.selectedColor === cartItem.selectedColor
      );

      if (matchIdx > -1) {
        const updated = [...prev];
        updated[matchIdx].quantity += cartItem.quantity || 1;
        return updated;
      } else {
        return [...prev, { ...cartItem, quantity: cartItem.quantity || 1 }];
      }
    });
    
    // Show quick feedback
    setIsCartOpen(true);
  };

  // Standard cart card addition trigger (sets defaults for size/color)
  const handleCardAddToCart = (product) => {
    const defaultItem = {
      ...product,
      selectedSize: product.sizes[0] || 'Free Size',
      selectedColor: product.colors[0] || '',
      quantity: 1
    };
    handleAddToCart(defaultItem);
  };

  const handleUpdateQuantity = (itemToUpdate, delta) => {
    setCart(prev => 
      prev.map(item => {
        if (
          item.id === itemToUpdate.id &&
          item.selectedSize === itemToUpdate.selectedSize &&
          item.selectedColor === itemToUpdate.selectedColor
        ) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, Math.min(10, newQty)) };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (itemToRemove) => {
    setCart(prev => 
      prev.filter(item => !(
        item.id === itemToRemove.id &&
        item.selectedSize === itemToRemove.selectedSize &&
        item.selectedColor === itemToRemove.selectedColor
      ))
    );
  };

  const handleClearCart = (itemsToKeep) => {
    if (itemsToKeep && Array.isArray(itemsToKeep)) {
      setCart(itemsToKeep);
    } else {
      setCart([]);
    }
  };

  // 3. Checkout and Orders
  const handlePlaceOrder = async (orderId, orderDetails) => {
    // Collect shipping address
    let shippingAddressStr = '';
    if (orderDetails.shipping) {
      const { address, city, state, pinCode } = orderDetails.shipping;
      shippingAddressStr = `${address}, ${city}, ${state} - ${pinCode}`;
    } else if (orderDetails.shippingInfo) {
      const { address, city, state, postalCode } = orderDetails.shippingInfo;
      shippingAddressStr = `${address}, ${city}, ${state || ''} - ${postalCode}`;
    }

    const customerNameVal = orderDetails.customer?.name || orderDetails.shippingInfo?.fullName || 'Guest';
    const emailVal = orderDetails.customer?.email || orderDetails.shippingInfo?.email || '';
    const phoneVal = orderDetails.customer?.phone || orderDetails.shippingInfo?.phone || '';

    const itemsVal = (orderDetails.items || []).map(item => ({
      id: item.id || '',
      name: item.name || '',
      selectedSize: item.selectedSize || 'Free Size',
      selectedColor: item.selectedColor || '',
      quantity: item.quantity || 1,
      price: item.price || 0,
      salePrice: item.salePrice || item.price || 0,
      images: item.images || []
    }));

    const subtotalVal = orderDetails.pricing?.subtotal || orderDetails.totals?.subtotal || 0;
    const shippingChargeVal = orderDetails.pricing?.shipping !== undefined ? orderDetails.pricing.shipping : (orderDetails.totals ? (orderDetails.totals.subtotal >= 1499 ? 0 : 99) : 0);
    const totalAmountVal = orderDetails.pricing?.total || orderDetails.totals?.grandTotal || 0;
    const paymentMethodVal = orderDetails.paymentMethod || 'razorpay';

    // Build the exact required Firestore document structure
    if (!currentUser) {
      console.error("Refusing to create order for unauthenticated user.");
      alert("Please sign in to place your order.");
      return;
    }

    const finalOrder = {
      orderId,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      customerName: currentUser.displayName || customerNameVal,
      email: emailVal || currentUser.email,
      phone: phoneVal,
      shippingAddress: shippingAddressStr,
      items: itemsVal,
      subtotal: subtotalVal,
      shippingCharge: shippingChargeVal,
      totalAmount: totalAmountVal,
      paymentMethod: paymentMethodVal,
      paymentStatus: orderDetails.paymentStatus || 'Paid',
      orderStatus: orderDetails.orderStatus || 'Pending',
      razorpayPaymentId: orderDetails.razorpayPaymentId || null,
      createdAt: new Date().toISOString()
    };

    setOrdersList(prev => ({
      ...prev,
      [orderId]: finalOrder
    }));

    try {
      await setDoc(doc(db, 'orders', orderId), finalOrder);
      console.log("Order saved to Firestore successfully:", orderId);
    } catch (err) {
      console.error("Failed to save order to Firestore:", err);
    }
  };

  // 4. Product Reviews persisting
  const handleAddReview = (productId, reviewObj) => {
    setProducts(prevProducts => 
      prevProducts.map(prod => {
        if (prod.id === productId) {
          const updatedReviews = [reviewObj, ...prod.reviews];
          // Calculate new average rating
          const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
          const newAvgRating = totalRating / updatedReviews.length;
          
          return {
            ...prod,
            reviews: updatedReviews,
            rating: newAvgRating
          };
        }
        return prod;
      })
    );
    
    // Also sync the currently active quick view product so review shows instantly
    setActiveQuickViewProduct(prev => {
      if (prev && prev.id === productId) {
        const updatedReviews = [reviewObj, ...prev.reviews];
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        return {
          ...prev,
          reviews: updatedReviews,
          rating: totalRating / updatedReviews.length
        };
      }
      return prev;
    });
  };

  // 5. Coupon Handling
  const handleApplyCoupon = (code) => {
    setActiveCoupon(code);
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon('');
  };



  // General counts
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;



  const isAdminRoute = location.pathname.toLowerCase().startsWith('/admin');

  return (
    <div className="riza-fashions-app">
      {isLoading && (
        <div className={`loading-screen ${isFadingOut ? 'fade-out' : ''}`}>
          <div className="loading-logo-wrapper">
            <img src="/logo-transparent.png" className="loading-logo" alt="Riza Fashions" />
            <div className="loading-pulse-ring"></div>
          </div>
        </div>
      )}
      
      {/* Dynamic Header navbar */}
      {!isAdminRoute && (
        <Navbar
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          onNavigate={handleNavigate}
          currentPage={currentPage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          currentUser={currentUser}
          categories={categories}
        />
      )}

      {/* Main page content sections */}
      <main className="main-viewport-content">
        <Routes>
          <Route path="/" element={
            <HomeView
              products={products}
              isProductWishlisted={isProductWishlisted}
              handleWishlistToggle={handleWishlistToggle}
              handleCardAddToCart={handleCardAddToCart}
              setActiveQuickViewProduct={setActiveQuickViewProduct}
              handleNavigate={handleNavigate}
              categories={categories}
            />
          } />
          
          <Route path="/shop" element={
            <CategoryPageWrapper
              products={products}
              wishlist={wishlist}
              onWishlistToggle={handleWishlistToggle}
              onAddToCart={handleCardAddToCart}
              onQuickView={setActiveQuickViewProduct}
              onNavigate={handleNavigate}
              categories={categories}
            />
          } />
          
          <Route path="/category/:categoryName" element={
            <CategoryPageWrapper
              products={products}
              wishlist={wishlist}
              onWishlistToggle={handleWishlistToggle}
              onAddToCart={handleCardAddToCart}
              onQuickView={setActiveQuickViewProduct}
              onNavigate={handleNavigate}
              categories={categories}
            />
          } />
          
          <Route path="/product/:productId" element={
            <ProductDetailsPageWrapper
              products={products}
              wishlist={wishlist}
              onWishlistToggle={handleWishlistToggle}
              onAddToCart={handleAddToCart}
              onNavigate={handleNavigate}
              onAddReview={handleAddReview}
              onQuickView={setActiveQuickViewProduct}
              triggerAuthCheck={triggerAuthCheck}
            />
          } />
          
          <Route path="/cart" element={
            <CartPage
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onNavigate={handleNavigate}
              activeCoupon={activeCoupon}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              triggerAuthCheck={triggerAuthCheck}
            />
          } />
          
          <Route path="/checkout" element={
            <ProtectedRoute currentUser={currentUser} isAuthChecking={isAuthChecking}>
              <CheckoutPage
                cart={cart}
                activeCoupon={activeCoupon}
                onClearCart={handleClearCart}
                onPlaceOrder={handlePlaceOrder}
                onNavigate={handleNavigate}
                deliverySettings={deliverySettings}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/wishlist" element={
            <ProtectedRoute currentUser={currentUser} isAuthChecking={isAuthChecking}>
              <div className="page-wishlist section animate-fade">
                <div className="container">
                  <div className="section-header">
                    <span className="section-subtitle">Your Closet</span>
                    <h2 className="section-title">Your Private Wishlist</h2>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="empty-wishlist-state text-center">
                      <HelpCircle size={64} className="empty-icon" />
                      <h3>Your Wishlist is Empty</h3>
                      <p>Save items you love here by clicking the heart button on cards. Revisit them at any time to add to cart.</p>
                      <button className="btn btn-primary" onClick={() => handleNavigate('shop')}>
                        Explore Shop Collections
                      </button>
                    </div>
                  ) : (
                    <div className="product-grid">
                      {wishlist.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isWishlisted={true}
                          onWishlistToggle={handleWishlistToggle}
                          onAddToCart={handleCardAddToCart}
                          onQuickView={setActiveQuickViewProduct}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/login" element={
            <LoginPage currentUser={currentUser} setCurrentUser={setCurrentUser} />
          } />

          <Route path="/profile" element={
            <ProtectedRoute currentUser={currentUser} isAuthChecking={isAuthChecking}>
              <ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} onNavigate={handleNavigate} />
            </ProtectedRoute>
          } />

          <Route path="/contact" element={
            <ContactPage onNavigate={handleNavigate} />
          } />

          <Route path="/firebase-test" element={
            <FirebaseTestPage onNavigate={handleNavigate} />
          } />

          <Route path="/admin" element={
            !isLoading && (!currentUser || !currentUser.isAdmin) ? (
              <Navigate to="/" replace />
            ) : (
              <AdminDashboard currentUser={currentUser} onNavigate={handleNavigate} categories={categories} deliverySettings={deliverySettings} />
            )
          } />

          <Route path="/orders" element={
            <ProtectedRoute currentUser={currentUser} isAuthChecking={isAuthChecking}>
              <CustomerOrdersPage currentUser={currentUser} onNavigate={handleNavigate} />
            </ProtectedRoute>
          } />

          {/* Catch-all route to redirect back to home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Sticky Footer */}
      {!isAdminRoute && <Footer onNavigate={handleNavigate} />}

      {/* Mobile Sticky Action Nav */}
      {!isAdminRoute && (
        <MobileNav
          currentPage={currentPage}
          onNavigate={handleNavigate}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          currentUser={currentUser}
        />
      )}

      {/* Cart Slider Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          triggerAuthCheck(() => {
            try {
              localStorage.removeItem('buyNowItem');
            } catch (err) {
              console.error(err);
            }
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }, "Please login to continue shopping.");
        }}
        activeCoupon={activeCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
      />

      {/* Checkout Wizard Drawer */}
      <CheckoutFlow
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        activeCoupon={activeCoupon}
        onClearCart={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        deliverySettings={deliverySettings}
      />

      {/* Quick View Details Modal */}
      {activeQuickViewProduct && (
        <ProductQuickView
          product={activeQuickViewProduct}
          onClose={() => setActiveQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
          allProducts={products}
          onQuickView={setActiveQuickViewProduct}
          isWishlisted={isProductWishlisted(activeQuickViewProduct)}
          onWishlistToggle={handleWishlistToggle}
          onAddReview={handleAddReview}
        />
      )}

      {/* Account Login Drawer Mockup */}
      {isAccountOpen && (
        <div className="modal-overlay" onClick={() => setIsAccountOpen(false)}>
          <div className="account-modal-container animate-zoom" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAccountOpen(false)}>
              <X size={20} />
            </button>
            
            {currentUser ? (
              // Logged In Profile View
              <div className="account-modal-body text-center">
                <h2>My Account</h2>
                <div className="profile-icon-wrapper" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', color: 'var(--primary)', marginBottom: '16px', border: '1px solid var(--border-light)' }}>
                  <User size={32} />
                </div>
                <p className="account-desc" style={{ marginBottom: '20px' }}>
                  Welcome back, <strong>{currentUser.displayName || 'Fashionista'}</strong>!
                </p>
                
                <div className="user-details-card" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '24px', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-muted)' }}>ACCOUNT CREDENTIALS</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--charcoal)' }}>
                    <div><strong>Email:</strong> {currentUser.email}</div>
                    {currentUser.displayName && <div><strong>Name:</strong> {currentUser.displayName}</div>}
                    <div><strong>User ID:</strong> <code style={{ fontSize: '0.75rem' }}>{currentUser.uid}</code></div>
                  </div>
                </div>
                
                {currentUser.isAdmin && (
                  <button 
                    className="btn btn-primary btn-block" 
                    style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={() => {
                      setIsAccountOpen(false);
                      navigate('/admin');
                    }}
                  >
                    <Package size={16} /> Go to Admin Dashboard
                  </button>
                )}

                <button 
                  className="btn btn-secondary btn-block" 
                  style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid var(--primary)', color: 'var(--primary)', background: '#FFF' }}
                  onClick={() => {
                    setIsAccountOpen(false);
                    handleNavigate('orders');
                  }}
                >
                  <ShoppingBag size={16} /> View My Orders
                </button>

                <button 
                  className="btn btn-secondary btn-block" 
                  onClick={async () => {
                    try {
                      await signOut(auth);
                      setIsAccountOpen(false);
                    } catch (err) {
                      console.error("Signout error:", err);
                    }
                  }}
                >
                  Log Out
                </button>
              </div>
            ) : (
              // Login / Signup Form View
              <div className="account-modal-body text-center">
                <h2>{modalMode === 'login' ? 'My Account' : 'Create Account'}</h2>
                <p className="account-desc">
                  {modalMode === 'login' 
                    ? 'Welcome back to Riza Fashions! Log in to view your profile and saved closet items.' 
                    : 'Sign up to create your Riza Fashions profile and track your premium orders.'}
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

                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setAuthError('');
                    setAuthSuccessMsg('');
                    setAuthLoading(true);

                    try {
                      if (modalMode === 'login') {
                        // Firebase Log In
                        await signInWithEmailAndPassword(auth, authEmail, authPassword);
                        setAuthSuccessMsg('Logged in successfully!');
                        setTimeout(() => {
                          setIsAccountOpen(false);
                          setAuthEmail('');
                          setAuthPassword('');
                        }, 800);
                      } else {
                        // Firebase Sign Up / Register
                        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
                        const user = userCredential.user;
                        console.log("User created in Authentication");

                        await updateProfile(user, { displayName: authName });

                        // Attempt to write user profile to Firestore
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

                        if (firestoreSuccess) {
                          setAuthSuccessMsg('Account registered successfully! Welcome to Riza Fashions.');
                        }
                        
                        // Force refresh user profile
                        setCurrentUser({
                          uid: user.uid,
                          email: user.email,
                          displayName: authName,
                          isAuthenticated: true,
                          isAdmin: user.email === 'admin@riza.com'
                        });
                        setTimeout(() => {
                          setIsAccountOpen(false);
                          setAuthName('');
                          setAuthEmail('');
                          setAuthPassword('');
                        }, 1200);
                      }
                    } catch (err) {
                      console.error("Auth operation failed:", err);
                      let friendlyMsg = err.message;
                      
                      // Map standard Firebase Auth errors to user friendly messages
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
                  }} 
                  className="account-auth-form"
                >
                  {modalMode === 'signup' && (
                    <div className="form-field text-left margin-bottom" style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Full Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Maya Iyer" 
                        className="form-input" 
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        required 
                      />
                    </div>
                  )}

                  <div className="form-field text-left margin-bottom" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. maya@example.com" 
                      className="form-input" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-field text-left margin-bottom" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="form-input" 
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required 
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" disabled={authLoading}>
                    {authLoading ? 'Please wait...' : modalMode === 'login' ? 'Log In' : 'Sign Up'}
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-google btn-block" 
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    style={{ marginTop: '12px' }}
                  >
                    <GoogleIcon /> Continue with Google
                  </button>
                </form>
                
                <span className="or-divider">or</span>
                
                {modalMode === 'login' ? (
                  <button 
                    className="btn btn-secondary btn-block" 
                    onClick={() => { setModalMode('signup'); setAuthError(''); setAuthSuccessMsg(''); }}
                  >
                    Create New Account
                  </button>
                ) : (
                  <button 
                    className="btn btn-secondary btn-block" 
                    onClick={() => { setModalMode('login'); setAuthError(''); setAuthSuccessMsg(''); }}
                  >
                    Already have an account? Log In
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Intercept Prompt Modal */}
      {isAuthPromptOpen && (
        <div className="modal-overlay" onClick={() => setIsAuthPromptOpen(false)}>
          <div className="account-modal-container animate-zoom" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAuthPromptOpen(false)}>
              <X size={20} />
            </button>
            
            <div className="account-modal-body text-center">
              <h2 style={{ fontFamily: 'var(--font-headings)', color: 'var(--charcoal)', marginBottom: '16px' }}>Authentication Required</h2>
              <p className="account-desc" style={{ marginBottom: '24px', fontSize: '1rem', color: 'var(--text-muted)' }}>
                {authPromptMessage || "Please login to continue shopping."}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setIsAuthPromptOpen(false);
                    const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
                    navigate(`/login?redirect=${currentPath}`);
                  }}
                  style={{ padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
                >
                  Login
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsAuthPromptOpen(false);
                    const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
                    navigate(`/login?mode=register&redirect=${currentPath}`);
                  }}
                  style={{ padding: '12px', border: '1px solid var(--border-medium)', background: '#FFF', borderRadius: 'var(--radius-md)', color: 'var(--charcoal)', fontWeight: 600 }}
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple checkmark icons for contact forms
function CheckCircle({ className }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

// Simple X icon for login modals
function X({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

// Google Icon SVG component
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

