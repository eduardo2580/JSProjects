import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

const GoalSelector = ({ goal = '', setGoal }) => {
  const { t } = useTranslation();

  return (
    <FormControl fullWidth margin="normal">
      <InputLabel id="goal-select-label">{t('selectYourGoal')}</InputLabel>
      <Select
        labelId="goal-select-label"
        id="goal-select"
        value={goal}
        label={t('selectYourGoal')}
        onChange={(e) => setGoal(e.target.value)}
      >
        <MenuItem value="maintenance">{t('maintainWeight')}</MenuItem>
        <MenuItem value="loss">{t('weightLoss')}</MenuItem>
        <MenuItem value="gain">{t('weightGain')}</MenuItem>
      </Select>
    </FormControl>
  );
};

export default GoalSelector;
