# Database Schema Documentation

## Types

### Restaurant
Main restaurant information displayed on the browse/search screens.

```typescript
{
  id: string;                  // Unique identifier
  name: string;               // Restaurant name
  image: string;              // Hero image URL
  rating: number;             // Star rating (e.g., 4.5)
  deliveryTime: string;       // Estimated delivery time (e.g., "20-30 min")
  deliveryFee: number;        // Delivery cost in GHS
  cuisine: string[];          // Types of cuisine (e.g., ["Italian", "Pizza"])
  categories: string[];       // Menu categories (e.g., ["Pizza", "Pasta"])
  description: string;        // Short description
  address: string;            // Delivery address
  isOpen: boolean;            // Open/closed status
  distance: string;           // Distance from user (e.g., "1.2 km")
  locations?: string[];       // Location tags (e.g., ["Osu", "Cantonments", "Accra CBD"])
  campus?: string;            // Optional campus/university grouping for filtering
  isFeatured?: boolean;       // Featured restaurant badge
  isStudent?: boolean;        // Student discount available
}
```

### MenuItem
Individual menu items with optional extras and preferred types.

```typescript
{
  id: string;                 // Unique identifier
  restaurantId: string;       // Reference to restaurant
  name: string;              // Item name
  description: string;       // Item description
  price: number;             // Base price in GHS
  image: string;             // Item image URL
  category: string;          // Category (e.g., "Pizza", "Burgers")
  isPopular?: boolean;       // Popular badge
  isVegetarian?: boolean;    // Vegetarian indicator
  extras?: Extra[];          // Optional add-ons
  preferredTypes?: PreferredType[]; // Optional size variants with individual pricing
}
```

### PreferredType
Size/variant options for menu items with configurable prices.

```typescript
{
  id: string;                // Unique identifier (e.g., "small", "medium", "large")
  name: string;              // Display name (e.g., "Small", "Medium", "Large")
  basePrice: number;         // Price for this size/type in GHS
  minPrice?: number;         // Minimum slider price (defaults to basePrice × 0.5)
  maxPrice?: number;         // Maximum slider price (defaults to basePrice × 1.5)
}
```

### Extra
Add-on items that can be added to menu items (e.g., Extra Cheese, Bacon). Supports individual quantity selection.

```typescript
{
  id: string;                // Unique identifier
  name: string;              // Extra name
  price: number;             // Price in GHS
  quantity?: number;         // Selected quantity (defaults to 1 if not specified)
}
```

### CartItem
Item in the shopping cart with selected extras, quantity, and preferred type.

```typescript
{
  menuItem: MenuItem;         // The menu item
  quantity: number;          // Number of items
  restaurant: Restaurant;    // Associated restaurant
  selectedExtras?: Extra[];  // Selected extras for this item with quantities (e.g., Extra Cheese ×2, Bacon ×1)
  selectedType?: string;     // Selected size/type (e.g., "small", "medium", "large")
  selectedTypePrice?: number; // Adjusted price for selected type (from slider)
}
```

When pricing is calculated:
- Base price = selectedTypePrice (if type selected) or menuItem.price
- Each extra's price is multiplied by its selected quantity
- Total for an item = (basePrice + sum of (extra.price × extra.quantity)) × quantity
- Cart total includes all pricing with quantities and fees
- All selections are preserved through checkout and order submission

### Order
Completed order information with items, extras, and type selections.

```typescript
{
  id: string;                                      // Unique order ID
  userId: string;                                 // User who placed order
  restaurantId: string;                           // Restaurant ID
  items: Array<{                                  // Items ordered
    menuItemId: string;
    menuItemName: string;
    price: number;                               // Final item price (includes type adjustment)
    selectedType?: string;                       // Selected size/type
    quantity: number;
    extras?: Extra[];                            // Selected extras for this item
  }>;
  status: 'pending' | 'preparing' | 'out-for-delivery' | 'on-the-way' | 'delivered' | 'cancelled';
  subtotal: number;                               // Items total (including extras and type pricing)
  deliveryFee: number;                            // Delivery cost in GHS
  serviceFee: number;                             // Service/platform fee
  discount: number;                               // Promo code discount
  total: number;                                  // Final amount in GHS
  deliveryAddress: string;                        // Delivery location
  deliveryLocationHostelId?: string | null;       // Selected hostel ID (if applicable)
  deliveryLocationUniversityId?: string | null;   // Selected university ID (if applicable)
  deliveryLocationLabel?: string | null;          // Friendly label shown in checkout
  paymentMethod: string;                          // Payment method used
  deliveryNotes?: string;                         // Special delivery instructions
  promoCode?: string;                             // Applied promo code
  createdAt: Timestamp;                           // When order was placed
  estimatedDelivery?: Date;                       // ETA calculated at order creation
}
```

### User
User account information.

```typescript
{
  id: string;                // User ID (auth)
  name: string;              // Full name
  email: string;             // Email address
  phone: string;             // Phone number
  avatar?: string;           // Profile picture URL
  addresses: Address[];      // Saved addresses
  favoriteRestaurants: string[]; // Favorite restaurant IDs
}
```

### Address
Saved delivery address for users.

```typescript
{
  id: string;               // Unique address ID
  label: string;            // Name (e.g., "Home", "Work")
  street: string;           // Street address
  city: string;             // City
  zipCode: string;          // Postal code
  isDefault: boolean;       // Default delivery address
}
```

### Category
Food category for filtering menu items.

```typescript
{
  id: string;              // Unique identifier
  name: string;            // Category name (e.g., "Pizza", "Burgers")
  icon: string;            // Emoji or icon
  color: string;           // Hex color code
}
```

## Firebase Collections

### `restaurants`
Stores all restaurant data.

**Documents**: One per restaurant, keyed by restaurant ID.

### `menuItems`
Stores all menu items with extras.

**Documents**: One per item, keyed by item ID.
**Fields**: All MenuItem fields including `extras` array.

### `categories`
Stores food categories for organizing menus.

**Documents**: One per category, keyed by category ID.

### `orders`
Stores completed and in-progress orders.

**Documents**: One per order, keyed by order ID.

### `users`
Stores user profiles and preferences.

**Documents**: One per user, keyed by user ID (from auth).

## Sample Seeded Data

The `scripts/seed.mjs` script populates the database with:
- 6 menu items (pizzas and burgers) with extras
- Each item includes 3-4 extra options with individual pricing
- Examples:
  - Margherita Pizza: Extra Cheese (+₵1.99), Fresh Basil (+₵0.99), Garlic Bread (+₵2.49)
  - Classic Cheeseburger: Bacon (+₵1.49), Extra Cheese (+₵0.99), Fried Egg (+₵1.49), Caramelized Onions (+₵0.79)

## Pricing Logic

### Item Pricing with Extras

**Base Calculation:**
```
itemTotal = (basePrice + sum of (extra.price × extra.quantity)) × quantity
cartTotal = sum of all itemTotals + deliveryFee + serviceFee - discount
```

**Example:**
```
Item: Classic Cheeseburger (₵9.99)
Selected Extras:
  - Bacon ×2 (+₵1.49 each) = ₵2.98
  - Extra Cheese ×1 (+₵0.99) = ₵0.99
Quantity: 2

Item Total = (9.99 + 2.98 + 0.99) × 2 = ₵25.92

If delivery fee is ₵2.50 and no discount:
Final Total = ₵25.92 + ₵2.50 = ₵28.42
```

### Cart Context Functions

- `getTotal()`: Returns cart total including all extras with their quantities and fees
  - Calculates: sum of ((selectedTypePrice ?? itemPrice + sum of (extra.price × extra.quantity)) × itemQuantity) + deliveryFee + serviceFee - discount
- `getItemCount()`: Returns total quantity of items in cart
- `addItem(menuItem, restaurant, selectedExtras, selectedType, selectedTypePrice)`: Adds item with optional extras and type selection
- `updateQuantity(menuItemId, quantity)`: Updates item quantity
- `removeItem(menuItemId)`: Removes entire item entry from cart

### Checkout Display

The checkout screen displays detailed pricing for complete transparency:

**Per Item Breakdown:**
- Item quantity & name: "2x Classic Cheeseburger"
- Selected size/type with price: "Medium - ₵12.50 each"
- Each extra with individual pricing: 
  - "+ 2x Bacon - ₵2.98"
  - "+ 1x Extra Cheese - ₵0.99"
- Item total: (selectedTypePrice + sum of (extra.price × extra.quantity)) × item quantity

**Order Summary:**
- Subtotal: Sum of all items with type adjustments and extras
- Delivery Fee: Fixed per restaurant
- Service Fee: Platform fee (₵1.99)
- Discount: Applied promo code discount
- **Total: Subtotal + Delivery + Service - Discount**

Example Checkout:
```
2x Classic Cheeseburger
  Medium - ₵12.50 each
  + 2x Bacon - ₵2.98
  + 1x Extra Cheese - ₵0.99
Subtotal:        ₵59.96
Delivery Fee:    ₵2.50
Service Fee:     ₵1.99
Total:           ₵64.45
```

### Preferred Type System

Menu items can support multiple size/variant options (Small, Medium, Large) with:
- Individual configurable prices for each size
- Adjustable price range via sliders in customer app (min/max bounds)
- Customer selection is mandatory before adding to cart
- Each size has its own price configured by vendor

**Example Configuration:**
```
Item: Margherita Pizza

Preferred Types:
- Small: basePrice ₵8.00 (slider range: ₵4.00 - ₵12.00)
- Medium: basePrice ₵10.00 (slider range: ₵5.00 - ₵15.00)
- Large: basePrice ₵12.00 (slider range: ₵6.00 - ₵18.00)
```

### Vendor App: Configure Preferred Types
- Edit min/max slider bounds for each size
- Set base price for each size variant
- Vendor can adjust pricing per size in real-time
- Changes affect all new orders immediately

## Location Management

### Firebase Collections

#### `universities` Collection
Contains all university/school data with their hostels.

**Schema:**
```typescript
{
  id: string;              // Document ID, e.g., "ug", "knust", "ucc"
  name: string;            // e.g., "University of Ghana"
  shortName: string;       // e.g., "UG"
  city: string;            // e.g., "Legon", "Kumasi"
  hostels: string[];       // e.g., ["Volta", "Mensah", "Commonwealth"]
  createdAt: Timestamp;
}
```

**Seeded Universities:**
- **University of Ghana (Legon):** ID: `ug`, Hostels: Volta, Mensah, Commonwealth, Akuafo, Sarbah, Legon
- **KNUST (Kumasi):** ID: `knust`, Hostels: Unity, Independence, Republic, Queens, Africa
- **University of Cape Coast:** ID: `ucc`, Hostels: Casford, Valco, Oguaa
- **UEW (Winneba):** ID: `uew`, Hostels: North, South, Central
- **GIMPA:** ID: `gimpa`, Hostels: Main Campus
- **Ashesi University:** ID: `ashesi`, Hostels: Main Campus
- **UPSA (Accra):** ID: `upsa`, Hostels: Main Campus

#### `metadata/cityLocations` Document
Single document containing city/area location tags.

**Schema:**
```typescript
{
  locations: string[];     // ["Osu", "Cantonments", "Accra CBD", "Dzorwulu", "East Legon", "Tema", "Kumasi", "Takoradi"]
  updatedAt: Timestamp;
}
```

### Restaurant Schema
Restaurants are tagged with location identifiers for filtering:

```typescript
{
  // ... other fields
  locations?: string[];    // Hostel names or city tags (e.g., ["Mensah", "Volta", "Osu"])
  campus?: string;         // Optional university grouping (e.g., "UG")
}
```

### Admin App: Manage Locations
- View all universities and hostels in dedicated Schools section
- View city locations from `metadata/cityLocations`
- Assign restaurants to specific hostels/cities via `locations` array
- Filter restaurants by location using `array-contains` queries
- Add/edit universities and city tags

**Query Examples:**
```typescript
// Fetch all universities
const universitiesSnapshot = await getDocs(collection(db, 'universities'));
const schools = universitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Fetch city locations
const cityDoc = await getDoc(doc(db, 'metadata', 'cityLocations'));
const cities = cityDoc.data()?.locations || [];

// Filter restaurants by hostel
const q = query(
  collection(db, 'restaurants'),
  where('locations', 'array-contains', 'Mensah')
);
const filtered = await getDocs(q);
```

### Vendor App: Update Restaurant Location
- Edit `locations` array for their restaurant
- Select hostels and cities they serve
- View current location assignments
- Changes reflect immediately in customer app filters

### Customer App: Filter by Location
- Query `universities` collection to build location picker
- Select university and hostel/campus
- Browse restaurants filtered by `locations` field
- Location filters combined with search functionality
- Easy switching between different hostels within same university

### Location Persistence (Customer App)
- Selected university/hostel is stored locally under key `snakk:selectedLocation`
- Stored shape: `{ hostelId: string | null, hostelName: string | null, universityId: string | null }`
- Used to prefill checkout delivery label and order location metadata

### Query Constraints
- Firestore allows only **one** `array-contains` per query
- For multiple location filters, fetch all restaurants and filter client-side
- City locations stored in single `metadata/cityLocations` document to avoid individual docs per city



