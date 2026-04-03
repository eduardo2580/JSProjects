import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * ActivityLevelSelector is a React component that renders a dropdown menu for selecting the user's activity level.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.activityLevel - The currently selected activity level.
 * @param {function} props.setActivityLevel - Function to update the selected activity level.
 * @returns {JSX.Element} The rendered ActivityLevelSelector component.
 */
const ActivityLevelSelector = ({ activityLevel, setActivityLevel }) => {
  const { t } = useTranslation();
  return (
    <FormControl fullWidth margin="normal">
      <InputLabel id="activity-level-select-label">{t('SelectYourActivityLevel')}</InputLabel>
      <Select
        labelId="activity-level-select-label"
        id="activity-level-select"
        value={activityLevel}
        label={t('SelectYourActivityLevel')}
        onChange={(e) => setActivityLevel(e.target.value)}
      >
        <MenuItem value="sedentary">{t('Sedentary')}</MenuItem>
        <MenuItem value="lightly">{t('LightlyActive')}</MenuItem>
        <MenuItem value="moderately">{t('ModeratelyActive')}</MenuItem>
        <MenuItem value="very">{t('VeryActive')}</MenuItem>
        <MenuItem value="extra">{t('ExtraActive')}</MenuItem>
      </Select>
    </FormControl>
  );
};

export default ActivityLevelSelector;
