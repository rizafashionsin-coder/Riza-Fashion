import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';

/**
 * Firestore Helper Services
 */

// Add a document to a collection with an auto-generated ID
export async function addDocument(collectionName, data) {
  try {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

// Set a document with a specific custom ID (or overwrite it)
export async function setDocument(collectionName, docId, data) {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error(`Error setting document in ${collectionName}/${docId}:`, error);
    throw error;
  }
}

// Fetch a single document by ID
export async function getDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data(), exists: true };
    }
    return { exists: false };
  } catch (error) {
    console.error(`Error fetching document ${collectionName}/${docId}:`, error);
    throw error;
  }
}

// Fetch all documents in a collection
export async function getCollection(collectionName) {
  try {
    const colRef = collection(db, collectionName);
    const querySnapshot = await getDocs(colRef);
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    return documents;
  } catch (error) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    throw error;
  }
}

// Query documents in a collection with a single field match filter
export async function queryCollection(collectionName, field, operator, value) {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, where(field, operator, value));
    const querySnapshot = await getDocs(q);
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    return documents;
  } catch (error) {
    console.error(`Error querying collection ${collectionName}:`, error);
    throw error;
  }
}

// Delete a document by ID
export async function deleteDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting document ${collectionName}/${docId}:`, error);
    throw error;
  }
}

/**
 * Authentication Helper Services
 */

// Subscribe to authentication state updates
export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        isAuthenticated: true
      });
    } else {
      callback({ isAuthenticated: false });
    }
  });
}
