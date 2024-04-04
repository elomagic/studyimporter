import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Grid, Slide, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FaSave } from 'react-icons/fa';
import logger from 'electron-log/renderer';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import ErrorAlert from '../../components/ErrorAlert';
import SuccessAlert from '../../components/SuccessAlert';
import {
  Settings,
  undefinedSettings,
} from '../../../shared/configuration-properties';
import { TestFhirConnectionResponse } from '../../../shared/shared-types';

export default function SectionIsIntegration() {
  const { t } = useTranslation();
  const fhirBaseRef = useRef<HTMLInputElement>(null);
  const fhirUsernameRef = useRef<HTMLInputElement>(null);
  const fhirPasswordRef = useRef<HTMLInputElement>(null);
  const fhirTokenRef = useRef<HTMLInputElement>(null);
  const [errorText, setErrorText] = useState<string | undefined>(undefined);
  const [saveSuccessText, setSaveSuccessText] = useState<string | undefined>(
    undefined,
  );

  const handleSaveClick = () => {
    logger.log('Save IS integration request received');
    const settings = undefinedSettings();
    let baseUrl = fhirBaseRef?.current?.value ?? '';
    if (baseUrl?.endsWith('/')) {
      baseUrl = baseUrl?.substring(0, baseUrl.length - 1);
    }
    settings.fhir.baseURL = baseUrl;
    settings.fhir.username = fhirUsernameRef?.current?.value ?? '';
    settings.fhir.password =
      fhirPasswordRef?.current?.value ||
      fhirPasswordRef?.current?.value !== 'DoYaThinkIAmAnIdiot?'
        ? fhirPasswordRef?.current?.value
        : settings.fhir.password;
    settings.fhir.bearerToken = fhirTokenRef?.current?.value ?? '';
    window.electron.ipcRenderer
      .applySettings(settings)
      .then((result) => {
        setSaveSuccessText(t('successful_saved'));
        setErrorText('');
        return result;
      })
      .catch((e: Error) => {
        logger.error(e.message);
        setSaveSuccessText('');
        setErrorText(e.message);
      });
  };

  const handleTestClick = () => {
    window.electron.ipcRenderer
      .testFhirConnection({
        baseURL: fhirBaseRef?.current?.value,
        username: fhirUsernameRef?.current?.value,
        password: fhirPasswordRef?.current?.value,
        bearerToken: fhirTokenRef?.current?.value,
      })
      .then((result: TestFhirConnectionResponse) => {
        enqueueSnackbar(`${result.statusText}. Status=${result.status}`, {
          variant: result.status === 200 ? 'success' : 'error',
          preventDuplicate: true,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
        return result;
      })
      .catch((err) => {
        setErrorText(err);
      });
  };

  useEffect(() => {
    logger.debug('Call getSettings');
    window.electron.ipcRenderer
      .getSettings()
      .then((settings: Settings) => {
        if (fhirBaseRef?.current != null) {
          fhirBaseRef.current.value = settings.fhir.baseURL ?? '';
        }
        if (fhirUsernameRef?.current != null) {
          fhirUsernameRef.current.value = settings.fhir.username ?? '';
        }
        if (fhirPasswordRef?.current != null) {
          fhirPasswordRef.current.value = 'DoYaThinkIAmAnIdiot?';
        }
        if (fhirTokenRef?.current != null) {
          fhirTokenRef.current.value = settings.fhir.bearerToken ?? '';
        }

        return settings;
      })
      .catch((ex) => {
        logger.error(ex);
        setErrorText(ex.message);
      });
  }, []);

  return (
    <SnackbarProvider TransitionComponent={Slide}>
      <Box>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              sx={{ width: '100%' }}
              inputRef={fhirBaseRef}
              type="url"
              size="small"
              placeholder={t('url')}
              label={t('fhir_base_url')}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              sx={{ width: '100%' }}
              inputRef={fhirUsernameRef}
              type="text"
              size="small"
              placeholder={t('username')}
              label={t('username')}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              sx={{ width: '100%' }}
              inputRef={fhirPasswordRef}
              type="password"
              size="small"
              placeholder={t('password')}
              label={t('password')}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              sx={{ width: '100%' }}
              inputRef={fhirTokenRef}
              type="text"
              size="small"
              placeholder={t('bearer_token')}
              label={t('bearer_token')}
            />
          </Grid>
        </Grid>
        <Box>
          <Button
            variant="contained"
            sx={{ marginTop: 1, marginBottom: 1 }}
            onClick={handleTestClick}
          >
            {t('test')}
          </Button>
        </Box>
        <Box>
          <Button
            variant="contained"
            endIcon={<FaSave />}
            sx={{ marginTop: 1, marginBottom: 1 }}
            onClick={handleSaveClick}
          >
            {t('save_this_configuration')}
          </Button>
        </Box>
        <ErrorAlert text={errorText} />
        <SuccessAlert text={saveSuccessText} />
      </Box>
    </SnackbarProvider>
  );
}
