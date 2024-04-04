import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import logger from 'electron-log/renderer';
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { FaSave } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import {
  AnnouncementMode,
  Settings,
  undefinedSettings,
} from '../../../shared/configuration-properties';
import TextFieldFolderChooser from '../../components/TextFieldFolderChooser';
import ErrorAlert from '../../components/ErrorAlert';
import SuccessAlert from '../../components/SuccessAlert';
import { TestFhirConnectionResponse } from '../../../shared/shared-types';

// eslint-disable-next-line react/function-component-definition
const SectionImport: FunctionComponent = () => {
  const { t } = useTranslation();
  const dicomDir1Ref = useRef<HTMLInputElement>(null);
  const dicomDir2Ref = useRef<HTMLInputElement>(null);
  const localAETRef = useRef<HTMLInputElement>(null);
  const [announcementMode, setAnnouncementMode] = useState<AnnouncementMode>(
    AnnouncementMode.NoAnnouncement,
  );
  const fhirBaseRef = useRef<HTMLInputElement>(null);
  const fhirUsernameRef = useRef<HTMLInputElement>(null);
  const fhirPasswordRef = useRef<HTMLInputElement>(null);
  const fhirTokenRef = useRef<HTMLInputElement>(null);
  const [errorText, setErrorText] = useState<string | undefined>(undefined);
  const [saveSuccessText, setSaveSuccessText] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    window.electron.ipcRenderer
      .getSettings()
      .then((settings: Settings) => {
        if (dicomDir1Ref?.current != null) {
          dicomDir1Ref.current.value =
            settings.importOptions?.defaultImportPath1 ?? 'd:\\';
        }
        if (dicomDir2Ref?.current != null) {
          dicomDir2Ref.current.value =
            settings.importOptions?.defaultImportPath2 ?? 'e:\\';
        }
        if (localAETRef?.current != null) {
          localAETRef.current.value = settings.dicom?.localAET ?? '';
        }

        setAnnouncementMode(
          settings.importOptions?.announcement?.mode ??
            AnnouncementMode.NoAnnouncement,
        );
        if (fhirBaseRef?.current != null) {
          fhirBaseRef.current.value =
            settings.importOptions.announcement.baseURL ?? '';
        }
        if (fhirUsernameRef?.current != null) {
          fhirUsernameRef.current.value =
            settings.importOptions.announcement.username ?? '';
        }
        if (fhirPasswordRef?.current != null) {
          fhirPasswordRef.current.value = 'DoYaThinkIAmAnIdiot?';
        }
        if (fhirTokenRef?.current != null) {
          fhirTokenRef.current.value =
            settings.importOptions.announcement.bearerToken ?? '';
        }

        return settings;
      })
      .catch((ex) => {
        logger.error(ex);
      });
  }, []);

  const handleChangeAnnouncement = (mode: string) => {
    setAnnouncementMode(mode as AnnouncementMode);
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

  const handleSaveClick = () => {
    setErrorText(undefined);
    setSaveSuccessText(undefined);

    logger.log('Save common request received');
    const settings = undefinedSettings();
    settings.importOptions.defaultImportPath1 =
      dicomDir1Ref?.current?.value ?? 'd:\\';
    settings.importOptions.defaultImportPath2 =
      dicomDir2Ref?.current?.value ?? 'e:\\';
    settings.dicom.localAET = localAETRef?.current?.value ?? '';

    let baseUrl = fhirBaseRef?.current?.value ?? '';
    if (baseUrl?.endsWith('/')) {
      baseUrl = baseUrl?.substring(0, baseUrl.length - 1);
    }
    settings.importOptions.announcement.baseURL = baseUrl;
    settings.importOptions.announcement.username =
      fhirUsernameRef?.current?.value ?? '';
    settings.importOptions.announcement.password =
      fhirPasswordRef?.current?.value ||
      fhirPasswordRef?.current?.value !== 'DoYaThinkIAmAnIdiot?'
        ? fhirPasswordRef?.current?.value
        : settings.fhir.password;
    settings.importOptions.announcement.bearerToken =
      fhirTokenRef?.current?.value ?? '';

    window.electron.ipcRenderer
      .applySettings(settings)
      .then((result) => {
        setSaveSuccessText(t('successful_saved'));
        return result;
      })
      .catch((e: Error) => {
        setErrorText(e.message);
      });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <TextFieldFolderChooser
            inputRef={dicomDir1Ref}
            sx={{ width: '100%' }}
            label={t('cd_rom_drive_path')}
            placeholder={t('choose_dicom_folder')}
          />
        </Grid>

        <Grid item xs={6}>
          <TextFieldFolderChooser
            inputRef={dicomDir2Ref}
            sx={{ width: '100%' }}
            label={t('usb_stick_drive_path')}
            placeholder={t('choose_dicom_folder')}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            inputRef={localAETRef}
            sx={{ width: '100%' }}
            type="text"
            size="small"
            placeholder={t('aet')}
            label={t('my_aet')}
            inputProps={{ maxLength: 16 }}
          />
        </Grid>
        <Grid item xs={6} />

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            {t('announcement')}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="announcement-select-label">
              {t('announcement')}
            </InputLabel>
            <Select
              sx={{ width: '100%' }}
              size="small"
              labelId="announcement-select-label"
              label={t('announcement')}
              id="announcement-select"
              value={announcementMode}
              onChange={(e) => handleChangeAnnouncement(String(e.target.value))}
            >
              <MenuItem value={AnnouncementMode.NoAnnouncement}>
                {t('no_announcement')}
              </MenuItem>
              <MenuItem value={AnnouncementMode.BeforeStoringImages}>
                {t('announcement_before_storing_images')}
              </MenuItem>
              <MenuItem value={AnnouncementMode.AfterStoringImages}>
                {t('announcement_after_storing_images')}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} />

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
          sx={{ marginTop: 1, marginBottom: 1 }}
          onClick={handleSaveClick}
          endIcon={<FaSave />}
        >
          {t('save_this_configuration')}
        </Button>
      </Box>

      <ErrorAlert text={errorText} />
      <SuccessAlert text={saveSuccessText} />
    </Box>
  );
};

export default SectionImport;
