import { db } from '@/lib/firebase';
import { collection, doc, getDocs, addDoc, updateDoc } from 'firebase/firestore';

export interface Ad {
  id?: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  active: boolean;
  createdAt: Date;
  deleted?: boolean;
}

export const getAds = async (): Promise<Ad[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'ads'));
    const ads = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        subtitle: data.subtitle || '',
        image: data.image || '',
        link: data.link || '',
        active: data.active ?? true, // default to true if not set
        createdAt: data.createdAt?.toDate() || new Date(),
        deleted: data.deleted || false,
      } as Ad;
    });
    // Filter out deleted ads
    return ads.filter(ad => !ad.deleted);
  } catch (error) {
    console.error('Error fetching ads:', error);
    throw error;
  }
};;

export const createAd = async (ad: Omit<Ad, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'ads'), {
      ...ad,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating ad:', error);
    throw error;
  }
};

export const updateAd = async (id: string, updates: Partial<Ad>): Promise<void> => {
  try {
    const adRef = doc(db, 'ads', id);
    await updateDoc(adRef, updates);
  } catch (error) {
    console.error('Error updating ad:', error);
    throw error;
  }
};

export const deleteAd = async (id: string): Promise<void> => {
  try {
    // Soft delete
    await updateAd(id, { deleted: true });
  } catch (error) {
    console.error('Error deleting ad:', error);
    throw error;
  }
};