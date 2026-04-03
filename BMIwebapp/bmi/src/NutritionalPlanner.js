import React, { useState } from 'react';
import GoalSelector from './GoalSelector';
import ActivityLevelSelector from './ActivityLevelSelector';
import NutritionalPlanDisplay from './NutritionalPlanDisplay';
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacros } from './nutritionalCalculator';
import { Button, Typography, Paper, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
/**
 * NutritionalPlanner component generates a personalized nutritional plan based on user data,
 * selected goal, and activity level. It validates input, calculates BMR, TDEE, target calories,
 * and macronutrient distribution, and displays the resulting plan or error messages.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.userData - The user's data for calculation.
 * @param {number|string} props.userData.weight - The user's weight (kg).
 * @param {number|string} props.userData.height - The user's height (cm).
 * @param {number|string} props.userData.age - The user's age (years).
 * @param {string} props.userData.gender - The user's gender ('male' or 'female').
 * @returns {JSX.Element} The rendered NutritionalPlanner component.
 */
const NutritionalPlanner = ({ userData }) => {
  const { t } = useTranslation();
  const [goal, setGoal] = useState(t('maintenance')); // 'loss', 'gain', 'maintenance'
  const [activityLevel, setActivityLevel] = useState(t('sedentary')); // 'sedentary', 'lightly', 'moderately', 'very', 'extra'
  const [plan, setPlan] = useState(null);
  const [localError, setLocalError] = useState(''); // Added error state

  const handleCalculatePlan = () => {
    setLocalError(''); // Clear previous errors
    if (!userData || !userData.weight || !userData.height || !userData.age || !userData.gender) {
      setLocalError(t('enterAllYourDetails'));
      setPlan(null); // Clear previous plan if error
      return;
    }

    // Convert userData to numbers
    const weight = parseFloat(userData.weight);
    const height = parseFloat(userData.height);
    const age = parseInt(userData.age, 10);
    const gender = userData.gender; // 'male' or 'female'

    if (isNaN(weight) || isNaN(height) || isNaN(age) ) {
        setLocalError(t('InvalidUserData'));
        setPlan(null);
        return;
    }

    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const calorieGoal = calculateTargetCalories(tdee, goal);
    const macros = calculateMacros(calorieGoal, weight);

    setPlan({
      tdee,
      calories: calorieGoal,
      ...macros,
    });
  };

  return (
    <Paper sx={{ padding: 3, marginTop: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        {t('nutritionalPlanGenerator')}
      </Typography>
      {localError && <Alert severity="error" sx={{ marginBottom: 2 }}>{localError}</Alert>}
      <GoalSelector goal={goal} setGoal={setGoal} />
      <ActivityLevelSelector activityLevel={activityLevel} setActivityLevel={setActivityLevel} />
      <Button
        variant="contained"
        color="primary"
        onClick={handleCalculatePlan}
        fullWidth
        sx={{ marginTop: 2, marginBottom: 2 }}
      >
        
        {t('calculateNutritionalPlan')}
      </Button>
      {plan && <NutritionalPlanDisplay plan={plan} />}
    </Paper>
  );
};

export default NutritionalPlanner;
