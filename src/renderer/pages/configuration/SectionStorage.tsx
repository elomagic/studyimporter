import React, { useEffect, useState } from 'react';
import logger from 'electron-log/renderer';
import { Box, Button } from '@mui/material';
import { FaSave } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { defaultDicomStorage, DicomNode } from '../../../shared/shared-types';
import {
  Settings,
  undefinedSettings,
} from '../../../shared/configuration-properties';
import DicomNodeUI from '../../components/DicomNodeUI';
import ErrorAlert from '../../components/ErrorAlert';
import SuccessAlert from '../../components/SuccessAlert';

export default function SectionStorage() {
  const { t } = useTranslation();
  const [node, setNode] = useState<DicomNode>(defaultDicomStorage);
  const [saveErrorText, setSaveErrorText] = useState<string | undefined>(
    undefined,
  );
  const [saveSuccessText, setSaveSuccessText] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    logger.debug('Call getSettings');
    window.electron.ipcRenderer
      .getSettings()
      .then((settings: Settings) => {
        setNode(settings.dicom.storage);
        return settings;
      })
      .catch((ex) => {
        logger.error(ex);
      });
  }, []);

  const handleSaveClick = () => {
    logger.log('Save storage request received');
    const settings = undefinedSettings();
    settings.dicom.storage = node;
    window.electron.ipcRenderer
      .applySettings(settings)
      .then((result) => {
        setSaveSuccessText(t('successful_saved'));
        setSaveErrorText('');
        return result;
      })
      .catch((e: Error) => {
        logger.error(e.message);
        setSaveSuccessText('');
        setSaveErrorText(e.message);
      });
  };

  return (
    <>
      <DicomNodeUI
        node={node}
        edit
        showDisplayName
        onChange={(data) => setNode(data)}
      />
      <Box>
        <Button
          variant="contained"
          endIcon={<FaSave />}
          sx={{ marginTop: 1 }}
          onClick={handleSaveClick}
        >
          {t('save_this_configuration')}
        </Button>
      </Box>
      <ErrorAlert text={saveErrorText} />
      <SuccessAlert text={saveSuccessText} />
    </>
  );
}
