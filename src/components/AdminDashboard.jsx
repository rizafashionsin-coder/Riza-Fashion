import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  ShoppingBag, 
  Package, 
  Lock, 
  ArrowLeft, 
  Check, 
  RefreshCw, 
  X,
  FileText,
  ChevronDown,
  ChevronUp,
  Grid,
  Menu,
  LogOut,
  ExternalLink,
  Layers,
  Settings,
  User,
  Tag
} from 'lucide-react';
import { db, storage } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminDashboard({ currentUser, onNavigate, categories, deliverySettings }) {
  // Access control check
  const isAdmin = currentUser && currentUser.isAdmin;

  // Active tab state: products | categories | orders
  const [activeTab, setActiveTab] = useState('products');

  // Sidebar toggle state for mobile view
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Firestore collections states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Search and filter states
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Prop deliverySettings integration
  const [baseDeliveryCharge, setBaseDeliveryCharge] = useState(150);
  const [freeThreshold, setFreeThreshold] = useState(1499);
  const [districtCharges, setDistrictCharges] = useState({});
  const [districtSearch, setDistrictSearch] = useState('');
  const [bulkChargeVal, setBulkChargeVal] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (deliverySettings) {
      setBaseDeliveryCharge(deliverySettings.defaultCharge || 150);
      setFreeThreshold(deliverySettings.freeShippingThreshold || 1499);
      setDistrictCharges(deliverySettings.charges || {});
    }
  }, [deliverySettings]);

  const tnDistrictsList = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", 
    "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", 
    "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", 
    "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", 
    "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", 
    "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", 
    "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", 
    "Vellore", "Viluppuram", "Virudhunagar"
  ];

  const filteredTnDistricts = tnDistrictsList.filter(district =>
    district.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const handleUpdateDistrictCharge = (districtName, newCharge) => {
    const chargeVal = Number(newCharge);
    if (isNaN(chargeVal) || chargeVal < 0) return;
    setDistrictCharges(prev => ({
      ...prev,
      [districtName.toLowerCase()]: chargeVal
    }));
  };

  const handleBulkUpdateCharges = () => {
    const chargeVal = Number(bulkChargeVal);
    if (isNaN(chargeVal) || chargeVal < 0) {
      alert("Please enter a valid shipping charge.");
      return;
    }
    const updated = {};
    tnDistrictsList.forEach(dist => {
      updated[dist.toLowerCase()] = chargeVal;
    });
    setDistrictCharges(updated);
    setBulkChargeVal('');
    alert(`All Tamil Nadu districts updated to ₹${chargeVal} locally. Save settings to commit to database.`);
  };

  const handleSaveDeliverySettings = async () => {
    setSavingSettings(true);
    setSettingsSuccess('');
    setSettingsError('');

    try {
      const deliveryDocRef = doc(db, 'settings', 'delivery');
      await setDoc(deliveryDocRef, {
        defaultCharge: Number(baseDeliveryCharge),
        freeShippingThreshold: Number(freeThreshold),
        charges: districtCharges
      });
      setSettingsSuccess("Delivery settings saved to database successfully!");
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err) {
      console.error("Failed to save delivery settings:", err);
      setSettingsError("Failed to save settings. Check permissions.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Expandable orders state
  const [expandedOrders, setExpandedOrders] = useState({});

  // Toggle an order's expanded/collapsed state
  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Category modal & form states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catSlug, setCatSlug] = useState('');
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catOffer, setCatOffer] = useState('');
  const [catImage, setCatImage] = useState('');

  // Coupon modal & form states
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [cpCode, setCpCode] = useState('');
  const [cpType, setCpType] = useState('percentage'); // percentage | fixed
  const [cpValue, setCpValue] = useState('');
  const [cpMinOrderAmount, setCpMinOrderAmount] = useState('');
  const [cpMaxDiscount, setCpMaxDiscount] = useState('');
  const [cpExpiryDate, setCpExpiryDate] = useState('');
  const [cpTotalLimit, setCpTotalLimit] = useState('');
  const [cpPerUserLimit, setCpPerUserLimit] = useState('');
  const [cpActive, setCpActive] = useState(true);
  const [couponSearch, setCouponSearch] = useState('');

  // Form states for Add/Edit product
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('sarees');
  const [prodPrice, setProdPrice] = useState('');
  const [prodSalePrice, setProdSalePrice] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodSizes, setProdSizes] = useState([]);
  const [prodSizeStock, setProdSizeStock] = useState({});
  const [prodColors, setProdColors] = useState([]);
  const [colorPickerCode, setColorPickerCode] = useState('#D4A5A5');
  const [colorInputName, setColorInputName] = useState('');
  const [prodDetails, setProdDetails] = useState('');
  const [prodImages, setProdImages] = useState([]);
  
  // Image uploading states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Form error/success alerts
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Available categories options (dynamic with static fallback)
  const categoriesList = categories.length > 0 
    ? categories.map(cat => ({ value: cat.id, label: cat.name }))
    : [
        { value: 'sarees', label: 'Sarees' },
        { value: 'kurtis', label: 'Kurtis' },
        { value: 'maxi', label: 'Maxi Dresses' },
        { value: 'nightwear', label: 'Night Wears' },
        { value: 'hijabs', label: 'Hijabs' },
        { value: 'accessories', label: 'Accessories' }
      ];

  // Sizes choices
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  // Default categories for seeding
  const defaultCategories = [
    { id: 'sarees', name: 'Sarees', description: 'Elegant drapes & silk fabrics', offer: 'Flat 10% OFF', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
    { id: 'kurtis', name: 'Kurtis', description: 'Ethnic and modern wear fusion', offer: 'New Season', image: 'https://images.unsplash.com/photo-1608930261073-455b55021571?auto=format&fit=crop&w=600&q=80' },
    { id: 'maxi', name: 'Maxi Dresses', description: 'Flowing silhouettes for dinners', offer: 'Up to 30% OFF', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80' },
    { id: 'nightwear', name: 'Night Wears', description: 'Unwind in pure satin and cotton', offer: 'Buy 2 Get 1', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80' },
    { id: 'hijabs', name: 'Hijabs', description: 'Breathable premium wraps', offer: 'Starting ₹399', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
    { id: 'accessories', name: 'Accessories', description: 'Luxury handbags & pendant sets', offer: 'Rose Gold Plated', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80' }
  ];

  // Local category fetching and seeding logic removed. Categories list is now real-time synced and passed down via props.

  // Fetch products and orders
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const prodsList = [];
      querySnapshot.forEach((doc) => {
        prodsList.push({ id: doc.id, ...doc.data() });
      });
      setProducts(prodsList);
    } catch (err) {
      console.error("Error fetching products in dashboard:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      
      setLoadingOrders(true);
      const ordersQuery = query(collection(db, 'orders'));
      const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
        const ordersList = [];
        querySnapshot.forEach((doc) => {
          ordersList.push({ id: doc.id, ...doc.data() });
        });
        // Sort orders locally by date (latest first)
        ordersList.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.date || 0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.date || 0);
          return dateB - dateA;
        });
        setOrders(ordersList);
        setLoadingOrders(false);
      }, (err) => {
        console.error("Error listening to orders in admin dashboard:", err);
        setLoadingOrders(false);
      });

      setLoadingCoupons(true);
      const couponsQuery = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
      const unsubscribeCoupons = onSnapshot(couponsQuery, (querySnapshot) => {
        const cpList = [];
        querySnapshot.forEach((doc) => {
          cpList.push({ id: doc.id, ...doc.data() });
        });
        setCoupons(cpList);
        setLoadingCoupons(false);
      }, (err) => {
        console.error("Error listening to coupons in admin dashboard:", err);
        setLoadingCoupons(false);
      });

      return () => {
        unsubscribe();
        unsubscribeCoupons();
      };
    }
  }, [isAdmin]);

  // Lock body scroll when modal is open to satisfy UI accessibility requirements
  useEffect(() => {
    if (isProductModalOpen || isCategoryModalOpen || isCouponModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isProductModalOpen, isCategoryModalOpen, isCouponModalOpen]);

  // Category management handlers
  const handleOpenAddCategoryModal = () => {
    setEditingCategory(null);
    setCatSlug('');
    setCatName('');
    setCatDescription('');
    setCatOffer('');
    setCatImage('');
    setFormError('');
    setFormSuccess('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (category) => {
    setEditingCategory(category);
    setCatSlug(category.id || '');
    setCatName(category.name || '');
    setCatDescription(category.description || '');
    setCatOffer(category.offer || '');
    setCatImage(category.image || '');
    setFormError('');
    setFormSuccess('');
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!catSlug.trim()) {
      setFormError("Category Slug/ID is required.");
      return;
    }
    if (!catName.trim()) {
      setFormError("Category Name is required.");
      return;
    }
    if (!catImage.trim()) {
      setFormError("Category Image URL is required.");
      return;
    }

    const cleanedSlug = catSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');

    const categoryPayload = {
      id: cleanedSlug,
      name: catName.trim(),
      description: catDescription.trim(),
      offer: catOffer.trim(),
      image: catImage.trim()
    };

    try {
      if (editingCategory) {
        if (editingCategory.id !== cleanedSlug) {
          await deleteDoc(doc(db, 'categories', editingCategory.id));
        }
        await setDoc(doc(db, 'categories', cleanedSlug), categoryPayload);
        setFormSuccess("Category updated successfully!");
      } else {
        await setDoc(doc(db, 'categories', cleanedSlug), categoryPayload);
        setFormSuccess("Category created successfully!");
      }

      // Prop updates dynamically in real-time

      setTimeout(() => {
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
      }, 1000);
    } catch (err) {
      console.error("Firestore category write failed:", err);
      setFormError("Failed to save category. Please check database rules.");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category? This might affect products linked to it.")) return;

    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      console.log("Category deleted from Firestore:", categoryId);
      // Prop updates dynamically in real-time
    } catch (err) {
      console.error("Firestore category delete failed:", err);
      alert("Failed to delete category. Check permissions.");
    }
  };

  // Coupon management handlers
  const handleOpenAddCouponModal = () => {
    setEditingCoupon(null);
    setCpCode('');
    setCpType('percentage');
    setCpValue('');
    setCpMinOrderAmount('');
    setCpMaxDiscount('');
    setCpExpiryDate('');
    setCpTotalLimit('');
    setCpPerUserLimit('');
    setCpActive(true);
    setFormError('');
    setFormSuccess('');
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCouponModal = (coupon) => {
    setEditingCoupon(coupon);
    setCpCode(coupon.code || '');
    setCpType(coupon.type || 'percentage');
    setCpValue(coupon.value || '');
    setCpMinOrderAmount(coupon.minOrderAmount || '');
    setCpMaxDiscount(coupon.maxDiscount || '');
    setCpExpiryDate(coupon.expiryDate ? coupon.expiryDate.substring(0, 16) : '');
    setCpTotalLimit(coupon.totalLimit || '');
    setCpPerUserLimit(coupon.perUserLimit || '');
    setCpActive(coupon.active !== false);
    setFormError('');
    setFormSuccess('');
    setIsCouponModalOpen(true);
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!cpCode.trim()) {
      setFormError("Coupon Code is required.");
      return;
    }
    if (!cpValue || isNaN(cpValue) || Number(cpValue) <= 0) {
      setFormError("Please enter a valid positive discount value.");
      return;
    }
    if (cpMinOrderAmount && (isNaN(cpMinOrderAmount) || Number(cpMinOrderAmount) < 0)) {
      setFormError("Minimum order amount must be a positive number.");
      return;
    }
    if (cpMaxDiscount && (isNaN(cpMaxDiscount) || Number(cpMaxDiscount) < 0)) {
      setFormError("Maximum discount amount must be a positive number.");
      return;
    }
    if (cpTotalLimit && (isNaN(cpTotalLimit) || Number(cpTotalLimit) < 0)) {
      setFormError("Total limit must be a positive number.");
      return;
    }
    if (cpPerUserLimit && (isNaN(cpPerUserLimit) || Number(cpPerUserLimit) < 0)) {
      setFormError("Per user limit must be a positive number.");
      return;
    }

    const cleanedCode = cpCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!cleanedCode) {
      setFormError("Invalid coupon code. Use letters and numbers only.");
      return;
    }

    const couponPayload = {
      code: cleanedCode,
      type: cpType,
      value: Number(cpValue),
      minOrderAmount: cpMinOrderAmount ? Number(cpMinOrderAmount) : 0,
      maxDiscount: cpMaxDiscount ? Number(cpMaxDiscount) : 0,
      expiryDate: cpExpiryDate ? new Date(cpExpiryDate).toISOString() : '',
      totalLimit: cpTotalLimit ? Number(cpTotalLimit) : 0,
      perUserLimit: cpPerUserLimit ? Number(cpPerUserLimit) : 0,
      active: cpActive,
      usedCount: editingCoupon ? (editingCoupon.usedCount || 0) : 0,
      createdAt: editingCoupon ? (editingCoupon.createdAt || serverTimestamp()) : serverTimestamp()
    };

    try {
      if (editingCoupon) {
        if (editingCoupon.code !== cleanedCode) {
          await deleteDoc(doc(db, 'coupons', editingCoupon.code));
        }
        await setDoc(doc(db, 'coupons', cleanedCode), couponPayload);
        setFormSuccess("Coupon updated successfully!");
      } else {
        await setDoc(doc(db, 'coupons', cleanedCode), couponPayload);
        setFormSuccess("Coupon created successfully!");
      }

      setTimeout(() => {
        setIsCouponModalOpen(false);
        setEditingCoupon(null);
      }, 1000);
    } catch (err) {
      console.error("Firestore coupon write failed:", err);
      setFormError("Failed to save coupon. Please check database permissions.");
    }
  };

  const handleDeleteCoupon = async (couponCode) => {
    if (!window.confirm(`Are you sure you want to delete coupon ${couponCode}? This action cannot be undone.`)) return;

    try {
      await deleteDoc(doc(db, 'coupons', couponCode));
      console.log("Coupon deleted from Firestore:", couponCode);
    } catch (err) {
      console.error("Firestore coupon delete failed:", err);
      alert("Failed to delete coupon. Check database permissions.");
    }
  };

  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary credentials not set. Please update VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    return data.secure_url;
  };

  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError('');

    try {
      const downloadURL = await uploadToCloudinary(file);
      setCatImage(downloadURL);
      console.log("Category image uploaded to Cloudinary successfully:", downloadURL);
    } catch (err) {
      console.error("Cloudinary category upload failed:", err);
      setUploadError(err.message || "Image upload failed. Check Cloudinary settings.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle open modal for adding product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory(categories[0]?.id || 'sarees');
    setProdPrice('');
    setProdSalePrice('');
    setProdDescription('');
    setProdSizes([]);
    setProdSizeStock({});
    setProdColors([]);
    setColorPickerCode('#D4A5A5');
    setColorInputName('');
    setProdDetails('');
    setProdImages([]);
    setFormError('');
    setFormSuccess('');
    setIsProductModalOpen(true);
  };

  // Handle open modal for editing product
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setProdName(product.name || '');
    setProdCategory(product.category || 'sarees');
    setProdPrice(product.price || '');
    setProdSalePrice(product.salePrice || '');
    setProdDescription(product.description || '');
    setProdSizes(product.sizes || []);
    setProdSizeStock(product.sizeStock || {});
    
    let initialColors = [];
    if (product.colors && Array.isArray(product.colors)) {
      initialColors = product.colors.map(c => {
        if (typeof c === 'string') {
          return {
            name: c,
            code: c.toLowerCase().includes('lavender') ? '#B06BB3' :
                  c.toLowerCase().includes('rose') ? '#D4A5A5' :
                  c.toLowerCase().includes('white') ? '#FFFFFF' :
                  c.toLowerCase().includes('charcoal') ? '#2D2D2D' :
                  c.toLowerCase().includes('lilac') ? '#E9D8EF' :
                  c.toLowerCase().includes('wine') ? '#8E24AA' : '#DECFE5'
          };
        }
        return c;
      });
    }
    setProdColors(initialColors);
    setColorPickerCode('#D4A5A5');
    setColorInputName('');
    
    setProdDetails(product.details ? product.details.join('\n') : '');
    setProdImages(product.images || []);
    setFormError('');
    setFormSuccess('');
    setIsProductModalOpen(true);
  };

  // Handle image file selection and Cloudinary upload (max 5 images)
  const MAX_PRODUCT_IMAGES = 5;
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (prodImages.length >= MAX_PRODUCT_IMAGES) {
      setUploadError(`Maximum ${MAX_PRODUCT_IMAGES} images allowed. Remove one to add another.`);
      e.target.value = '';
      return;
    }

    setUploadingImage(true);
    setUploadError('');

    try {
      const downloadURL = await uploadToCloudinary(file);
      setProdImages(prev => {
        if (prev.length >= MAX_PRODUCT_IMAGES) return prev; // double-guard
        return [...prev, downloadURL];
      });
      console.log("Product image uploaded to Cloudinary successfully:", downloadURL);
    } catch (err) {
      console.error("Cloudinary product upload failed:", err);
      setUploadError(err.message || "Image upload failed. Check Cloudinary settings.");
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Remove image from form preview list
  const handleRemoveImage = (indexToRemove) => {
    setProdImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle checkbox size toggles
  const handleSizeToggle = (size) => {
    setProdSizes(prev => {
      if (prev.includes(size)) {
        setProdSizeStock(stock => {
          const updated = { ...stock };
          delete updated[size];
          return updated;
        });
        return prev.filter(s => s !== size);
      } else {
        setProdSizeStock(stock => ({
          ...stock,
          [size]: 10
        }));
        return [...prev, size];
      }
    });
  };

  // Color addition handler
  const handleAddColorOption = () => {
    setFormError('');
    const name = colorInputName.trim();
    const code = colorPickerCode.trim();
    if (!name) {
      setFormError("Please enter a color name.");
      return;
    }
    const nameExists = prodColors.some(c => c.name.toLowerCase() === name.toLowerCase());
    const codeExists = prodColors.some(c => c.code.toLowerCase() === code.toLowerCase());
    if (nameExists) {
      setFormError(`The color name "${name}" has already been added.`);
      return;
    }
    if (codeExists) {
      setFormError(`The color code "${code}" has already been added.`);
      return;
    }
    setProdColors(prev => [...prev, { name, code }]);
    setColorInputName('');
  };

  // Color removal handler
  const handleRemoveColorOption = (indexToRemove) => {
    setProdColors(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Product Add/Edit Form
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!prodName.trim()) {
      setFormError("Product Name is required.");
      return;
    }
    if (!prodPrice || isNaN(prodPrice) || Number(prodPrice) <= 0) {
      setFormError("Please enter a valid base price.");
      return;
    }
    if (prodSalePrice && (isNaN(prodSalePrice) || Number(prodSalePrice) < 0)) {
      setFormError("Please enter a valid sale price.");
      return;
    }
    if (prodSizes.length === 0) {
      setFormError("At least one product size is required.");
      return;
    }
    if (prodColors.length === 0) {
      setFormError("At least one product color is required.");
      return;
    }
    if (prodImages.length === 0) {
      setFormError("At least one product image is required.");
      return;
    }

    const price = Number(prodPrice);
    const salePrice = prodSalePrice ? Number(prodSalePrice) : price;
    const discount = Math.round(((price - salePrice) / price) * 100);

    const detailsArray = prodDetails 
      ? prodDetails.split('\n').map(d => d.trim()).filter(Boolean) 
      : [];

    const sizeStockObj = {};
    prodSizes.forEach(sz => {
      const stockVal = prodSizeStock[sz];
      sizeStockObj[sz] = stockVal !== undefined && stockVal !== '' ? Number(stockVal) : 10;
    });

    const productPayload = {
      name: prodName,
      category: prodCategory,
      price: price,
      salePrice: salePrice,
      discount: discount >= 0 ? discount : 0,
      description: prodDescription,
      sizes: prodSizes,
      sizeStock: sizeStockObj,
      colors: prodColors,
      details: detailsArray,
      images: prodImages,
      rating: editingProduct ? (editingProduct.rating || 5.0) : 5.0,
      reviews: editingProduct ? (editingProduct.reviews || []) : [],
      isNew: editingProduct ? (editingProduct.isNew || false) : true,
      isFeatured: editingProduct ? (editingProduct.isFeatured || false) : false
    };

    try {
      if (editingProduct) {
        // Edit existing product document
        const prodRef = doc(db, 'products', editingProduct.id);
        await setDoc(prodRef, productPayload, { merge: true });
        setFormSuccess("Product updated successfully!");
        console.log("Product updated in Firestore:", editingProduct.id);
      } else {
        // Create new product document with auto-generated ID
        const docRef = await addDoc(collection(db, 'products'), productPayload);
        // Also write back the id property in document for local routing mapping
        await updateDoc(docRef, { id: docRef.id });
        setFormSuccess("Product created successfully!");
        console.log("New product added to Firestore:", docRef.id);
      }

      // Refresh list
      fetchProducts();
      
      // Close modal after delay
      setTimeout(() => {
        setIsProductModalOpen(false);
        setEditingProduct(null);
      }, 1000);
    } catch (err) {
      console.error("Firestore product write failed:", err);
      setFormError("Failed to save product to database. Please check Firestore security rules.");
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
      console.log("Product deleted from Firestore:", productId);
      fetchProducts();
    } catch (err) {
      console.error("Firestore product delete failed:", err);
      alert("Failed to delete product. Please check database permissions.");
    }
  };

  // Handle Update Order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      
      await updateDoc(orderRef, {
        orderStatus: newStatus,
        status: newStatus // Backwards compatibility for older items
      });
      
      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status. Check database permissions.");
    }
  };

  // Filter lists
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.id.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.email && o.email.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.customer && o.customer.name && o.customer.name.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.customer && o.customer.email && o.customer.email.toLowerCase().includes(orderSearch.toLowerCase()));

    const currentStatus = o.orderStatus || o.status || 'Pending';
    const matchesStatus = orderStatusFilter === 'All' || currentStatus === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredCategories = (categories || []).filter(c =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.id.toLowerCase().includes(categorySearch.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(categorySearch.toLowerCase()))
  );

  // If user is not authorized, show access denied gateway
  if (!isAdmin) {
    return (
      <div className="admin-access-denied container" style={{ padding: '120px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
        <div className="lock-icon-wrapper" style={{ background: '#FFF3F3', border: '1px solid #FFCDD2', padding: '24px', borderRadius: '50%', color: '#B71C1C', marginBottom: '24px' }}>
          <Lock size={48} />
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginBottom: '16px' }}>Access Denied</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', fontSize: '1rem', lineHeight: 1.6, marginBottom: '32px' }}>
          This area is restricted to Riza Fashions administrators. Please log in with admin privileges or return back to the main boutique website.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn btn-secondary" onClick={() => onNavigate('home')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Return to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout-container">
      <style>{`
        .admin-layout-container {
          display: flex;
          min-height: 100vh;
          background: var(--bg-secondary);
        }
        .admin-sidebar {
          width: 260px;
          background: #FFFFFF;
          border-right: 1px solid var(--border-light);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 100;
          box-shadow: var(--shadow-sm);
        }
        .admin-sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid var(--border-light);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .admin-sidebar-nav {
          flex: 1;
          padding: 20px 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          font-weight: 500;
          color: var(--text-muted);
          transition: all 0.2s ease;
          width: 100%;
          border-left: 4px solid transparent;
          cursor: pointer;
        }
        .sidebar-link:hover {
          background: var(--bg-secondary);
          color: var(--primary);
        }
        .sidebar-link.active {
          background: var(--bg-tertiary);
          color: var(--primary-dark);
          border-left-color: var(--primary);
          font-weight: 600;
        }
        .sidebar-link-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .admin-sidebar-footer {
          padding: 20px;
          border-top: 1px solid var(--border-light);
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--bg-secondary);
        }
        .admin-content {
          flex: 1;
          padding: 40px;
          min-height: 100vh;
          overflow-y: auto;
        }
        .mobile-admin-header {
          display: none;
        }
        .admin-sidebar-overlay {
          display: none;
        }
        @media (max-width: 1024px) {
          .admin-layout-container {
            flex-direction: column;
          }
          .admin-sidebar {
            position: fixed;
            left: -260px;
            transition: left 0.3s ease-in-out;
            height: 100vh;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
          }
          .admin-sidebar.open {
            left: 0;
          }
          .admin-content {
            padding: 24px 16px;
            margin-top: 60px;
          }
          .mobile-admin-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 60px;
            padding: 0 20px;
            background: #FFFFFF;
            border-bottom: 1px solid var(--border-light);
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 999;
            box-shadow: var(--shadow-sm);
          }
          .admin-sidebar-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.4);
            z-index: 998;
          }
        }
      `}</style>

      {/* Mobile Sticky Header */}
      <div className="mobile-admin-header">
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          style={{ display: 'flex', alignItems: 'center', color: 'var(--charcoal)' }}
        >
          <Menu size={24} />
        </button>
        <img src="/logo-purple.png" alt="Riza" style={{ height: '32px' }} />
        <span style={{ background: 'var(--primary)', color: '#FFF', fontSize: '0.65rem', fontWeight: 600, padding: '3px 8px', borderRadius: '10px' }}>ADMIN</span>
      </div>

      {/* Sidebar Drawer Overlay for Mobile */}
      {isMobileSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)}></div>
      )}

      {/* Admin Sidebar Navigation Panel */}
      <aside className={`admin-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo-purple.png" alt="Riza Fashions" style={{ height: '32px' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Playfair Display, serif', color: 'var(--charcoal)' }}>Riza Fashions</span>
          </div>
          <span style={{ display: 'inline-block', alignSelf: 'flex-start', background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
            Admin Console
          </span>
        </div>

        <nav className="admin-sidebar-nav">
          <button 
            onClick={() => { setActiveTab('products'); setIsMobileSidebarOpen(false); }}
            className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`}
          >
            <span className="sidebar-link-content">
              <Package size={18} />
              <span>Products</span>
            </span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('categories'); setIsMobileSidebarOpen(false); }}
            className={`sidebar-link ${activeTab === 'categories' ? 'active' : ''}`}
          >
            <span className="sidebar-link-content">
              <Layers size={18} />
              <span>Categories</span>
            </span>
            <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
              {categories.length}
            </span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('orders'); setIsMobileSidebarOpen(false); }}
            className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <span className="sidebar-link-content">
              <ShoppingBag size={18} />
              <span>Orders</span>
            </span>
            {orders.length > 0 && (
              <span style={{ fontSize: '0.75rem', background: 'var(--primary)', color: '#FFF', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>
                {orders.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('coupons'); setIsMobileSidebarOpen(false); }}
            className={`sidebar-link ${activeTab === 'coupons' ? 'active' : ''}`}
          >
            <span className="sidebar-link-content">
              <Tag size={18} />
              <span>Coupons</span>
            </span>
            {coupons.length > 0 && (
              <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                {coupons.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('settings'); setIsMobileSidebarOpen(false); }}
            className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <span className="sidebar-link-content">
              <Settings size={18} />
              <span>Delivery Settings</span>
            </span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Operator Profile</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }} title={currentUser.email}>
              {currentUser.email}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => onNavigate('home')} 
              style={{ padding: '8px 12px', fontSize: '0.8rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <ExternalLink size={12} /> Exit Console
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="admin-content">
        
        {/* Tab 1: Products Sub-Pane */}
        {activeTab === 'products' && (
          <div className="admin-products-pane animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div className="search-input-container" style={{ maxWidth: '360px', width: '100%' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search products by title, category, ID..." 
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} /> Add New Product
              </button>
            </div>

            {loadingProducts ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><RefreshCw className="animate-spin color-primary" size={32} /></div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ background: '#FFF', padding: '60px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3>No Products Found</h3>
                <p style={{ color: 'var(--text-muted)' }}>Try modifying your query or click Add New Product to create one.</p>
              </div>
            ) : (
              <div className="table-responsive" style={{ background: '#FFF', borderRadius: '8px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--charcoal)' }}>
                      <th style={{ padding: '16px' }}>Thumbnail</th>
                      <th style={{ padding: '16px' }}>ID / Title</th>
                      <th style={{ padding: '16px' }}>Category</th>
                      <th style={{ padding: '16px' }}>Price (Sale)</th>
                      <th style={{ padding: '16px' }}>Sizes / Colors</th>
                      <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(prod => (
                      <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-light)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '16px' }}>
                          <img src={prod.images ? prod.images[0] : ''} alt="" style={{ width: '50px', height: '64px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 600 }}>{prod.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}><code>{prod.id}</code></div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ background: 'var(--bg-secondary)', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>{prod.category}</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div>₹{prod.salePrice || prod.price}</div>
                          {prod.salePrice && prod.salePrice < prod.price && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{prod.price}</div>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--charcoal)' }}>Sizes: {prod.sizes ? prod.sizes.join(', ') : 'None'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Colors: {prod.colors ? (typeof prod.colors[0] === 'string' ? prod.colors.join(', ') : prod.colors.map(c => c.name).join(', ')) : 'None'}</div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleOpenEditModal(prod)} 
                              style={{ border: '1px solid var(--border-light)', background: '#FFF', padding: '6px', borderRadius: '4px', cursor: 'pointer', color: 'var(--primary)' }}
                              title="Edit Product"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(prod.id)} 
                              style={{ border: '1px solid var(--border-light)', background: '#FFF3F3', padding: '6px', borderRadius: '4px', cursor: 'pointer', color: '#B71C1C' }}
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Categories Sub-Pane */}
        {activeTab === 'categories' && (
          <div className="admin-categories-pane animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div className="search-input-container" style={{ maxWidth: '360px', width: '100%' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search categories by name, ID, or description..." 
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={handleOpenAddCategoryModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} /> Add New Category
              </button>
            </div>

            {!categories ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><RefreshCw className="animate-spin color-primary" size={32} /></div>
            ) : filteredCategories.length === 0 ? (
              <div style={{ background: '#FFF', padding: '60px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                <Layers size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3>No Categories Found</h3>
                <p style={{ color: 'var(--text-muted)' }}>Create a category to sort and organize your products.</p>
              </div>
            ) : (
              <div className="categories-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {filteredCategories.map(cat => (
                  <div key={cat.id} style={{ background: '#FFF', border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ position: 'relative', height: '140px', background: '#F5F5F5' }}>
                      <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {cat.offer && (
                        <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--accent)', color: 'var(--charcoal)', fontSize: '0.7rem', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {cat.offer}
                        </span>
                      )}
                      <span style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#FFF', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                        slug: {cat.id}
                      </span>
                    </div>
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <h4 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600, color: 'var(--charcoal)' }}>{cat.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, flex: 1, lineBreak: 'anywhere' }}>{cat.description || 'No description provided.'}</p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '8px' }}>
                        <button 
                          onClick={() => handleOpenEditCategoryModal(cat)} 
                          style={{ border: '1px solid var(--border-light)', background: '#FFF', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                        >
                          <Edit size={12} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)} 
                          style={{ border: '1px solid var(--border-light)', background: '#FFF3F3', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', color: '#B71C1C', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Delivery Settings Pane */}
        {activeTab === 'settings' && (
          <div className="admin-settings-pane animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', margin: 0, color: 'var(--charcoal)' }}>Delivery & Shipping Settings</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configure base rules and Tamil Nadu district-level shipping fees.</p>
              </div>
              
              <button 
                className="btn btn-primary" 
                onClick={handleSaveDeliverySettings} 
                disabled={savingSettings}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {savingSettings ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
                {savingSettings ? 'Saving Settings...' : 'Save Settings'}
              </button>
            </div>

            {settingsSuccess && (
              <div style={{ background: '#F4FAF6', border: '1px solid #C8E6C9', color: '#2E7D32', padding: '16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '24px', fontWeight: 500 }}>
                {settingsSuccess}
              </div>
            )}

            {settingsError && (
              <div style={{ background: '#FFF8F8', border: '1px solid #FFCDD2', color: '#B71C1C', padding: '16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '24px', fontWeight: 500 }}>
                {settingsError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              {/* General Rule Configuration */}
              <div style={{ background: '#FFF', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <Settings size={18} className="color-primary" />
                  General Shipping Rules
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-field">
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Default Shipping Fee (Other states / fallback)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-light)', padding: '10px 14px', borderRadius: '6px', background: 'var(--bg-secondary)' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={baseDeliveryCharge}
                        onChange={(e) => setBaseDeliveryCharge(e.target.value)}
                        style={{ border: 'none', padding: 0, background: 'transparent', width: '100%', fontSize: '0.95rem' }}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Free Shipping Threshold (Subtotal threshold)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-light)', padding: '10px 14px', borderRadius: '6px', background: 'var(--bg-secondary)' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={freeThreshold}
                        onChange={(e) => setFreeThreshold(e.target.value)}
                        style={{ border: 'none', padding: 0, background: 'transparent', width: '100%', fontSize: '0.95rem' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Orders with subtotal exceeding this amount receive free shipping.</span>
                  </div>
                </div>
              </div>

              {/* Bulk Update Controls */}
              <div style={{ background: '#FFF', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <Layers size={18} className="color-primary" />
                  Bulk Adjust District Charges
                </h3>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                  Quickly set the delivery fee for all 38 Tamil Nadu districts to the same base amount. You can still modify individual districts afterward.
                </p>

                <div className="form-field" style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Bulk Target Shipping Fee</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-light)', padding: '10px 14px', borderRadius: '6px', background: 'var(--bg-secondary)' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="e.g. 90"
                        value={bulkChargeVal}
                        onChange={(e) => setBulkChargeVal(e.target.value)}
                        style={{ border: 'none', padding: 0, background: 'transparent', width: '100%', fontSize: '0.95rem' }}
                      />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleBulkUpdateCharges}
                    style={{ height: '44px', padding: '0 20px', whiteSpace: 'nowrap' }}
                  >
                    Apply Bulk Fee
                  </button>
                </div>
              </div>
            </div>

            {/* Tamil Nadu Districts Charges editor grid */}
            <div style={{ background: '#FFF', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Tamil Nadu Districts Shipping Tariffs</h3>
                
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search district..." 
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  style={{ maxWidth: '240px' }}
                />
              </div>

              {filteredTnDistricts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  No districts match your search query.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                  {filteredTnDistricts.map(district => {
                    const slug = district.toLowerCase();
                    const currentCharge = districtCharges[slug] !== undefined ? districtCharges[slug] : 90;
                    return (
                      <div key={slug} style={{ display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid var(--border-light)', padding: '12px 16px', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--charcoal)' }}>{district}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-light)', padding: '6px 10px', borderRadius: '6px', background: '#FFF' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>₹</span>
                          <input 
                            type="number" 
                            value={currentCharge}
                            onChange={(e) => handleUpdateDistrictCharge(slug, e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', fontWeight: 500 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Coupons Pane */}
        {activeTab === 'coupons' && (
          <div className="admin-coupons-pane animate-fade" style={{ padding: '20px' }}>
            
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', margin: 0, color: 'var(--charcoal)' }}>Coupon Code Management</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Create, edit, toggle, and view usage statistics for discount coupons.</p>
              </div>
              <button 
                className="btn btn-primary"
                onClick={handleOpenAddCouponModal}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={16} />
                Add New Coupon
              </button>
            </div>

            {/* Analytics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div style={{ background: '#FFF', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Total Coupons</span>
                <strong style={{ fontSize: '1.8rem', color: 'var(--charcoal)' }}>{coupons.length}</strong>
              </div>
              <div style={{ background: '#FFF', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Active Coupons</span>
                <strong style={{ fontSize: '1.8rem', color: '#2E7D32' }}>{coupons.filter(c => c.active).length}</strong>
              </div>
              <div style={{ background: '#FFF', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Expired Coupons</span>
                <strong style={{ fontSize: '1.8rem', color: '#B71C1C' }}>{coupons.filter(c => c.expiryDate && new Date(c.expiryDate) < new Date()).length}</strong>
              </div>
              <div style={{ background: '#FFF', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Most Used Coupon</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--primary-dark)', display: 'block', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {(() => {
                    let mostUsed = 'N/A';
                    let maxUsed = 0;
                    coupons.forEach(c => {
                      if ((c.usedCount || 0) > maxUsed) {
                        maxUsed = c.usedCount;
                        mostUsed = `${c.code} (${c.usedCount} uses)`;
                      }
                    });
                    return mostUsed;
                  })()}
                </strong>
              </div>
            </div>

            {/* List and Search Card */}
            <div style={{ background: '#FFF', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              
              {/* Search bar */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search coupons by code..." 
                  value={couponSearch}
                  onChange={(e) => setCouponSearch(e.target.value)}
                  style={{ maxWidth: '360px', width: '100%' }}
                />
              </div>

              {/* Table wrapper */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                      <th style={{ padding: '12px 16px' }}>Code</th>
                      <th style={{ padding: '12px 16px' }}>Discount</th>
                      <th style={{ padding: '12px 16px' }}>Min Order</th>
                      <th style={{ padding: '12px 16px' }}>Max Discount</th>
                      <th style={{ padding: '12px 16px' }}>Expiry Date</th>
                      <th style={{ padding: '12px 16px' }}>Usage Limit</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingCoupons ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                          <RefreshCw className="animate-spin inline-block mr-2" size={16} /> Loading coupons list...
                        </td>
                      </tr>
                    ) : coupons.filter(c => c.code.toLowerCase().includes(couponSearch.toLowerCase())).length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                          No coupons found. Click 'Add New Coupon' to create one.
                        </td>
                      </tr>
                    ) : coupons
                        .filter(c => c.code.toLowerCase().includes(couponSearch.toLowerCase()))
                        .map(coupon => {
                          const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                          const formattedExpiry = coupon.expiryDate 
                            ? new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : 'No Expiry';
                          return (
                            <tr key={coupon.code} style={{ borderBottom: '1px solid var(--border-light)', fontSize: '0.9rem', color: 'var(--charcoal)' }}>
                              <td style={{ padding: '16px', fontWeight: 600 }}>{coupon.code}</td>
                              <td style={{ padding: '16px' }}>
                                {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                              </td>
                              <td style={{ padding: '16px' }}>
                                {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount}` : 'No Min'}
                              </td>
                              <td style={{ padding: '16px' }}>
                                {coupon.type === 'percentage' && coupon.maxDiscount > 0 ? `₹${coupon.maxDiscount}` : 'N/A'}
                              </td>
                              <td style={{ padding: '16px' }}>
                                <span style={{ color: isExpired ? '#B71C1C' : 'inherit' }}>{formattedExpiry}</span>
                              </td>
                              <td style={{ padding: '16px' }}>
                                {coupon.usedCount || 0} / {coupon.totalLimit > 0 ? coupon.totalLimit : '∞'}
                              </td>
                              <td style={{ padding: '16px' }}>
                                {isExpired ? (
                                  <span style={{ background: '#FFF3F3', color: '#B71C1C', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Expired</span>
                                ) : coupon.active ? (
                                  <span style={{ background: '#E8F5E9', color: '#2E7D32', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Active</span>
                                ) : (
                                  <span style={{ background: '#ECEFF1', color: '#546E7A', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Inactive</span>
                                )}
                              </td>
                              <td style={{ padding: '16px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '8px' }}>
                                  <button 
                                    onClick={() => handleOpenEditCouponModal(coupon)} 
                                    style={{ border: '1px solid var(--border-light)', background: '#FFF', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                                  >
                                    <Edit size={12} /> Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteCoupon(coupon.code)} 
                                    style={{ border: '1px solid var(--border-light)', background: '#FFF3F3', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', color: '#B71C1C', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                                  >
                                    <Trash2 size={12} /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Orders Sub-Pane */}
        {activeTab === 'orders' && (
          <div className="admin-orders-pane animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div className="search-input-container" style={{ maxWidth: '360px', width: '100%' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search orders by ID, name, email..." 
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>
              <div className="filter-input-container" style={{ maxWidth: '200px', width: '100%' }}>
                <select
                  className="form-input"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {loadingOrders ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><RefreshCw className="animate-spin color-primary" size={32} /></div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ background: '#FFF', padding: '60px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3>No Orders Found</h3>
                <p style={{ color: 'var(--text-muted)' }}>No purchases have been logged in the system yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredOrders.map(order => {
                  const isExpanded = !!expandedOrders[order.id];
                  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : order.date;
                  const orderTime = order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  const totalItems = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
                  const currentStatus = order.orderStatus || order.status || 'Pending';

                  return (
                    <div 
                      key={order.id} 
                      style={{ 
                        background: '#FFF', 
                        borderRadius: '8px', 
                        border: '1px solid var(--border-light)', 
                        overflow: 'hidden', 
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {/* Collapsed Header Bar */}
                      <div 
                        onClick={() => toggleOrderExpand(order.id)}
                        style={{ 
                          padding: '16px 20px', 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          flexWrap: 'wrap', 
                          gap: '12px',
                          cursor: 'pointer',
                          background: isExpanded ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                          borderBottom: isExpanded ? '1px solid var(--border-light)' : 'none',
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: 'var(--charcoal)', fontSize: '0.95rem' }}>
                            <code>{order.orderId}</code>
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {orderDate} {orderTime && `@ ${orderTime}`}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
                            {order.customerName || order.customer?.name || 'Guest'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--charcoal)', fontSize: '0.95rem' }}>
                            ₹{order.totalAmount !== undefined ? order.totalAmount : (order.pricing ? order.pricing.total : 0)}
                          </span>
                          <span style={{ fontSize: '0.8rem', background: '#FFF', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                          </span>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            background: currentStatus === 'Delivered' ? '#E8F5E9' : currentStatus === 'Cancelled' ? '#FFEBEE' : '#FFF3E0',
                            color: currentStatus === 'Delivered' ? '#2E7D32' : currentStatus === 'Cancelled' ? '#C62828' : '#EF6C00',
                            border: `1px solid ${currentStatus === 'Delivered' ? '#C8E6C9' : currentStatus === 'Cancelled' ? '#FFCDD2' : '#FFE0B2'}`
                          }}>
                            {currentStatus}
                          </span>
                          <button style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details Body */}
                      {isExpanded && (
                        <div className="animate-fade" style={{ padding: '24px', background: '#FFF' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                            {/* Billing & Shipping Details Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <h4 style={{ fontSize: '0.95rem', color: 'var(--charcoal)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={16} /> Delivery & Billing
                              </h4>
                              <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--charcoal)' }}>
                                <div style={{ marginBottom: '4px' }}><strong>Name:</strong> {order.customerName || order.customer?.name || 'Guest'}</div>
                                <div style={{ marginBottom: '4px' }}><strong>Email:</strong> {order.email || order.customer?.email || 'N/A'}</div>
                                <div style={{ marginBottom: '4px' }}><strong>Phone:</strong> {order.phone || order.customer?.phone || 'N/A'}</div>
                                <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
                                  <strong>Delivery Address:</strong><br />
                                  {order.shippingAddress || (order.shipping ? `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.state} - ${order.shipping.pinCode}` : 'N/A')}
                                </div>
                                {order.notes && (
                                  <div style={{ marginTop: '8px', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '4px', fontSize: '0.8rem', borderLeft: '3px solid var(--primary)', color: 'var(--text-main)' }}>
                                    <strong>Customer Notes:</strong> {order.notes}
                                  </div>
                                )}
                                {order.razorpayPaymentId && (
                                  <div style={{ marginTop: '8px', color: 'var(--primary-dark)', fontWeight: 600, fontSize: '0.8rem' }}>
                                    🛡️ Razorpay Payment ID: <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{order.razorpayPaymentId}</code>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Items Summary Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <h4 style={{ fontSize: '0.95rem', color: 'var(--charcoal)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Package size={16} /> Ordered Items ({totalItems})
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {order.items && order.items.map((item, idx) => (
                                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                                    <img src={item.images ? item.images[0] : ''} alt="" style={{ width: '40px', height: '52px', objectFit: 'cover', borderRadius: '4px' }} />
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: 600, color: 'var(--charcoal)' }}>{item.name}</div>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        Qty: {item.quantity} | Size: {item.selectedSize} {item.selectedColor ? `| Color: ${item.selectedColor}` : ''}
                                      </div>
                                    </div>
                                    <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>₹{(item.salePrice || item.price) * item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Financial Summary & Order Status Column */}
                            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <h4 style={{ fontSize: '0.95rem', color: 'var(--charcoal)', margin: 0 }}>Summary & Action</h4>
                              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span>Subtotal:</span>
                                  <span>₹{order.subtotal !== undefined ? order.subtotal : (order.pricing ? order.pricing.subtotal : 0)}</span>
                                </div>
                                {order.pricing && order.pricing.discount > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32' }}>
                                    <span>Coupon Discount ({order.pricing.coupon}):</span>
                                    <span>-₹{order.pricing.discount}</span>
                                  </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span>Shipping Fee:</span>
                                  <span>
                                    {order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge !== undefined ? order.shippingCharge : (order.pricing ? order.pricing.shipping : 0)}`}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span>Payment Status:</span>
                                  <span style={{ color: order.paymentStatus === 'Paid' ? '#2E7D32' : '#E65100', fontWeight: 600 }}>
                                    {order.paymentStatus || 'Paid'}
                                  </span>
                                </div>
                                <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem', color: 'var(--charcoal)' }}>
                                  <span>Total Paid Amount:</span>
                                  <span>₹{order.totalAmount !== undefined ? order.totalAmount : (order.pricing ? order.pricing.total : 0)}</span>
                                </div>
                              </div>

                              <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-medium)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>UPDATE ORDER STATUS</label>
                                <select 
                                  value={currentStatus}
                                  onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-medium)',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    background: '#FFF',
                                    cursor: 'pointer',
                                    color: currentStatus === 'Delivered' ? '#2E7D32' : currentStatus === 'Cancelled' ? '#C62828' : 'var(--primary-dark)',
                                    width: '100%'
                                  }}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Packed">Packed</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product ADD / EDIT Modal Drawer */}
      {isProductModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', zIndex: 1100, top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)' }} onClick={() => setIsProductModalOpen(false)}>
          <form 
            onSubmit={handleProductSubmit} 
            className="admin-product-modal animate-zoom" 
            style={{ 
              background: '#FFF', 
              width: 'min(900px, 95vw)', 
              maxHeight: '90vh', 
              borderRadius: '12px', 
              border: '1px solid var(--border-light)', 
              position: 'relative', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden' 
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div style={{ padding: '24px 30px 16px 30px', borderBottom: '1px solid var(--border-light)', position: 'relative', background: '#FFF', flexShrink: 0 }}>
              <button 
                type="button"
                onClick={() => setIsProductModalOpen(false)} 
                style={{ position: 'absolute', right: '24px', top: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', margin: 0 }}>
                {editingProduct ? 'Edit Product Catalog' : 'Add New Product'}
              </h2>
            </div>

            {/* Scrollable Body Container */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {formError && (
                <div style={{ background: '#FFF8F8', border: '1px solid #FFCDD2', color: '#B71C1C', padding: '12px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '10px' }}>
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div style={{ background: '#F4FAF6', border: '1px solid #C8E6C9', color: '#2E7D32', padding: '12px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '10px' }}>
                  {formSuccess}
                </div>
              )}

              <div className="form-field">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Product Title / Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Meera Lavender Organza Saree"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div className="form-field">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Category *</label>
                  <select 
                    className="form-input" 
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Base Price (INR) *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 3999"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-field">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Sale Price (INR - Optional)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 1999"
                    value={prodSalePrice}
                    onChange={(e) => setProdSalePrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Product Variants Section */}
              <div style={{ border: '1px solid var(--border-light)', padding: '20px', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--charcoal)', marginBottom: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>Product Variants</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {/* Sizes Variant Group */}
                  <div className="form-field">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 600 }}>Available Sizes *</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {sizeOptions.map(sz => {
                        const isChecked = prodSizes.includes(sz);
                        return (
                          <div key={sz} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', background: isChecked ? '#FAF7FB' : '#FFF', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-light)', minWidth: '80px', userSelect: 'none' }}>
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => handleSizeToggle(sz)}
                                style={{ cursor: 'pointer' }}
                              />
                              {sz}
                            </label>
                            {isChecked && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock Qty:</span>
                                <input 
                                  type="number" 
                                  min="0" 
                                  placeholder="10"
                                  value={prodSizeStock[sz] !== undefined ? prodSizeStock[sz] : 10}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? '' : Number(e.target.value);
                                    setProdSizeStock(prev => ({ ...prev, [sz]: val }));
                                  }}
                                  style={{ width: '60px', padding: '4px 6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-medium)', background: '#FFF' }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Colors Variant Group */}
                  <div className="form-field">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 600 }}>Available Colors *</label>
                    
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                      <input 
                        type="color" 
                        value={colorPickerCode}
                        onChange={(e) => setColorPickerCode(e.target.value)}
                        style={{ width: '38px', height: '34px', padding: '1px', border: '1px solid var(--border-medium)', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                        title="Choose Color"
                      />
                      <input 
                        type="text" 
                        placeholder="e.g. Rose Gold"
                        value={colorInputName}
                        onChange={(e) => setColorInputName(e.target.value)}
                        style={{ flex: 1, padding: '6px 10px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid var(--border-medium)', background: '#FFF' }}
                      />
                      <button 
                        type="button" 
                        onClick={handleAddColorOption}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, minWidth: '80px' }}
                      >
                        Add
                      </button>
                    </div>

                    <div style={{ border: '1px solid var(--border-light)', borderRadius: '6px', padding: '10px', background: '#FFF', minHeight: '80px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Preview</span>
                      {prodColors.length === 0 ? (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontStyle: 'italic' }}>No colors added.</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {prodColors.map((col, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#FAF7FB', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: col.code, border: '1px solid rgba(0,0,0,0.15)', display: 'inline-block' }} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--charcoal)' }}>{col.name}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>({col.code})</span>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveColorOption(idx)}
                                style={{ background: 'none', border: 'none', color: '#B71C1C', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                                title="Remove"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Product Description</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="Brief overview description of the drape, fabric, styling tips..."
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Specs / Details (One detail per line)</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="e.g. Fabric: Premium Organza Silk&#10;Work: Embroidered Silver Zari Border&#10;Care: Dry clean only"
                  value={prodDetails}
                  onChange={(e) => setProdDetails(e.target.value)}
                />
              </div>

              {/* Image uploading section — max 5 images */}
              <div className="form-field" style={{ border: `1px dashed ${prodImages.length >= 5 ? '#C8E6C9' : 'var(--border-light)'}`, padding: '16px', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>Product Images (Cloudinary Upload) *</label>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: prodImages.length >= 5 ? '#E8F5E9' : prodImages.length > 0 ? '#FFF3E0' : 'var(--bg-secondary)',
                    color: prodImages.length >= 5 ? '#2E7D32' : prodImages.length > 0 ? '#E65100' : 'var(--text-muted)',
                    border: `1px solid ${prodImages.length >= 5 ? '#C8E6C9' : prodImages.length > 0 ? '#FFE0B2' : 'var(--border-light)'}`
                  }}>
                    {prodImages.length} / 5 images
                  </span>
                </div>

                {/* Image slots grid */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {/* Filled image thumbnails */}
                  {prodImages.map((imgUrl, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '64px', height: '80px', borderRadius: '6px', overflow: 'hidden', border: '2px solid var(--primary)', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                      <img src={imgUrl} alt={`Product image ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.45)', padding: '2px', textAlign: 'center', fontSize: '0.6rem', color: '#FFF', fontWeight: 600 }}>
                        {idx === 0 ? 'COVER' : `#${idx + 1}`}
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{ position: 'absolute', top: '2px', right: '2px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(183,28,28,0.85)', border: 'none', color: '#FFF', borderRadius: '50%', cursor: 'pointer' }}
                        title="Remove image"
                      >
                        <X size={9} />
                      </button>
                    </div>
                  ))}

                  {/* Uploading spinner slot */}
                  {uploadingImage && (
                    <div style={{ width: '64px', height: '80px', border: '2px dashed var(--primary)', borderRadius: '6px', background: '#FFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <RefreshCw size={18} className="animate-spin color-primary" />
                      <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>uploading</span>
                    </div>
                  )}

                  {/* Empty placeholder slots up to 5 */}
                  {!uploadingImage && Array.from({ length: Math.max(0, 5 - prodImages.length) }).map((_, i) => (
                    <div key={`empty-${i}`} style={{ width: '64px', height: '80px', border: '1px dashed var(--border-light)', borderRadius: '6px', background: '#FFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: 0.5 }}>
                      <Upload size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{prodImages.length === 0 && i === 0 ? 'cover' : 'image'}</span>
                    </div>
                  ))}
                </div>

                {uploadError && (
                  <div style={{ color: '#B71C1C', fontSize: '0.78rem', marginBottom: '10px', background: '#FFF8F8', border: '1px solid #FFCDD2', padding: '8px 12px', borderRadius: '4px' }}>{uploadError}</div>
                )}

                {prodImages.length < 5 ? (
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: uploadingImage ? 'not-allowed' : 'pointer', background: uploadingImage ? 'var(--bg-secondary)' : '#FFF', border: '1px solid var(--border-light)', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, opacity: uploadingImage ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <Upload size={14} /> {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      style={{ display: 'none' }}
                    />
                  </label>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#E8F5E9', border: '1px solid #C8E6C9', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#2E7D32' }}>
                    <Check size={14} /> Maximum 5 images reached
                  </div>
                )}

                <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  First image is used as the cover photo. Max 5 images per product.
                </p>
              </div>
            </div>

            {/* Sticky Footer */}
            <div style={{ position: 'sticky', bottom: 0, background: '#FFF', borderTop: '1px solid var(--border-light)', padding: '16px 30px 24px 30px', display: 'flex', gap: '12px', zIndex: 10, flexShrink: 0 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploadingImage}>
                {editingProduct ? 'Save Catalog Changes' : 'Create Product'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsProductModalOpen(false)} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category ADD / EDIT Modal Drawer */}
      {isCategoryModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', zIndex: 1100, top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)' }} onClick={() => setIsCategoryModalOpen(false)}>
          <form 
            onSubmit={handleCategorySubmit} 
            className="admin-product-modal animate-zoom" 
            style={{ 
              background: '#FFF', 
              width: 'min(550px, 95vw)', 
              maxHeight: '90vh', 
              borderRadius: '12px', 
              border: '1px solid var(--border-light)', 
              position: 'relative', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden' 
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div style={{ padding: '24px 30px 16px 30px', borderBottom: '1px solid var(--border-light)', position: 'relative', background: '#FFF', flexShrink: 0 }}>
              <button 
                type="button"
                onClick={() => setIsCategoryModalOpen(false)} 
                style={{ position: 'absolute', right: '24px', top: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', margin: 0 }}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
            </div>

            {/* Scrollable Body Container */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {formError && (
                <div style={{ background: '#FFF8F8', border: '1px solid #FFCDD2', color: '#B71C1C', padding: '12px', borderRadius: '4px', fontSize: '0.85rem' }}>
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div style={{ background: '#F4FAF6', border: '1px solid #C8E6C9', color: '#2E7D32', padding: '12px', borderRadius: '4px', fontSize: '0.85rem' }}>
                  {formSuccess}
                </div>
              )}

              <div className="form-field">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Category Slug / ID *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. sarees (lowercase, no spaces)"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  disabled={!!editingCategory}
                  required 
                />
              </div>

              <div className="form-field">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Category Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Sarees"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-field">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Offer Tag / Badge (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Flat 10% OFF, New Season"
                  value={catOffer}
                  onChange={(e) => setCatOffer(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Description</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="Brief description of the category..."
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                />
              </div>

              {/* Image uploading section */}
              <div className="form-field" style={{ border: '1px dashed var(--border-light)', padding: '16px', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Category Image *</label>
                
                {catImage && (
                  <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-light)', marginBottom: '12px' }}>
                    <img src={catImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                {uploadingImage && (
                  <div style={{ width: '80px', height: '80px', border: '1px solid var(--border-light)', borderRadius: '4px', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <RefreshCw size={18} className="animate-spin color-primary" />
                  </div>
                )}

                {uploadError && (
                  <div style={{ color: '#B71C1C', fontSize: '0.75rem', marginBottom: '8px' }}>{uploadError}</div>
                )}

                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Or paste image URL directly..."
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                  />
                  <label style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#FFF', border: '1px solid var(--border-light)', padding: '8px 16px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500 }}>
                    <Upload size={14} /> Upload Image File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleCategoryImageUpload} 
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div style={{ position: 'sticky', bottom: 0, background: '#FFF', borderTop: '1px solid var(--border-light)', padding: '16px 30px 24px 30px', display: 'flex', gap: '12px', zIndex: 10, flexShrink: 0 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploadingImage}>
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(false)} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isCouponModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', zIndex: 1100, top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)' }} onClick={() => setIsCouponModalOpen(false)}>
          <form 
            onSubmit={handleCouponSubmit} 
            className="admin-product-modal animate-zoom" 
            style={{ 
              background: '#FFF', 
              width: 'min(600px, 95vw)', 
              maxHeight: '90vh', 
              borderRadius: '12px', 
              border: '1px solid var(--border-light)', 
              position: 'relative', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden' 
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div style={{ padding: '24px 30px 16px 30px', borderBottom: '1px solid var(--border-light)', position: 'relative', background: '#FFF', flexShrink: 0 }}>
              <button 
                type="button"
                onClick={() => setIsCouponModalOpen(false)} 
                style={{ position: 'absolute', right: '24px', top: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', margin: 0 }}>
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
            </div>

            {/* Scrollable Body Container */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {formError && (
                <div style={{ background: '#FFF8F8', border: '1px solid #FFCDD2', color: '#B71C1C', padding: '12px', borderRadius: '4px', fontSize: '0.85rem' }}>
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div style={{ background: '#F4FAF6', border: '1px solid #C8E6C9', color: '#2E7D32', padding: '12px', borderRadius: '4px', fontSize: '0.85rem' }}>
                  {formSuccess}
                </div>
              )}

              <div className="form-field">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Coupon Code *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. WELCOME10 (letters & numbers only)"
                  value={cpCode}
                  onChange={(e) => setCpCode(e.target.value)}
                  disabled={!!editingCoupon}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Discount Type *</label>
                  <select 
                    className="form-input" 
                    value={cpType}
                    onChange={(e) => setCpType(e.target.value)}
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Discount Value *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 10 or 150"
                    value={cpValue}
                    onChange={(e) => setCpValue(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Min Order Amount (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 500 (0 for no limit)"
                    value={cpMinOrderAmount}
                    onChange={(e) => setCpMinOrderAmount(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Max Discount Amount (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 200 (0 for no limit)"
                    value={cpMaxDiscount}
                    onChange={(e) => setCpMaxDiscount(e.target.value)}
                    disabled={cpType !== 'percentage'}
                  />
                </div>
              </div>

              <div className="form-field">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Expiry Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="form-input" 
                  value={cpExpiryDate}
                  onChange={(e) => setCpExpiryDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Total Usage Limit</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 100 (0 for unlimited)"
                    value={cpTotalLimit}
                    onChange={(e) => setCpTotalLimit(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Per User Limit</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 1 (0 for unlimited)"
                    value={cpPerUserLimit}
                    onChange={(e) => setCpPerUserLimit(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <input 
                  type="checkbox" 
                  id="cpActiveCheckbox"
                  checked={cpActive}
                  onChange={(e) => setCpActive(e.target.checked)}
                  style={{ accentColor: 'var(--primary)', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="cpActiveCheckbox" style={{ fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>Active (Enable coupon usage)</label>
              </div>

            </div>

            {/* Sticky Footer */}
            <div style={{ position: 'sticky', bottom: 0, background: '#FFF', borderTop: '1px solid var(--border-light)', padding: '16px 30px 24px 30px', display: 'flex', gap: '12px', zIndex: 10, flexShrink: 0 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {editingCoupon ? 'Save Changes' : 'Create Coupon'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsCouponModalOpen(false)} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
