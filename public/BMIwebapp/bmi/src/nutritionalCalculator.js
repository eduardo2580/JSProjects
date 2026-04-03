// BMR Calculation using Mifflin-St Jeor Equation
export const calculateBMR = (weight, height, age, gender) => {
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else { // female
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
};

// TDEE Calculation
export const calculateTDEE = (bmr, activityLevel) => {
  const activityFactors = {
    sedentary: 1.2,
    lightly: 1.375,
    moderately: 1.55,
    very: 1.725,
    extra: 1.9,
  };
  return bmr * (activityFactors[activityLevel] || 1.2); // Default to sedentary if level is unknown
};

// Target Calories Calculation
export const calculateTargetCalories = (tdee, goal) => {
  switch (goal) {
    case 'loss':
      return tdee - 500; // 500 calorie deficit for weight loss
    case 'gain':
      return tdee + 300; // 300 calorie surplus for weight gain (adjust as needed)
    default: // maintenance
      return tdee;
  }
};

// Macronutrient Calculation
// Protein: 1.8g/kg of body weight
// Fat: 25% of total calories
// Carbohydrates: Remaining calories
/**
 * Calculates daily macronutrient requirements (protein, fat, carbs) based on target calories and body weight.
 *
 * @param {number} targetCalories - The total daily calorie target.
 * @param {number} weight - The individual's body weight in kilograms.
 * @returns {{protein: number, fat: number, carbs: number}} An object containing the calculated grams of protein, fat, and carbohydrates.
 */
export const calculateMacros = (targetCalories, weight) => {
  const proteinGrams = 1.8 * weight;
  const proteinCalories = proteinGrams * 4;

  const fatCalories = targetCalories * 0.25;
  const fatGrams = fatCalories / 9;

  const carbCalories = targetCalories - proteinCalories - fatCalories;
  const carbGrams = carbCalories / 4;

  return {
    protein: proteinGrams,
    fat: fatGrams,
    carbs: carbGrams,
  };
};
