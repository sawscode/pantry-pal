# Phase 2: Frictionless Item Intake

## Goal
Adding and removing items should take **<10 seconds total** with minimal taps/clicks.

## Three Input Methods (Priority Order)

### 1. Voice Input (HIGHEST PRIORITY - Easiest & Fastest)
**Use Case:** "Add 2 cups milk to fridge" while cooking/hands full
**Implementation:**
- Web Speech API (free, built-in to browsers)
- Parse with Claude API: "Convert to structured data: {name, quantity, unit, location}"
- Show result for confirmation (1 tap to add)
- No internet required for speech → text (browser-native)

**Flow:**
1. Tap mic button
2. Say: "Add 2 cups milk to fridge"
3. App shows: "2 cups milk → Fridge"
4. Tap "Confirm" (or say "confirm")
5. Done ✓

**Timeline:** 2-3 hours to build

---

### 2. Quick Templates (MEDIUM PRIORITY - Second Fastest)
**Use Case:** Quickly add common items (milk, eggs, bread) without typing

**Implementation:**
- Button bar with frequent items
- Example: [Milk] [Eggs] [Bread] [Cheese] [Yogurt] etc.
- Click button → quantity picker → location → done
- Learn from history (auto-suggest most-added items)

**Flow:**
1. Tap [Milk]
2. Set qty: 1 (remember default)
3. Set location: Fridge (remember default)
4. Tap "Add"
5. Done ✓

**Timeline:** 1-2 hours to build

---

### 3. Receipt Photo + OCR (LOWER PRIORITY - Most Friction But Powerful)
**Use Case:** Upload receipt photo, extract items and quantities

**Implementation:**
- Camera button → take photo
- Claude Vision API to extract items from receipt
- User reviews extracted items
- Batch add to inventory

**Flow:**
1. Tap camera icon
2. Take photo of receipt
3. App shows: "Found: Milk (1), Eggs (6), Bread (1)..."
4. Adjust/confirm items
5. Tap "Add all"
6. Done ✓

**Timeline:** 3-4 hours to build (Vision API + review UI)

---

### 4. Consumption / Quick Delete (ALL METHODS)
**Use Case:** Mark items as used while cooking

**Implementation:**
- Long-press item → "Consumed" or "Delete" options
- Voice: "Remove 1 cup milk from fridge" 
- Quick delete swipe
- Decrement quantity (instead of delete) for bulk items

**Flow (Decrement):**
1. View item: "Milk: 2 cups"
2. Tap "-" button
3. Shows: "Milk: 1 cup"
4. Real-time sync to other device
5. Done ✓

**Timeline:** 1 hour to add to existing UI

---

## Implementation Order (This Session)

1. **Voice Input** (2-3 hours) - Biggest impact
2. **Decrement Quantity** (30 min) - Easy win
3. **Quick Templates** (1-2 hours) - Second fastest method
4. **Receipt OCR** (deferred to next session) - Most complex

---

## Voice Input Details

### Tech Stack
- **Web Speech API** (browser-native, free)
  - iOS: Works in Safari/Chrome
  - Android: Works in Chrome
  - Desktop: Works in Chrome/Edge/Safari
  
- **Claude API** for parsing natural language
  ```
  User says: "Add 2 cups milk to fridge expiring tomorrow"
  Claude returns: {
    name: "milk",
    quantity: 2,
    unit: "cups",
    location: "Fridge",
    expirationDate: "2026-06-01"
  }
  ```

### Component: QuickAddVoice.jsx
```
[🎤 Voice Input] [Use Template] [Manual Form]
      ↓
  Listen to speech
      ↓
  Show transcript: "Add 2 cups milk to fridge"
      ↓
  Parse with Claude
      ↓
  Show parsed result with confirmation
      ↓
  Confirm → Add to inventory
```

### Fallback for Failures
- If speech → text fails: "Try again"
- If Claude parsing fails: Show form with transcript pre-filled
- If no location detected: Default to "Pantry"
- If no quantity: Ask "How much?"

---

## Decrement Quantity Details

### Update ItemCard.jsx
```
Current: [Item name] [Qty: 2 cups] [Delete button]

New: [Item name] [- button] [Qty: 2 cups] [+ button] [Delete button]
     ↓ tap -
     Updates immediately, syncs to other device
```

### Implementation
- Add "-" and "+" buttons to ItemCard
- Clicking "-" calls `updateItem(id, { quantity: qty - 1 })`
- If qty = 1 and user taps "-", ask "Delete item?"
- Real-time sync shows on other device instantly

---

## Quick Templates Details

### SmartTemplates.jsx Component
```
Frequently added items: [Milk] [Eggs] [Bread]

Tap [Milk]
  ↓
Quick picker: "How much? [1 cup ▼]"
  ↓
Picker: "Where? [Fridge ▼]"
  ↓
Tap "Add" or swipe right
  ↓
Done, syncs instantly
```

### Learning Algorithm
- Track items added in last 30 days
- Show top 5 most-added items as quick buttons
- Update weekly based on usage
- Store in localStorage for instant load

---

## Success Criteria

### Voice Input
- [x] Say "Add 2 cups milk to fridge"
- [x] App parses correctly
- [x] Shows confirmation
- [x] Adds to inventory with real-time sync
- [x] Works offline (speech), requires internet for parsing only

### Decrement
- [x] Long-press or tap "-" button on item
- [x] Quantity decreases immediately
- [x] Syncs to other device instantly
- [x] Shows "Delete?" if qty would go to 0

### Quick Templates
- [x] Show 5 most-used items
- [x] Tap item → quick qty/location picker
- [x] Add in <5 taps
- [x] Learns from history

---

## Timeline & Scope

| Feature | Duration | Effort |
|---------|----------|--------|
| Voice Input | 2-3 hours | Medium |
| Decrement Qty | 30 min | Easy |
| Quick Templates | 1-2 hours | Medium |
| **Total** | **4-5.5 hours** | **Medium** |

---

## Decisions to Make

1. **Voice parsing:** Claude API or simpler regex parsing?
   - Claude: More flexible, handles natural language, costs $$
   - Regex: Limited but fast and free (e.g., "2 cups milk" → parse qty, unit, name)
   - **Recommendation:** Start with regex, upgrade to Claude if needed

2. **Template learning:** localStorage vs Supabase?
   - localStorage: Instant, no latency, but doesn't sync across devices
   - Supabase: Syncs, but adds complexity
   - **Recommendation:** Start with localStorage, add Supabase later if needed

3. **Voice language:** English only or multi-language?
   - **Recommendation:** English only for Phase 2, add i18n in Phase 3+

---

## Let's Build!

Ready to start with **Voice Input**? (Highest impact, most used feature)

Or would you prefer **Decrement Qty first** (quick win, then voice)?
