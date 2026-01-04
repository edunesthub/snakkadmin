'use client';

import { useRouter } from 'next/navigation';

interface Props {
  itemId: string;
  itemName: string;
  itemType: 'restaurant' | 'menuItem' | 'order' | 'ad' | 'user';
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const collectionMap = {
  restaurant: 'restaurants',
  menuItem: 'menuItems',
  order: 'orders',
  ad: 'ads',
  user: 'users',
};

export function DeleteConfirmModal({ itemId, itemType, isOpen, onClose }: Props) {
  const router = useRouter();

  if (isOpen) {
    router.push(`/delete/${itemId}?type=${itemType}&collection=${collectionMap[itemType]}`);
  }

  return null;
}
