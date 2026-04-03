import './App.css';
import React, { useState, useEffect } from 'react';
import NutritionalPlanner from './NutritionalPlanner'; // Componente adicional
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

import {
  Container, TextField, Button, RadioGroup, FormControlLabel, Radio,
  Typography, Box, Paper, Grid, FormControl, FormLabel, Tabs, Tab
} from '@mui/material';

/**
 * Main application component for the BMI Web App.
 *
 * Provides a BMI calculator and a nutritional planner with support for unit switching,
 * input validation, BMI categorization, health risk assessment, and persistent history.
 * Also includes language switching and informational content about BMI.
 *
 * State:
 * - weight, height, age, gender: User input values.
 * - bmi: Calculated BMI value.
 * - category: BMI category object (message, color, range).
 * - healthRisks: Array of health risk messages.
 * - errors: Validation errors for inputs.
 * - units: Current units for weight and height.
 * - history: Array of previous BMI calculations.
 * - currentTab: Selected tab index (0: BMI Calculator, 1: Nutritional Planner).
 *
 * Effects:
 * - Loads and saves BMI history to localStorage.
 *
 * Functions:
 * - validateInput: Validates user input.
 * - toggleUnits: Switches between metric and imperial units.
 * - calculateBMI: Handles BMI calculation and updates state/history.
 * - determineCategory: Determines BMI category and color.
 * - calculateHealthRisks: Returns health risks based on BMI, age, and gender.
 * - resetForm: Clears all input fields and results.
 * - clearHistory: Clears BMI calculation history.
 * - handleTabChange: Handles tab switching.
 *
 * UI:
 * - BMI calculator form with unit toggles, validation, and results display.
 * - BMI history list with clear option.
 * - Nutritional planner tab.
 * - Informational section about BMI.
 *
 * @component
 */
function App() {
  const { t } = useTranslation();

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState('');
  const [healthRisks, setHealthRisks] = useState([]);
  const [errors, setErrors] = useState({ weight: false, height: false, age: false });
  const [units, setUnits] = useState({ weight: 'kg', height: 'cm' });
  const [history, setHistory] = useState([]);
  const [currentTab, setCurrentTab] = useState(0); // 0 BMI, 1 Nutritional Planner

  // Histórico do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('bmiHistory');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('bmiHistory', JSON.stringify(history));
  }, [history]);

  const validateInput = () => {
    const newErrors = {
      weight: !weight || weight <= 0,
      height: !height || height <= 0,
      age: age && (age < 2 || age > 120),
    };
    setErrors(newErrors);
    return !newErrors.weight && !newErrors.height && !newErrors.age;
  };

  const toggleUnits = (type) => {
    if (type === 'weight') {
      if (units.weight === 'kg') {
        setUnits({ ...units, weight: 'lb' });
        if (weight) setWeight((parseFloat(weight) * 2.20462).toFixed(1));
      } else {
        setUnits({ ...units, weight: 'kg' });
        if (weight) setWeight((parseFloat(weight) / 2.20462).toFixed(1));
      }
    } else if (type === 'height') {
      if (units.height === 'cm') {
        setUnits({ ...units, height: 'in' });
        if (height) setHeight((parseFloat(height) / 2.54).toFixed(1));
      } else {
        setUnits({ ...units, height: 'cm' });
        if (height) setHeight((parseFloat(height) * 2.54).toFixed(1));
      }
    }
  };

  const calculateBMI = (e) => {
    e.preventDefault();
    if (!validateInput()) return;

    let weightInKg = parseFloat(weight);
    let heightInCm = parseFloat(height);

    if (units.weight === 'lb') weightInKg /= 2.20462;
    if (units.height === 'in') heightInCm *= 2.54;

    const heightInMeters = heightInCm / 100;
    const calculatedBMI = weightInKg / (heightInMeters * heightInMeters);
    const roundedBMI = calculatedBMI.toFixed(1);

    setBmi(roundedBMI);

    const categoryResult = determineCategory(calculatedBMI);
    setCategory(categoryResult);

    const risks = calculateHealthRisks(calculatedBMI, age, gender);
    setHealthRisks(risks);

    const newEntry = {
      date: new Date().toLocaleDateString(),
      weight: weightInKg.toFixed(1),
      height: heightInCm.toFixed(1),
      bmi: roundedBMI,
      category: categoryResult.message,
    };

    setHistory((prev) => [newEntry, ...prev.slice(0, 9)]);
  };

  const determineCategory = (value) => {
    let result;
    if (value < 16)
      result = { message: t('severeThinness'), color: '#FF3C3C', range: '<16' };
    else if (value < 17)
      result = { message: t('moderateThinness'), color: '#FF5C5C', range: '16-16.9' };
    else if (value < 18.5)
      result = { message: t('mildThinness'), color: '#FFA400', range: '17-18.4' };
    else if (value < 25)
      result = { message: t('normal'), color: '#2DC653', range: '18.5-24.9' };
    else if (value < 30)
      result = { message: t('overweight'), color: '#FFA400', range: '25-29.9' };
    else if (value < 35)
      result = { message: t('obeseClass1'), color: '#FF7E3C', range: '30-34.9' };
    else if (value < 40)
      result = { message: t('obeseClass2'), color: '#FF5C3C', range: '35-39.9' };
    else
      result = { message: t('obeseClass3'), color: '#FF3C3C', range: '40+' };

    if (age && age < 18) result.message += ` ${t('childBMIConsult')}`;
    return result;
  };

  const calculateHealthRisks = (bmiValue, age, gender) => {
    const risks = [];

    if (bmiValue < 18.5) {
      risks.push(t('potentialNutritionalDeficiencies'));
      risks.push(t('weakenedImmuneSystem'));
      if (bmiValue < 16) risks.push(t('severeHealthComplications'));
    } else if (bmiValue >= 25 && bmiValue < 30) {
      risks.push(t('increasedRiskHeartDisease'));
      risks.push(t('higherRiskType2Diabetes'));
    } else if (bmiValue >= 30) {
      risks.push(t('highRiskHeartDiseaseStroke'));
      risks.push(t('highRiskType2Diabetes'));
      risks.push(t('increasedRiskCertainCancers'));
      if (bmiValue >= 40) risks.push(t('severeHealthComplications'));
    }

    if (age) {
      const ageNum = parseInt(age);
      if (ageNum < 18 && bmiValue > 30) risks.push(t('riskEarlyOnsetDiabetes'));
      else if (ageNum > 65 && bmiValue < 22) risks.push(t('higherRiskFrailtyFalls'));
    }

    if (gender === 'female' && bmiValue < 18.5) {
      risks.push(t('potentialReproductiveHealthIssues'));
    }

    return risks;
  };

  const resetForm = () => {
    setWeight('');
    setHeight('');
    setAge('');
    setGender('');
    setBmi(null);
    setCategory('');
    setHealthRisks([]);
    setErrors({ weight: false, height: false, age: false });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('bmiHistory');
  };

  const handleTabChange = (event, newValue) => setCurrentTab(newValue);

  return (
    <Container maxWidth="sm" sx={{ paddingTop: 3, paddingBottom: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <LanguageSwitcher />
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} centered variant="fullWidth" sx={{ mb: 3 }}>
          <Tab label={t('bmiCalculator')} />
          <Tab label={t('nutritionalPlanner')} />
        </Tabs>

        {currentTab === 0 && (
          <>
            <Typography variant="h5" align="center" gutterBottom>{t('bmiHealthCalculator')}</Typography>
            <Box component="form" onSubmit={calculateBMI} noValidate>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={9}>
                  <TextField
                    label={`${t('weight')} (${units.weight})`}
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    inputProps={{ min: "0", step: "0.1" }}
                    error={errors.weight}
                    helperText={errors.weight ? t('validWeightError') : ''}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <Button variant="text" onClick={() => toggleUnits('weight')} fullWidth>
                    {t('switchTo')} {units.weight === 'kg' ? 'lb' : 'kg'}
                  </Button>
                </Grid>
              </Grid>

              <Grid container spacing={2} alignItems="flex-end" sx={{ mt: 1 }}>
                <Grid item xs={9}>
                  <TextField
                    label={`${t('height')} (${units.height})`}
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    inputProps={{ min: "0", step: "0.1" }}
                    error={errors.height}
                    helperText={errors.height ? t('validHeightError') : ''}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <Button variant="text" onClick={() => toggleUnits('height')} fullWidth>
                    {t('switchTo')} {units.height === 'cm' ? 'in' : 'cm'}
                  </Button>
                </Grid>
              </Grid>

              <TextField
                label={t('age')}
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                inputProps={{ min: 0, max: 120 }}
                error={errors.age}
                helperText={errors.age ? t('validAgeError') : ''}
                fullWidth
                sx={{ mt: 2 }}
              />

              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormLabel component="legend">{t('gender')}</FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <FormControlLabel value="male" control={<Radio />} label={t('male')} />
                  <FormControlLabel value="female" control={<Radio />} label={t('female')} />
                  <FormControlLabel value="other" control={<Radio />} label={t('other')} />
                </RadioGroup>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button type="submit" variant="contained" color="primary" fullWidth>{t('calculateBMI')}</Button>
                <Button type="button" variant="outlined" onClick={resetForm} fullWidth>{t('reset')}</Button>
              </Box>
            </Box>

            {bmi && (
              <Paper
                elevation={1}
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: category.color + '15',
                }}
              >
                <Box
                  sx={{
                    backgroundColor: category.color,
                    color: 'white',
                    borderRadius: 1,
                    textAlign: 'center',
                    mb: 2,
                    p: 1,
                  }}
                >
                  <Typography variant="h6">{category.message}</Typography>
                </Box>
                <Typography variant="h3" align="center" gutterBottom>{bmi}</Typography>
                <Typography align="center">{t('bmiCategory')}: <strong>{category.message}</strong></Typography>
                <Typography align="center">{t('healthyBMIRange')}: <strong>18.5-24.9</strong></Typography>
                <Typography align="center" gutterBottom>{t('yourCategoryRange')}: <strong>{category.range}</strong></Typography>

                {/* Health Risks */}
                {healthRisks.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="h6">{t('healthConsiderations')}</Typography>
                    <ul>
                      {healthRisks.map((risk, i) => (
                        <li key={i}>
                          <Typography variant="body2">{risk}</Typography>
                        </li>
                      ))}
                    </ul>
                    <Typography variant="caption" display="block" mt={1}>
                      {t('disclaimer')}
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}

            {history.length > 0 && (
              <Paper elevation={1} sx={{ mt: 3, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h5">{t('bmiHistory')}</Typography>
                  <Button size="small" color="secondary" onClick={clearHistory}>{t('clear')}</Button>
                </Box>
                {history.map((entry, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{ p: 1.5, mb: 1, display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant="body2">{entry.date}</Typography>
                    <Box>
                      <Typography variant="body1" component="span" fontWeight="bold">{entry.bmi} </Typography>
                      <Typography variant="caption" component="span">({entry.category})</Typography>
                    </Box>
                  </Paper>
                ))}
              </Paper>
            )}
          </>
        )}

        {currentTab === 1 && (
          <NutritionalPlanner userData={{ weight, height, age, gender }} />
        )}
      </Paper>

      <Paper elevation={1} sx={{ mt: 2, p: 2 }}>
        <Typography variant="h5" gutterBottom>{t('aboutBMI')}</Typography>
        <Typography paragraph>
          {t('aboutBMIText1')}
        </Typography>
        <Typography paragraph>
          {t('aboutBMIText2')}
        </Typography>
        <ul>
          <li>{t('severeThinness')}</li>
          <li>{t('normalWeight')}</li>
          <li>{t('overweight')}</li>
          <li>{t('obesity')}</li>
        </ul>
        <Typography paragraph>
          <strong>{t('limitations')}</strong> {t('limitationsText')}
        </Typography>
      </Paper>

        <Paper elevation={1} sx={{ mt: 2, p: 2 }}>
        <Typography variant="h5" gutterBottom>{t('aboutNutritionalPlan')}</Typography>
        <Typography paragraph>
          {t('aboutNutricionText1')}
        </Typography>
      </Paper>
      
    </Container>
  );
}

export default App;