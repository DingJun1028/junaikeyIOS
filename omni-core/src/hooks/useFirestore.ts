import { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  Timestamp
} from 'firebase/firestore';

/**
 * 萬能數據流 Hook - Universal Data Flow Hook
 * 與 Firestore 實時同步的核心 Hook
 */

export interface FirestoreData {
  id: string;
  [key: string]: any;
}

export const useFirestore = (collectionName: string, queryConstraints?: any[]) => {
  const [data, setData] = useState<FirestoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirestore();
    let collectionRef = collection(db, collectionName);

    // Apply query constraints if provided
    let queryRef;
    if (queryConstraints && queryConstraints.length > 0) {
      queryRef = query(collectionRef, ...queryConstraints);
    } else {
      queryRef = collectionRef;
    }

    const unsubscribe = onSnapshot(
      queryRef,
      (snapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(documents);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
};

/**
 * 萬能文檔 Hook - Universal Document Hook
 */
export const useFirestoreDoc = (collectionName: string, docId: string) => {
  const [data, setData] = useState<FirestoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const docRef = doc(db, collectionName, docId);

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() });
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, docId]);

  return { data, loading, error };
};

/**
 * 萬能操作 Hook - Universal Operations Hook
 */
export const useFirestoreOperations = (collectionName: string) => {
  const db = getFirestore();

  const addDocument = async (data: any) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, success: true };
    } catch (error) {
      console.error('Error adding document:', error);
      return { success: false, error };
    }
  };

  const updateDocument = async (docId: string, data: any) => {
    try {
      await updateDoc(doc(db, collectionName, docId), {
        ...data,
        updatedAt: Timestamp.now()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating document:', error);
      return { success: false, error };
    }
  };

  const deleteDocument = async (docId: string) => {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error };
    }
  };

  return { addDocument, updateDocument, deleteDocument };
};