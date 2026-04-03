import { Card, CardContent, Typography, List, ListItem, ListItemText, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Displays a nutritional plan summary including estimated TDEE, target calories, and macronutrient breakdown.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.plan - The nutritional plan data to display.
 * @param {number} props.plan.tdee - Estimated Total Daily Energy Expenditure.
 * @param {number} props.plan.calories - Target daily calorie intake.
 * @param {number} props.plan.protein - Daily protein intake in grams.
 * @param {number} props.plan.fat - Daily fat intake in grams.
 * @param {number} props.plan.carbs - Daily carbohydrate intake in grams.
 * @returns {JSX.Element|null} The rendered nutritional plan display, or null if no plan is provided.
 */
const NutritionalPlanDisplay = ({ plan }) => {
  const { t } = useTranslation();

  if (!plan) {
    return null;
  }

  return (
    <Box mt={3}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            {t('nutritionalPlan')}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {t('EstimatedTDEE')} {plan.tdee.toFixed(0)} {t('calories')}
          </Typography>
          <Typography variant="h6" component="div" color="primary" gutterBottom>
            {t('TargetCalories')} {plan.calories.toFixed(0)} {t('calories')}
          </Typography>
          <Typography variant="h6" component="div" mt={2}>
            {t('Macronutrients')}
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary={`${t('Protein')}: ${plan.protein.toFixed(0)}g`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`${t('Fat')}: ${plan.fat.toFixed(0)}g`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`${t('Carbohydrates')}: ${plan.carbs.toFixed(0)}g`} />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NutritionalPlanDisplay;
