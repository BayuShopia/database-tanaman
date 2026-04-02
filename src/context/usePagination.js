import { useState, useCallback } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';

export const usePagination = (collectionName, perPage = 10, orderField = 'tglTanam') => {
  const [data, setData] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (isNextPage = false) => {
    // 1. Cegah eksekusi jika sedang loading atau data sudah habis saat minta halaman berikutnya
    if (loading || (isNextPage && !hasMore)) return;
    
    setLoading(true);

    try {
      let q;
      const collectionRef = collection(db, collectionName);

      if (isNextPage && lastDoc) {
        // 2. Query untuk halaman berikutnya menggunakan startAfter
        q = query(
          collectionRef,
          orderBy(orderField, "desc"),
          startAfter(lastDoc),
          limit(perPage)
        );
      } else {
        // 3. Query untuk halaman pertama atau saat refresh
        q = query(
          collectionRef,
          orderBy(orderField, "desc"),
          limit(perPage)
        );
      }

      const querySnapshot = await getDocs(q);
      
      // 4. Penanganan jika koleksi kosong atau data habis
      if (querySnapshot.empty) {
        setHasMore(false);
        if (!isNextPage) setData([]);
        return;
      }

      const newData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      setLastDoc(lastVisible);
      
      // 5. Jika data yang ditarik kurang dari perPage, berarti sudah tidak ada lagi data berikutnya
      setHasMore(newData.length === perPage);

      if (isNextPage) {
        setData(prev => [...prev, ...newData]);
      } else {
        setData(newData);
      }
    } catch (err) {
      console.error("Error Pagination:", err);
    } finally {
      setLoading(false);
    }
    // loading dihapus dari dependensi untuk mencegah infinite loop
  }, [collectionName, perPage, orderField, lastDoc, hasMore]);

  const refresh = () => {
    setLastDoc(null);
    setHasMore(true);
    fetchData(false);
  };

  return { data, loading, hasMore, fetchData, refresh, setData };
};