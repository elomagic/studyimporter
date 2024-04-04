import React, { FunctionComponent, useEffect, useState } from 'react';
import logger from 'electron-log/renderer';
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { FaSave } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  undefinedSettings,
} from '../../../shared/configuration-properties';
import ErrorAlert from '../../components/ErrorAlert';
import SuccessAlert from '../../components/SuccessAlert';

// eslint-disable-next-line react/function-component-definition
const CommonSection: FunctionComponent = () => {
  const { i18n, t } = useTranslation();
  const [language, setLanguage] = useState<string>('en');

  const [saveErrorText, setSaveErrorText] = useState<string | undefined>(
    undefined,
  );
  const [saveSuccessText, setSaveSuccessText] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    window.electron.ipcRenderer
      .getSettings()
      .then((settings: Settings) => {
        setLanguage(settings.ui?.language ?? 'en');
        return settings;
      })
      .catch((ex) => {
        logger.error(ex);
      });
  }, []);

  const handleChangeLanguage = (lng: string) => {
    setLanguage(lng);
    i18n.changeLanguage(lng);
  };

  const handleSaveClick = () => {
    setSaveErrorText(undefined);
    setSaveSuccessText(undefined);

    logger.log('Save common request received');
    const settings = undefinedSettings();
    settings.ui.language = language;

    window.electron.ipcRenderer
      .applySettings(settings)
      .then((result) => {
        setSaveSuccessText(t('successful_saved'));
        return result;
      })
      .catch((e: Error) => {
        setSaveErrorText(e.message);
      });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel id="language-select-label">{t('language')}</InputLabel>
            <Select
              sx={{ width: '100%' }}
              size="small"
              labelId="language-select-label"
              label={t('language')}
              id="language-select"
              value={language}
              onChange={(e) => handleChangeLanguage(String(e.target.value))}
            >
              <MenuItem value="en">{t('english')}</MenuItem>
              <MenuItem value="de">{t('german')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={8} />
      </Grid>

      <Box>
        <Button
          variant="contained"
          sx={{ marginTop: 1, marginBottom: 1 }}
          onClick={handleSaveClick}
          endIcon={<FaSave />}
        >
          {t('save_this_configuration')}
        </Button>
      </Box>

      <ErrorAlert text={saveErrorText} />
      <SuccessAlert text={saveSuccessText} />
    </Box>
  );
};

export default CommonSection;
