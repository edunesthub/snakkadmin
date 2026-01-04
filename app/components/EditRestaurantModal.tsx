'use client';

import { useRouter } from 'next/navigation';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  cuisine: string[];
  categories: string[];
  isStudent: boolean;
  description: string;
  address?: string;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isOpen: boolean;
  distance: string;
  schools?: string[];
}

interface SchoolOption {
  id: string;
  name: string;
}

interface Props {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  schoolsOptions: SchoolOption[];
}

export function EditRestaurantModal({ restaurant, isOpen, onClose }: Props) {
  const router = useRouter();

  if (isOpen) {
    router.push(`/restaurants/edit/${restaurant.id}`);
  }

  return null;
}
