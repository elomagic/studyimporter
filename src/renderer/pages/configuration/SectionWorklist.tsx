import React, { FunctionComponent, useEffect, useState } from 'react';
import logger from 'electron-log/renderer';
import { Box, Button } from '@mui/material';
import { FaSave } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  undefinedSettings,
} from '../../../shared/configuration-properties';
import {
  defaultDicomNode,
  defaultDicomWorklist,
  DicomNode,
  DicomQuery,
  DicomWorklistNode,
} from '../../../shared/shared-types';
import DicomNodeUI from '../../components/DicomNodeUI';
import DicomWorklistQueryUI from '../../components/DicomWorklistQueryUI';
import ErrorAlert from '../../components/ErrorAlert';
import SuccessAlert from '../../components/SuccessAlert';

// eslint-disable-next-line react/function-component-definition
const WorklistSection: FunctionComponent = () => {
  const { t } = useTranslation();
  const [node, setNode] = useState<DicomNode>(defaultDicomNode);
  const [query, setQuery] = useState<DicomQuery>(defaultDicomWorklist().query);
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
        setNode(settings?.dicom?.worklist);
        setQuery(settings?.dicom?.worklist?.query);
        return settings;
      })
      .catch((ex) => {
        logger.error(ex);
      });
  }, []);

  useEffect(() => {
    setSaveSuccessText('');
    setSaveErrorText('');
  }, [node, query]);

  const handleSaveClick = () => {
    const n: DicomWorklistNode = Object.assign(node, defaultDicomWorklist());
    n.query = query;

    setSaveSuccessText('');
    setSaveErrorText('');
    logger.log('Save worklist request received');
    const settings = undefinedSettings();
    settings.dicom.worklist = n;
    logger.log('[Renderer] Apply settings: ', settings);
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <DicomNodeUI
        node={node}
        edit
        showDisplayName
        onChange={(data) => {
          setNode(data);
        }}
      />
      <DicomWorklistQueryUI
        query={query}
        edit
        onChange={(data) => {
          setQuery(data);
        }}
      />

      <Box>
        <Button
          variant="contained"
          onClick={handleSaveClick}
          sx={{ marginTop: 1, marginBottom: 1 }}
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

export default WorklistSection;
