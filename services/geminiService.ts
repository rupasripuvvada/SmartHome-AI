
import { GoogleGenAI, Type } from "@google/genai";
import { Category, InventoryItem, FamilyProfile, Recipe, MealPlanDay, IdentifiedFood, WarrantyAsset } from "../types";

const getTodayStr = () => new Date().toISOString().split('T')[0];

export const parseReceiptOCR = async (base64Image: string): Promise<Partial<InventoryItem>[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: `Extract grocery items from this receipt. Today's date is ${getTodayStr()}. For each item, identify: name, estimated quantity, unit, and purchase date (today). ALSO, estimate a reasonable expiry date based on standard shelf life for that food type. Map items strictly to these Categories: Dairy, Fruits & Vegetables, Meat & Seafood, Grains & Pasta, Snacks, Beverages, Pantry Essentials, Other. Return as a JSON array.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
            unit: { type: Type.STRING },
            category: { type: Type.STRING },
            expiryDate: { type: Type.STRING, description: 'Estimated expiry date YYYY-MM-DD' }
          },
          required: ["name", "quantity", "unit", "category", "expiryDate"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const fixInventoryExpiry = async (inventory: InventoryItem[]): Promise<InventoryItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const itemsText = inventory.map(i => `${i.id}: ${i.name} (Cat: ${i.category})`).join('\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Today is ${getTodayStr()}. I have an inventory list. Some expiry dates might be wrong. Please suggest the most accurate YYYY-MM-DD expiry date for each ID based on common shelf life from today. Return as JSON array of objects with 'id' and 'expiryDate'.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            expiryDate: { type: Type.STRING }
          },
          required: ["id", "expiryDate"]
        }
      }
    }
  });
  
  const fixes: {id: string, expiryDate: string}[] = JSON.parse(response.text || '[]');
  return inventory.map(item => {
    const fix = fixes.find(f => f.id === item.id);
    return fix ? { ...item, expiryDate: fix.expiryDate } : item;
  });
};

export const parseWarrantyOCR = async (base64Image: string): Promise<Partial<WarrantyAsset>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: `Extract product warranty info. Today is ${getTodayStr()}. Identify the Product Name, Brand, Purchase Date, Model Number, and Warranty Expiry Date. Return as JSON.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          brand: { type: Type.STRING },
          purchaseDate: { type: Type.STRING },
          expiryDate: { type: Type.STRING },
          modelNumber: { type: Type.STRING }
        },
        required: ["productName", "brand", "purchaseDate", "expiryDate"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const detectFoodAndExpiry = async (base64Image: string): Promise<Partial<IdentifiedFood>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: `Identify the food in this photo. Today's date is ${getTodayStr()}. Provide the name, ingredients, and estimate a SAFE expiry date based on today. Also provide brief freshness notes. Return JSON.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          expiryDate: { type: Type.STRING },
          freshnessNotes: { type: Type.STRING }
        },
        required: ["name", "ingredients", "expiryDate", "freshnessNotes"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const getRecipeForMeal = async (mealTitle: string, inventory: InventoryItem[], profile: FamilyProfile): Promise<Recipe> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const inventoryPrompt = inventory.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Detailed recipe for: "${mealTitle}". 
    Family Size: ${profile.size}. 
    Available Inventory: ${inventoryPrompt}. 
    Diet: ${profile.preference}. 
    STRICT CONSTRAINT: You MUST only use ingredients currently in the inventory. If an item is missing, suggest a clever substitute using an ingredient that IS in the inventory. Return as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.STRING }
              },
              required: ["name", "amount"]
            }
          },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
          prepTime: { type: Type.STRING },
          matchingItems: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["id", "title", "ingredients", "instructions", "prepTime", "matchingItems"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateRecipes = async (inventory: InventoryItem[], profile: FamilyProfile): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const inventoryPrompt = inventory.map(i => `${i.name} (exp: ${i.expiryDate})`).join(', ');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Suggest 3 recipes using ONLY these ingredients: ${inventoryPrompt}. Today: ${getTodayStr()}. Scale for ${profile.size} people. Prioritize using items expiring soonest. Do not include ingredients NOT in the list. Return JSON array.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.STRING }
                },
                required: ["name", "amount"]
              }
            },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            prepTime: { type: Type.STRING },
            matchingItems: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["id", "title", "ingredients", "instructions", "prepTime", "matchingItems"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const generateMealPlan = async (inventory: InventoryItem[], profile: FamilyProfile, startDate: string): Promise<MealPlanDay[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const inventoryPrompt = inventory.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Create a 7-day healthy meal plan starting ${startDate} using ONLY these ingredients: ${inventoryPrompt}. 
    Family of ${profile.size}. Diet: ${profile.preference}. 
    STRICT CONSTRAINT: Every meal must be 100% cookable with available stock. Focus on expiring items. Return JSON array.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            dayName: { type: Type.STRING },
            breakfast: { type: Type.STRING },
            lunch: { type: Type.STRING },
            dinner: { type: Type.STRING }
          },
          required: ["date", "dayName", "breakfast", "lunch", "dinner"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};
