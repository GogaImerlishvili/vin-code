export const setProcessing = async (id: string, tries: number = 3) => {
  try {
    await signIn()
    const ref = doc(db, 'user-info', id)
    await updateDoc(ref, {
      processing: true
    })
  } catch (err) {
    console.error('setProcessing error:', err)
    if (tries > 0) {
      return setProcessing(id, tries - 1)
    } else {
      throw new Error(
        'setProcessing failed: ' + (err && err.message ? err.message : err)
      )
    }
  }
}
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getEnvVar } from './getEnvVar'

const firebaseConfig = {
  apiKey: 'AIzaSyDwukBbnNB_-TNUSVdDnoLbuD9NHloSK3o',
  authDomain: 'check-d9430.firebaseapp.com',
  projectId: 'check-d9430',
  storageBucket: 'check-d9430.firebasestorage.app',
  messagingSenderId: '394423319862',
  appId: '1:394423319862:web:0e523f38092809ce720797'
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

let isSignedIn = false
const signIn = async () => {
  if (isSignedIn) return
  try {
    await signInWithEmailAndPassword(
      auth,
      getEnvVar('FIRESTORE_MAIL'),
      getEnvVar('FIRESTORE_PASSWORD')
    )
    isSignedIn = true
  } catch (err: any) {
    // If already signed in or other non-fatal error, ignore
    if (err && err.code === 'auth/user-not-found') {
      throw err
    }
    if (err && err.code === 'auth/too-many-requests') {
      throw err
    }
    // If already signed in, ignore error
    if (err && err.code === 'auth/email-already-in-use') {
      isSignedIn = true
      return
    }
    throw err
  }
}

export const addDocument = async (
  id: string,
  mail: string,
  vincode: string,
  vendor: string,
  tries: number = 3
) => {
  try {
    await signIn()
    await setDoc(doc(db, 'user-info', id), {
      mail,
      vincode,
      vendor,
      mailSent: false
    })
  } catch (err) {
    console.error('addDocument error:', err)
    if (tries > 0) {
      return addDocument(id, mail, vincode, vendor, tries - 1)
    } else {
      throw new Error(
        'addDocument failed: ' + (err && err.message ? err.message : err)
      )
    }
  }
}

export const getDocumentById = async (id: string, tries: number = 3) => {
  try {
    await signIn()
    const ref = doc(db, 'user-info', id)
    const docSnap = await getDoc(ref)
    return docSnap.data()
  } catch (err) {
    console.error('getDocumentById error:', err)
    if (tries > 0) {
      return getDocumentById(id, tries - 1)
    } else {
      throw new Error(
        'getDocumentById failed: ' + (err && err.message ? err.message : err)
      )
    }
  }
}

export const deleteDocumentById = async (id: string, tries: number = 3) => {
  try {
    await signIn()
    const ref = doc(db, 'user-info', id)
    await deleteDoc(ref)
  } catch (err) {
    console.error('deleteDocumentById error:', err)
    if (tries > 0) {
      return deleteDocumentById(id, tries - 1)
    } else {
      throw new Error(
        'deleteDocumentById failed: ' + (err && err.message ? err.message : err)
      )
    }
  }
}

export const updateSentMail = async (id: string, tries: number = 3) => {
  try {
    await signIn()
    const ref = doc(db, 'user-info', id)
    await updateDoc(ref, {
      mailSent: true
    })
  } catch (err) {
    console.error('updateSentMail error:', err)
    if (tries > 0) {
      return updateSentMail(id, tries - 1)
    } else {
      throw new Error(
        'updateSentMail failed: ' + (err && err.message ? err.message : err)
      )
    }
  }
}

export const getDocumentsByEmail = async (email: string, tries: number = 3) => {
  try {
    await signIn()
    const q = query(collection(db, 'user-info'), where('mail', '==', email))
    const querySnapshot = await getDocs(q)
    const documents = []
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() })
    })
    return documents
  } catch (err) {
    console.error('getDocumentsByEmail error:', err)
    if (tries > 0) {
      return getDocumentsByEmail(email, tries - 1)
    } else {
      throw new Error(
        'getDocumentsByEmail failed: ' +
          (err && err.message ? err.message : err)
      )
    }
  }
}

export const getAllPendingDocuments = async (tries: number = 3) => {
  try {
    await signIn()
    const q = query(collection(db, 'user-info'), where('mailSent', '==', false))
    const querySnapshot = await getDocs(q)
    const documents = []
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() })
    })
    return documents
  } catch (err) {
    console.error('getAllPendingDocuments error:', err)
    if (tries > 0) {
      return getAllPendingDocuments(tries - 1)
    } else {
      throw new Error(
        'getAllPendingDocuments failed: ' +
          (err && err.message ? err.message : err)
      )
    }
  }
}
