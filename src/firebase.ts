import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App instance safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with the dedicated database ID.
// ignoreUndefinedProperties lets us save objects with optional (undefined) fields.
function createDb(): Firestore {
  const databaseId = firebaseConfig.firestoreDatabaseId || undefined;
  try {
    return databaseId
      ? initializeFirestore(app, { ignoreUndefinedProperties: true }, databaseId)
      : initializeFirestore(app, { ignoreUndefinedProperties: true });
  } catch {
    // Already initialized (e.g. during HMR)
    return databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  }
}

export const db = createDb();
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn('[Firestore]', operationType, path, message);
  return { error: message, operationType, path };
}

// ---------------------------------------------------------------------------
// Admin authentication (Firebase Authentication, email + password)
// Admin rights are granted by a document at admins/{uid} (see firestore.rules).
// ---------------------------------------------------------------------------

export async function signInAdmin(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const isAdmin = await checkIsAdmin(cred.user.uid);
  if (!isAdmin) {
    await signOut(auth);
    throw new Error('not-admin');
  }
  return cred.user;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

export async function sendAdminPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function checkIsAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists();
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `admins/${uid}`);
    return false;
  }
}

/**
 * Subscribes to admin auth state. Calls back with the user only when they
 * are signed in AND listed in the admins collection.
 */
export function onAdminAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return callback(null);
    callback((await checkIsAdmin(user.uid)) ? user : null);
  });
}

/** Returns the current user's ID token for authenticating admin API calls. */
export async function getAdminIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  return user ? user.getIdToken() : null;
}

// ---------------------------------------------------------------------------
// Public site content
// ---------------------------------------------------------------------------

export interface PublicContent {
  artworks: any[];
  categories: any[];
  siteConfig: Record<string, any> | null;
}

function sortByOrder(list: any[]): any[] {
  return [...list].sort((a, b) => {
    const ao = typeof a.sortOrder === 'number' ? a.sortOrder : Number.MAX_SAFE_INTEGER;
    const bo = typeof b.sortOrder === 'number' ? b.sortOrder : Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });
}

/** Loads published artworks, categories and site config for every visitor. */
export async function fetchPublicContent(): Promise<PublicContent> {
  const [artSnap, catSnap, configSnap] = await Promise.all([
    getDocs(collection(db, 'artworks')),
    getDocs(collection(db, 'categories')),
    getDoc(doc(db, 'config', 'main_site_config')),
  ]);
  const artworks = artSnap.docs.map((d) => ({ ...d.data(), id: d.id }));
  const categories = catSnap.docs.map((d) => ({ ...d.data(), id: d.id }));
  return {
    artworks: sortByOrder(artworks),
    categories: sortByOrder(categories),
    siteConfig: configSnap.exists() ? (configSnap.data() as Record<string, any>) : null,
  };
}

/**
 * Saves or updates an artwork directly in Firestore collection "artworks"
 */
export async function saveArtworkToFirestore(artwork: any): Promise<boolean> {
  const artworkId = artwork.id || `sa-${Date.now()}`;
  const path = `artworks/${artworkId}`;
  try {
    const now = new Date().toISOString();
    await setDoc(doc(db, 'artworks', artworkId), {
      ...artwork,
      id: artworkId,
      updatedAt: now,
      createdAt: artwork.createdAt || now,
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Deletes an artwork from Firestore collection "artworks"
 */
export async function deleteArtworkFromFirestore(artworkId: string): Promise<boolean> {
  const path = `artworks/${artworkId}`;
  try {
    await deleteDoc(doc(db, 'artworks', artworkId));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    return false;
  }
}

export async function saveCategoryToFirestore(category: any): Promise<boolean> {
  const path = `categories/${category.id}`;
  try {
    await setDoc(doc(db, 'categories', category.id), category, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

export async function deleteCategoryFromFirestore(categoryId: string): Promise<boolean> {
  const path = `categories/${categoryId}`;
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    return false;
  }
}

/**
 * Saves or updates global site configuration in Firestore "config/main_site_config"
 */
export async function saveSiteConfigToFirestore(config: any): Promise<boolean> {
  const path = 'config/main_site_config';
  try {
    // Never persist legacy credential fields
    const { adminCredentials: _ignored, ...safeConfig } = config || {};
    await setDoc(doc(db, 'config', 'main_site_config'), {
      ...safeConfig,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Writes every artwork and category in one go (used to seed an empty database
 * with the content the admin currently sees).
 */
export async function publishAllContent(artworks: any[], categories: any[]): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    // Firestore batches are limited to 500 writes
    const writes: Array<[string, string, any]> = [
      ...artworks.map((a, i) => ['artworks', a.id, { ...a, sortOrder: i, createdAt: a.createdAt || now, updatedAt: now }] as [string, string, any]),
      ...categories.map((c, i) => ['categories', c.id, { ...c, sortOrder: i }] as [string, string, any]),
    ];
    for (let i = 0; i < writes.length; i += 450) {
      const batch = writeBatch(db);
      for (const [col, id, data] of writes.slice(i, i + 450)) {
        batch.set(doc(db, col, id), data, { merge: true });
      }
      await batch.commit();
    }
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'publishAllContent');
    return false;
  }
}

// ---------------------------------------------------------------------------
// Inquiries
// ---------------------------------------------------------------------------

/**
 * Saves or updates an inquiry (including messages & tags) in Firestore collection "inquiries"
 */
export async function saveInquiryToFirestore(inquiry: any): Promise<boolean> {
  const inquiryId = inquiry.id || `inq-${Date.now()}`;
  const path = `inquiries/${inquiryId}`;
  try {
    const now = new Date().toISOString();
    await setDoc(doc(db, 'inquiries', inquiryId), {
      ...inquiry,
      id: inquiryId,
      updatedAt: now,
      createdAt: inquiry.createdAt || now,
      tags: Array.isArray(inquiry.tags) ? inquiry.tags : [],
      messages: Array.isArray(inquiry.messages) ? inquiry.messages : [],
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Fetches all inquiries from Firestore (admin only)
 */
export async function fetchInquiriesFromFirestore(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'inquiries'));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'inquiries');
    return [];
  }
}

/**
 * Deletes an inquiry from Firestore
 */
export async function deleteInquiryFromFirestore(inquiryId: string): Promise<boolean> {
  const path = `inquiries/${inquiryId}`;
  try {
    await deleteDoc(doc(db, 'inquiries', inquiryId));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    return false;
  }
}
