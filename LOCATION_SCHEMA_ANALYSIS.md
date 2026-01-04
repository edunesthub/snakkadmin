# Location Management Schema Analysis

## Current Admin Schema Structure

### Universities Collection
```json
{
  "id": "uoN123",
  "name": "University of Nairobi",
  "shortName": "UoN",           // ← Used as location identifier
  "city": "Nairobi",
  "hostels": ["Main Hall", "Valley Hall"],  // ← Also used as location identifiers
  "createdAt": "2024-01-01"
}
```

### Restaurants Collection (Admin View)
```json
{
  "id": "rest123",
  "name": "Mama's Kitchen",
  "locations": ["UoN", "Main Hall"],  // ← STRING ARRAY (shortName + hostel names)
  "campus": "UoN",                    // ← Single string (shortName)
  "isStudent": true,
  "schools": ["school1", "school2"],  // ← School IDs (not currently used effectively)
  
  // Structured Address Fields:
  "addressLine1": "123 Main St",
  "addressLine2": "Building A",
  "city": "Nairobi",
  "state": "Nairobi County",
  "postalCode": "00100",
  "country": "Kenya",
  "address": "123 Main St, Building A, Nairobi, Nairobi County, 00100, Kenya"
}
```

---

## Problem: Admin ↔ Customer Schema Mismatch

### What Admin Has:
- `locations[]`: String array with **shortNames** (e.g., ["UoN", "Main Hall"])
- `campus`: Single string with **shortName** (e.g., "UoN")
- `schools[]`: Array of school IDs (e.g., ["schoolId1", "schoolId2"]) - **Not being set by admin panel**

### What Customer App Expects:
Customer app likely expects **one of these patterns**:
1. **schools[]**: Array of school/university IDs (for filtering by institution)
2. **locations[]**: Array of location names (for display)
3. **campus**: Primary campus identifier

---

## Matching Logic (Admin School Assignment)

### Current Implementation (schools/page.tsx)
```typescript
// When toggling restaurant assignment:
if (isCurrentlyAssigned) {
  // Remove all hostels and uni identifiers
  newLocations = newLocations.filter(loc => {
    const locLower = loc.toLowerCase();
    const matchesHostel = uni.hostels.some(h => h.toLowerCase() === locLower);
    const matchesUni = locLower === uni.shortName.toLowerCase();
    return !matchesHostel && !matchesUni;
  });
} else {
  // Add university shortName if not present
  if (!newLocations.some(loc => loc.toLowerCase() === uni.shortName.toLowerCase())) {
    newLocations.push(uni.shortName);
  }
}
```

### Why Customer Doesn't See It:
- **Admin stores location names** (shortName like "UoN")
- **Customer app probably expects school IDs** (like "6789qwer")
- **Mismatch**: The restaurant has locations with text names, but customer app filters by IDs

---

## Recommended Fix

### Option A: Store University IDs in locations[] (BEST)
**Change what admin stores when assigning universities:**

```typescript
// Instead of pushing shortName:
if (!newLocations.some(loc => loc === uni.id)) {
  newLocations.push(uni.id);  // ← Store ID, not shortName
}
```

**Pros:**
- ✅ Maintains referential integrity
- ✅ Works with school filters in customer app
- ✅ Safe if university name changes

**Cons:**
- ✗ Less human-readable in Firestore

---

### Option B: Populate schools[] array (ALTERNATIVE)
**Keep locations[] for display, populate schools[] for filtering:**

```typescript
// When assigning:
await updateDoc(restRef, {
  locations: newLocations,      // Keep for display (shortName/hostel names)
  schools: [...(rest.schools || []), uni.id]  // ← Also store ID here
});
```

**Pros:**
- ✅ Keeps locations human-readable
- ✅ Explicit schools array for customer filtering
- ✅ Can have both display names and IDs

**Cons:**
- ✗ Duplicate data (both locations and schools)

---

## Current Data State

| Restaurant | locations[] | campus | schools[] | Visible to Customer? |
|-----------|------------|--------|-----------|------------------|
| Mama's Kitchen | ["UoN", "Main Hall"] | "UoN" | [] (empty) | ❌ NO |
| Burger Palace | ["Campus Hall"] | "Campus" | [] (empty) | ❌ NO |

---

## Action Items

1. **Decide**: Should locations store IDs or names?
2. **Identify**: What schema does customer app actually expect?
3. **Migrate**: Update existing restaurant assignments
4. **Update**: Modify toggle logic to store correct data

### Questions:
- Does customer app filter by `schools[]` IDs?
- Does customer app display `locations[]` as location names?
- Should one university assignment create multiple location entries (one per hostel)?

