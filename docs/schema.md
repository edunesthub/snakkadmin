# Firestore Schema

## restaurants
- name: string
- image: string
- rating: number
- deliveryTime: string (e.g., "30-45 mins")
- deliveryFee: number
- cuisine: string[]
- categories: string[]
- description: string
- address: string
- isOpen: boolean
- distance: string
- isStudent: boolean
- createdAt: Timestamp
- updatedAt: Timestamp (optional)

**Indexes**
- Single: isOpen, isStudent
- Composite (optional): isOpen + isStudent

## menuItems
- restaurantId: string
- name: string
- description: string
- price: number
- image: string
- category: string
- isAvailable: boolean
- tags: string[]
- createdAt: Timestamp
- updatedAt: Timestamp

**Indexes**
- Single: restaurantId, isAvailable

## orders
- restaurantId: string
- userId: string
- items: Array<{ itemId: string; quantity: number; price: number }>
- status: 'pending' | 'preparing' | 'on-the-way' | 'delivered' | 'picked-up' | 'cancelled'
- total: number
- notes?: string
- createdAt: Timestamp
- updatedAt: Timestamp

**Indexes**
- Single: restaurantId, userId, status
- Composite (optional): restaurantId + status

## users
- name: string
- email: string
- phone?: string
- address?: string
- role: 'customer' | 'admin'
- isActive: boolean
- ordersCount?: number
- totalSpent?: number
- lastOrder?: Timestamp
- createdAt: Timestamp

**Indexes**
- Single: role, isActive

## ads
- title: string
- subtitle: string
- image: string
- link: string
- active: boolean
- deleted?: boolean (soft delete)
- createdAt: Timestamp

**Indexes**
- Single: active, deleted

## Security rules (outline)
- users: users can read their own doc; only admins can list/update/delete others.
- orders: user can read/write their own; admins can list/update all; restaurants can read their own via restaurantId.
- restaurants, menuItems, ads: read allowed to clients; writes restricted to admins.

## Maintenance checklist
- Ensure createdAt/updatedAt set via server timestamps on writes.
- Ensure restaurants have isStudent (default false).
- Orders status values use 'picked-up' (not 'confirmed').
