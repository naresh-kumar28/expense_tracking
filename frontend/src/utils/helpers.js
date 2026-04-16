// Chart aur Badges ke liye common colors
export const CATEGORY_COLORS = [
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
];

// String name ke based par hamesha same color return karne wala helper function
export const getCategoryColorCode = (categoryName) => {
  if (!categoryName) return CATEGORY_COLORS[0];
  
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Math.abs se positive index banaya
  const index = Math.abs(hash) % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[index];
};
