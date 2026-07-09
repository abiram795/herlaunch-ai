import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth;
let db;
let storage;
let isDemoMode = false;

const hasConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

if (hasConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('Firebase initialized successfully.');
  } catch (error) {
    console.error('Firebase initialization failed. Falling back to sandbox demo mode.', error);
    isDemoMode = true;
  }
} else {
  console.warn('Firebase configuration is empty. Running in sandbox demo mode with localStorage.');
  isDemoMode = true;
}

// ----------------------------------------------------
// SANDBOX DEMO MODE MOCKS
// ----------------------------------------------------

const mockGoogleProvider = {};

// Helper to simulate asynchronous behavior
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const mockAuth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    const savedUser = localStorage.getItem('herlaunch_user');
    if (savedUser) {
      mockAuth.currentUser = JSON.parse(savedUser);
    } else {
      mockAuth.currentUser = null;
    }
    
    callback(mockAuth.currentUser);
    
    const handleStorageChange = () => {
      const u = localStorage.getItem('herlaunch_user');
      mockAuth.currentUser = u ? JSON.parse(u) : null;
      callback(mockAuth.currentUser);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  },
  signInWithPopup: async () => {
    await delay(800);
    const mockUser = {
      uid: 'demo_user_123',
      email: 'founder@herlaunch.ai',
      displayName: 'Empowered Founder',
      photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    };
    localStorage.setItem('herlaunch_user', JSON.stringify(mockUser));
    mockAuth.currentUser = mockUser;
    
    const users = JSON.parse(localStorage.getItem('herlaunch_col_users') || '{}');
    users[mockUser.uid] = { ...mockUser, createdAt: new Date().toISOString() };
    localStorage.setItem('herlaunch_col_users', JSON.stringify(users));
    
    window.dispatchEvent(new Event('storage'));
    return { user: mockUser };
  },
  createUserWithEmailAndPassword: async (email, password, name) => {
    await delay(800);
    const usersList = JSON.parse(localStorage.getItem('herlaunch_auth_users_db') || '[]');
    
    // Check if email already exists
    if (usersList.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('AuthError: Email already exists.');
    }

    const uid = 'user_' + Math.random().toString(36).substring(2, 11);
    const mockUser = {
      uid,
      email,
      displayName: name || 'Empowered Founder',
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'Founder')}`
    };

    usersList.push({ uid, email, password, displayName: mockUser.displayName, photoURL: mockUser.photoURL });
    localStorage.setItem('herlaunch_auth_users_db', JSON.stringify(usersList));

    localStorage.setItem('herlaunch_user', JSON.stringify(mockUser));
    mockAuth.currentUser = mockUser;

    const users = JSON.parse(localStorage.getItem('herlaunch_col_users') || '{}');
    users[uid] = { ...mockUser, createdAt: new Date().toISOString() };
    localStorage.setItem('herlaunch_col_users', JSON.stringify(users));

    window.dispatchEvent(new Event('storage'));
    return { user: mockUser };
  },
  signInWithEmailAndPassword: async (email, password) => {
    await delay(800);
    const usersList = JSON.parse(localStorage.getItem('herlaunch_auth_users_db') || '[]');
    
    const userMatch = usersList.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!userMatch) {
      throw new Error('AuthError: Invalid email or password.');
    }

    const mockUser = {
      uid: userMatch.uid,
      email: userMatch.email,
      displayName: userMatch.displayName,
      photoURL: userMatch.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userMatch.displayName)}`
    };

    localStorage.setItem('herlaunch_user', JSON.stringify(mockUser));
    mockAuth.currentUser = mockUser;

    window.dispatchEvent(new Event('storage'));
    return { user: mockUser };
  },
  signOut: async () => {
    await delay(300);
    localStorage.removeItem('herlaunch_user');
    mockAuth.currentUser = null;
    window.dispatchEvent(new Event('storage'));
  }
};

// Simple Mock Firestore
const mockDb = {
  saveDoc: async (colName, docId, data) => {
    await delay(100);
    const collectionData = JSON.parse(localStorage.getItem(`herlaunch_col_${colName}`) || '{}');
    const id = docId || Math.random().toString(36).substring(2, 11);
    const finalData = { id, ...data, updatedAt: new Date().toISOString() };
    if (!finalData.createdAt) {
      finalData.createdAt = new Date().toISOString();
    }
    collectionData[id] = finalData;
    localStorage.setItem(`herlaunch_col_${colName}`, JSON.stringify(collectionData));
    return { id, ...finalData };
  },
  
  getDoc: async (colName, docId) => {
    await delay(100);
    const collectionData = JSON.parse(localStorage.getItem(`herlaunch_col_${colName}`) || '{}');
    return collectionData[docId] || null;
  },
  
  getDocs: async (colName, queryFn) => {
    await delay(200);
    const collectionData = JSON.parse(localStorage.getItem(`herlaunch_col_${colName}`) || '{}');
    let list = Object.values(collectionData);
    if (queryFn) {
      list = list.filter(queryFn);
    }
    return list;
  }
};

// ----------------------------------------------------
// EXPORT UNIFIED API
// ----------------------------------------------------

export { isDemoMode };

export const firebaseAuth = isDemoMode ? mockAuth : auth;
export const googleProvider = isDemoMode ? mockGoogleProvider : new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  if (isDemoMode) {
    return mockAuth.signInWithPopup();
  }
  return signInWithPopup(auth, googleProvider);
};

export const signUpUser = async (email, password, name) => {
  if (isDemoMode) {
    return mockAuth.createUserWithEmailAndPassword(email, password, name);
  }
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, {
    displayName: name,
    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
  });
  
  // Save user profile details to Firestore
  await dbSave('users', credential.user.uid, {
    uid: credential.user.uid,
    email: credential.user.email,
    displayName: name,
    photoURL: credential.user.photoURL
  });

  return credential;
};

export const signInUser = async (email, password) => {
  if (isDemoMode) {
    return mockAuth.signInWithEmailAndPassword(email, password);
  }
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  if (isDemoMode) {
    return mockAuth.signOut();
  }
  return signOut(auth);
};

export const listenToAuth = (callback) => {
  if (isDemoMode) {
    return mockAuth.onAuthStateChanged(callback);
  }
  return onAuthStateChanged(auth, (currentUser) => {
    callback(currentUser);
  });
};

// Unified DB helper functions that automatically branch depending on modes
export const dbSave = async (colName, docId, data) => {
  if (isDemoMode) {
    return mockDb.saveDoc(colName, docId, data);
  }
  
  const docRef = docId ? doc(db, colName, docId) : doc(collection(db, colName));
  const id = docRef.id;
  const docData = {
    id,
    ...data,
    updatedAt: new Date()
  };
  if (!docData.createdAt) {
    docData.createdAt = new Date();
  }
  
  await setDoc(docRef, docData);
  return docData;
};

export const dbGet = async (colName, docId) => {
  if (isDemoMode) {
    return mockDb.getDoc(colName, docId);
  }
  const docSnap = await getDoc(doc(db, colName, docId));
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};

export const dbGetAll = async (colName, filterField = null, filterVal = null, sortField = 'createdAt', order = 'desc') => {
  if (isDemoMode) {
    return mockDb.getDocs(colName, (item) => {
      if (filterField && item[filterField] !== filterVal) {
        return false;
      }
      return true;
    }).then(res => {
      return res.sort((a, b) => {
        const valA = a[sortField] || '';
        const valB = b[sortField] || '';
        if (order === 'desc') {
          return valA > valB ? -1 : 1;
        }
        return valA < valB ? -1 : 1;
      });
    });
  }
  
  let q = collection(db, colName);
  if (filterField) {
    q = query(q, where(filterField, '==', filterVal));
  }
  
  const querySnapshot = await getDocs(q);
  const results = [];
  querySnapshot.forEach((doc) => {
    results.push(doc.data());
  });
  
  // Sort manually if required to prevent missing index errors in Firebase Firestore
  results.sort((a, b) => {
    const valA = a[sortField]?.seconds || a[sortField] || 0;
    const valB = b[sortField]?.seconds || b[sortField] || 0;
    if (order === 'desc') {
      return valB - valA;
    }
    return valA - valB;
  });
  
  return results;
};
