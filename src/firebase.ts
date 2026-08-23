import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App instance safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with the dedicated database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
      tenantId: null,
    },
    operationType,
    path
  };
  console.warn('[Firestore Operation Notice]:', JSON.stringify(errInfo));
  return errInfo;
}

// Validate Connection to Firestore on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'config', 'admin_auth'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Connection notice: client offline or verifying credentials.');
    }
  }
}

testConnection();

export interface FirestoreAdminAuth {
  username: string;
  password: string;
  email?: string;
  updatedAt?: string;
}

/**
 * Fetches admin authentication credentials directly from Firestore database
 * Collection: "config" -> Document: "admin_auth"
 */
export async function getAdminCredentialsFromFirestore(): Promise<FirestoreAdminAuth | null> {
  const path = 'config/admin_auth';
  try {
    const docRef = doc(db, 'config', 'admin_auth');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as FirestoreAdminAuth;
      return data;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
  return null;
}

/**
 * Saves or updates admin credentials directly in Firestore database
 */
export async function saveAdminCredentialsToFirestore(creds: FirestoreAdminAuth): Promise<boolean> {
  const path = 'config/admin_auth';
  try {
    const docRef = doc(db, 'config', 'admin_auth');
    await setDoc(docRef, {
      ...creds,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Saves or updates an artwork directly in Firestore collection "artworks"
 */
export async function saveArtworkToFirestore(artwork: any): Promise<boolean> {
  const artworkId = artwork.id || `sa-${Date.now()}`;
  const path = `artworks/${artworkId}`;
  try {
    const docRef = doc(db, 'artworks', artworkId);
    const cleanData = {
      ...artwork,
      id: artworkId,
      updatedAt: new Date().toISOString(),
      createdAt: artwork.createdAt || new Date().toISOString(),
    };
    await setDoc(docRef, cleanData, { merge: true });
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
    const { deleteDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'artworks', artworkId);
    await deleteDoc(docRef);
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
    const docRef = doc(db, 'config', 'main_site_config');
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Saves or updates an inquiry (including messages & tags) in Firestore collection "inquiries"
 */
export async function saveInquiryToFirestore(inquiry: any): Promise<boolean> {
  const inquiryId = inquiry.id || `inq-${Date.now()}`;
  const path = `inquiries/${inquiryId}`;
  try {
    const docRef = doc(db, 'inquiries', inquiryId);
    const cleanData = {
      ...inquiry,
      id: inquiryId,
      updatedAt: new Date().toISOString(),
      createdAt: inquiry.createdAt || new Date().toISOString(),
      tags: Array.isArray(inquiry.tags) ? inquiry.tags : [],
      messages: Array.isArray(inquiry.messages) ? inquiry.messages : [],
    };
    await setDoc(docRef, cleanData, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Fetches all inquiries from Firestore
 */
export async function fetchInquiriesFromFirestore(): Promise<any[]> {
  const path = 'inquiries';
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const colRef = collection(db, 'inquiries');
    const snap = await getDocs(colRef);
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
}

/**
 * Deletes an inquiry from Firestore
 */
export async function deleteInquiryFromFirestore(inquiryId: string): Promise<boolean> {
  const path = `inquiries/${inquiryId}`;
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'inquiries', inquiryId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    return false;
  }
}


