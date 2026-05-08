/**
 * useOfflineQueue
 *
 * Sistem antrian offline untuk menyimpan data pohon saat tidak ada koneksi.
 * Data disimpan di localStorage, lalu di-sync ke Firestore saat online kembali.
 *
 * Alur:
 *  1. User input data pohon → cek koneksi
 *  2. Online  → langsung addDoc ke Firestore
 *  3. Offline → simpan ke localStorage queue, tampil di UI sebagai "pending"
 *  4. Saat online kembali → otomatis flush queue ke Firestore
 */

import { useState, useEffect, useCallback } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const QUEUE_KEY = "berbumi_offline_queue";

// ── Helpers localStorage ──────────────────────────────────────────────────────
const readQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeQueue = (queue) => {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useOfflineQueue = () => {
  const [queue, setQueue] = useState(readQueue);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Sinkronkan state queue dengan localStorage
  const refreshQueue = useCallback(() => {
    setQueue(readQueue());
  }, []);

  // ── Flush: kirim semua item antrian ke Firestore ──────────────────────────
  const flushQueue = useCallback(async () => {
    const pending = readQueue();
    if (pending.length === 0 || isSyncing) return;

    setIsSyncing(true);
    const berhasil = [];
    const gagal = [];

    for (const item of pending) {
      try {
        await addDoc(collection(db, item.collection), {
          ...item.data,
          tglTanam: serverTimestamp(),
          _syncedAt: new Date().toISOString(),
        });
        berhasil.push(item.localId);
      } catch (err) {
        console.warn("[OfflineQueue] Gagal sync item:", item.localId, err.message);
        gagal.push(item);
      }
    }

    // Hapus yang berhasil, sisakan yang gagal
    writeQueue(gagal);
    refreshQueue();
    setIsSyncing(false);

    if (berhasil.length > 0) {
      console.log(`[OfflineQueue] ${berhasil.length} data berhasil disinkronkan ke Firestore.`);
    }

    return berhasil.length;
  }, [isSyncing, refreshQueue]);

  // ── Monitor status koneksi ────────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Otomatis flush saat koneksi kembali
      flushQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Coba flush saat pertama kali mount (kalau ada sisa antrian)
    if (navigator.onLine) flushQueue();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [flushQueue]);

  // ── Tambah item ke antrian ────────────────────────────────────────────────
  const enqueue = useCallback((collectionName, data) => {
    const item = {
      localId: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      collection: collectionName,
      data,
      createdAt: new Date().toISOString(),
    };
    const current = readQueue();
    writeQueue([...current, item]);
    refreshQueue();
    return item.localId;
  }, [refreshQueue]);

  // ── Hapus satu item dari antrian (misal setelah optimistic update dibatalkan) ──
  const dequeue = useCallback((localId) => {
    const current = readQueue().filter((i) => i.localId !== localId);
    writeQueue(current);
    refreshQueue();
  }, [refreshQueue]);

  return {
    queue,           // Array item yang masih pending
    isOnline,        // Status koneksi saat ini
    isSyncing,       // Sedang flush ke Firestore
    enqueue,         // Tambah ke antrian
    dequeue,         // Hapus dari antrian
    flushQueue,      // Paksa sync sekarang
  };
};
