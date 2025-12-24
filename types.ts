
export enum Category {
  DAIRY = 'Dairy',
  FRUITS = 'Fruits & Vegetables',
  MEAT = 'Meat & Seafood',
  GRAINS = 'Grains & Pasta',
  SNACKS = 'Snacks',
  BEVERAGES = 'Beverages',
  PANTRY = 'Pantry Essentials',
  WARRANTY = 'Warranty & Assets',
  OTHER = 'Other'
}

export enum DietPreference {
  VEG = 'Vegetarian',
  NON_VEG = 'Non-Vegetarian',
  VEGAN = 'Vegan'
}

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expiryDate: string;
  minStockLevel: number;
  isExpired?: boolean;
}

export interface IdentifiedFood {
  id: string;
  name: string;
  ingredients: string[];
  freshnessNotes: string;
  expiryDate: string;
  identifiedAt: string;
  imageUrl?: string;
}

export interface WarrantyAsset {
  id: string;
  productName: string;
  brand: string;
  purchaseDate: string;
  expiryDate: string;
  modelNumber?: string;
}

export interface FamilyProfile {
  size: number;
  preference: DietPreference;
  allergies: string[];
  emailAlerts: boolean;
  userEmail?: string;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: { name: string; amount: string }[];
  instructions: string[];
  prepTime: string;
  matchingItems: string[];
}

export interface MealPlanDay {
  date: string; // YYYY-MM-DD
  dayName: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface WasteRecord {
  id: string;
  itemName: string;
  date: string;
  quantity: number;
  category: Category;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    name: string;
    email: string;
  } | null;
}
