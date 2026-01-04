'use client';

import { useRouter } from 'next/navigation';

interface Props {
  orderId: string;
  currentStatus: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function UpdateOrderStatusModal({ orderId, isOpen, onClose }: Props) {
  const router = useRouter();

  if (isOpen) {
    router.push(`/orders/update-status/${orderId}`);
  }

  return null;
}
