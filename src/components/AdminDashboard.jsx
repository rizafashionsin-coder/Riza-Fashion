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
  FileText
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
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminDashboard({ currentUser, onNavigate }) {
  // Access control check
  const isAdmin = currentUser && currentUser.isAdmin;

  // Active tab state: products | orders
  const [activeTab, setActiveTab] = useState('products');

  // Firestore collections states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Search and filter states
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');


  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states for Add/Edit product
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('sarees');
  const [prodPrice, setProdPrice] = useState('');
  const [prodSalePrice, setProdSalePrice] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodSizes, setProdSizes] = useState(['Free Size']);
  const [prodColors, setProdColors] = useState('');
  const [prodDetails, setProdDetails] = useState('');
  const [prodImages, setProdImages] = useState([]);
  
  // Image uploading states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Form error/success alerts
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Available categories options
  const categoriesList = [
    { value: 'sarees', label: 'Sarees' },
    { value: 'kurtis', label: 'Kurtis' },
    { value: 'maxi', label: 'Maxi Dresses' },
    { value: 'nightwear', label: 'Night Wears' },
    { value: 'hijabs', label: 'Hijabs' },
    { value: 'accessories', label: 'Accessories' }
  ];

  // Sizes choices
  const sizeOptions = ['S', 'M', 'L', 'XL', 'Free Size'];

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

      return () => unsubscribe();
    }
  }, [isAdmin]);

  // Lock body scroll when modal is open to satisfy UI accessibility requirements
  useEffect(() => {
    if (isProductModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isProductModalOpen]);


  // Handle open modal for adding product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory('sarees');
    setProdPrice('');
    setProdSalePrice('');
    setProdDescription('');
    setProdSizes(['Free Size']);
    setProdColors('');
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
    setProdSizes(product.sizes || ['Free Size']);
    setProdColors(product.colors ? product.colors.join(', ') : '');
    setProdDetails(product.details ? product.details.join('\n') : '');
    setProdImages(product.images || []);
    setFormError('');
    setFormSuccess('');
    setIsProductModalOpen(true);
  };

  // Handle image file selection and Firebase Storage upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError('');

    try {
      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `products/${timestamp}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setProdImages(prev => [...prev, downloadURL]);
      console.log("File uploaded successfully, download URL obtained:", downloadURL);
    } catch (err) {
      console.error("Firebase Storage upload failed:", err);
      setUploadError("Image upload failed. Check Storage permissions and connection.");
    } finally {
      setUploadingImage(false);
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
        return prev.filter(s => s !== size);
      } else {
        return [...prev, size];
      }
    });
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
    if (prodImages.length === 0) {
      setFormError("At least one product image is required.");
      return;
    }

    const price = Number(prodPrice);
    const salePrice = prodSalePrice ? Number(prodSalePrice) : price;
    const discount = Math.round(((price - salePrice) / price) * 100);

    const colorsArray = prodColors 
      ? prodColors.split(',').map(c => c.trim()).filter(Boolean) 
      : [];
    const detailsArray = prodDetails 
      ? prodDetails.split('\n').map(d => d.trim()).filter(Boolean) 
      : [];

    const productPayload = {
      name: prodName,
      category: prodCategory,
      price: price,
      salePrice: salePrice,
      discount: discount >= 0 ? discount : 0,
      description: prodDescription,
      sizes: prodSizes,
      colors: colorsArray,
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
    <div className="admin-dashboard-wrapper animate-fade" style={{ background: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Dashboard Top Header */}
      <header className="admin-dashboard-header" style={{ background: '#FFF', borderBottom: '1px solid var(--border-light)', padding: '20px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src="/logo-purple.png" alt="Riza Fashions Admin" style={{ height: '40px' }} />
            <span style={{ background: 'var(--primary)', color: '#FFF', fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '12px' }}>ADMIN CONSOLE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Logged in: <strong>{currentUser.email}</strong>
            </span>
            <button className="btn btn-secondary" onClick={() => onNavigate('home')} style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowLeft size={14} /> Exit Admin
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Selector Navigation */}
      <div className="container" style={{ marginTop: '30px' }}>
        <div className="admin-tabs" style={{ display: 'flex', borderBottom: '2px solid var(--border-light)', gap: '24px', marginBottom: '30px' }}>
          <button 
            onClick={() => setActiveTab('products')} 
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: '12px 6px', 
              fontSize: '1rem', 
              fontWeight: 600, 
              color: activeTab === 'products' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'products' ? '3px solid var(--primary)' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '-2px'
            }}
          >
            <Package size={18} /> Manage Products
          </button>
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: '12px 6px', 
              fontSize: '1rem', 
              fontWeight: 600, 
              color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'orders' ? '3px solid var(--primary)' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '-2px'
            }}
          >
            <ShoppingBag size={18} /> Manage Orders ({orders.length})
          </button>
        </div>

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
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Colors: {prod.colors ? prod.colors.join(', ') : 'None'}</div>
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

        {/* Tab 2: Orders Sub-Pane */}
        {activeTab === 'orders' && (
          <div className="admin-orders-pane animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div className="search-input-container" style={{ maxWidth: '360px', width: '100%' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search orders by Order ID, name, email..." 
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredOrders.map(order => (
                  <div key={order.id} style={{ background: '#FFF', borderRadius: '8px', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    {/* Order header row */}
                    <div style={{ background: 'var(--bg-secondary)', padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--charcoal)', marginRight: '8px' }}><code>{order.orderId}</code></span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : order.date}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
                        <select 
                          value={order.orderStatus || order.status || 'Pending'}
                          onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-light)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            background: '#FFF',
                            color: (order.orderStatus || order.status) === 'Delivered' ? '#2E7D32' : (order.orderStatus || order.status) === 'Cancelled' ? '#C62828' : 'var(--primary)'
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

                    {/* Order details body grid */}
                    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                      {/* Customer & Shipping Details */}
                      <div>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--charcoal)', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px', marginBottom: '10px' }}>Billing & Delivery</h4>
                        <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--charcoal)' }}>
                          <div><strong>Name:</strong> {order.customerName || order.customer?.name || 'Guest'}</div>
                          <div><strong>Email:</strong> {order.email || order.customer?.email || 'N/A'}</div>
                          <div><strong>Phone:</strong> {order.phone || order.customer?.phone || 'N/A'}</div>
                          <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
                            <strong>Address:</strong><br />
                            {order.shippingAddress || (order.shipping ? `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.state} - ${order.shipping.pinCode}` : 'N/A')}
                          </div>
                          {order.notes && (
                            <div style={{ marginTop: '8px', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '4px', fontSize: '0.8rem', borderLeft: '3px solid var(--primary)' }}>
                              <strong>Notes:</strong> {order.notes}
                            </div>
                          )}
                          {order.razorpayPaymentId && (
                            <div style={{ marginTop: '8px', color: 'var(--primary)', fontWeight: 600 }}>
                              🛡️ Razorpay ID: <code style={{ fontSize: '0.8rem' }}>{order.razorpayPaymentId}</code>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items List */}
                      <div>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--charcoal)', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px', marginBottom: '10px' }}>Items Summary</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {order.items && order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                              <img src={item.images ? item.images[0] : ''} alt="" style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600 }}>{item.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  Qty: {item.quantity} | Size: {item.selectedSize} {item.selectedColor ? `| Color: ${item.selectedColor}` : ''}
                                </div>
                              </div>
                              <span style={{ fontWeight: 600 }}>₹{(item.salePrice || item.price) * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financials Totals */}
                      <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '6px', height: 'fit-content' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--charcoal)', marginBottom: '12px' }}>Order Totals</h4>
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
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                            <span>Payment Status:</span>
                            <span style={{ color: order.paymentStatus === 'Paid' ? '#2E7D32' : '#E65100', fontWeight: 600 }}>
                              {order.paymentStatus || 'Paid'}
                            </span>
                          </div>
                          <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }}></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem', color: 'var(--charcoal)' }}>
                            <span>Paid Total:</span>
                            <span>₹{order.totalAmount !== undefined ? order.totalAmount : (order.pricing ? order.pricing.total : 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
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
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Product Sizes</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {sizeOptions.map(sz => {
                      const isChecked = prodSizes.includes(sz);
                      return (
                        <label key={sz} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', background: isChecked ? 'var(--bg-secondary)' : '#FFF', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => handleSizeToggle(sz)}
                            style={{ cursor: 'pointer' }}
                          />
                          {sz}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
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

              <div className="form-field">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Colors (Comma-separated)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Lavender Purple, Rose Gold, Pastel Lilac"
                  value={prodColors}
                  onChange={(e) => setProdColors(e.target.value)}
                />
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

              {/* Image uploading section */}
              <div className="form-field" style={{ border: '1px dashed var(--border-light)', padding: '16px', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Product Images (Firebase Storage Upload) *</label>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {prodImages.map((imgUrl, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '60px', height: '76px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                      <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{ position: 'absolute', top: 0, right: 0, padding: '2px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#FFF', borderRadius: '0 0 0 4px', cursor: 'pointer' }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {uploadingImage && (
                    <div style={{ width: '60px', height: '76px', border: '1px solid var(--border-light)', borderRadius: '4px', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RefreshCw size={18} className="animate-spin color-primary" />
                    </div>
                  )}
                </div>

                {uploadError && (
                  <div style={{ color: '#B71C1C', fontSize: '0.75rem', marginBottom: '8px' }}>{uploadError}</div>
                )}

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#FFF', border: '1px solid var(--border-light)', padding: '8px 16px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500 }}>
                  <Upload size={14} /> Upload Image File
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    style={{ display: 'none' }}
                  />
                </label>
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
    </div>
  );
}
