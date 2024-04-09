import React, { FunctionComponent, useEffect, useState } from 'react';
import logger from 'electron-log/renderer';
import { Box, Button, CircularProgress, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  CEchoRequest,
  CEchoResponse,
  defaultDicomStorage,
  DicomNode,
} from '../../shared/shared-types';
import DicomNodeUI from './DicomNodeUI';
import ErrorAlert from './ErrorAlert';
import SuccessAlert from './SuccessAlert';
import { Settings } from '../../shared/configuration-properties';

// eslint-disable-next-line react/function-component-definition
const CEcho: FunctionComponent = () => {
  const { t } = useTranslation();
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [sending, setSending] = useState(false);
  const [node, setNode] = useState<DicomNode>(defaultDicomStorage);

  useEffect(() => {
    window.electron.ipcRenderer
      .getSettings()
      .then((settings: Settings) => {
        setNode(settings?.dicom?.storage);
        return settings;
      })
      .catch((ex) => {
        logger.error(ex);
      });
  }, []);

  const handleSendClick = () => {
    logger.log('Save storage request received');
    const data: CEchoRequest = {
      displayName: node.displayName,
      hostname: node.hostname,
      port: node.port,
      aet: node.aet,
      localAET: node.localAET,
    };
    setSending(true);
    setSuccessText('');
    setErrorText('');
    logger.info('Send C-ECHO request', data);
    window.electron.ipcRenderer
      .sendDicomCEcho(data)
      .then((response: CEchoResponse) => {
        logger.info('C-ECHO response', response);
        if (response.exitCode === 0) {
          setSuccessText(response.displayText);
          setErrorText('');
        } else {
          setErrorText(response.displayText);
          setSuccessText('');
        }
        return response;
      })
      .finally(() => {
        setSending(false);
      })
      .catch((e: Error) => {
        logger.error('C-ECHO response', e);
        setErrorText(e.message);
        setSuccessText('');
      });
  };

  return (
    <>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ padding: 1, margin: 1 }}>
          <DicomNodeUI
            node={node}
            edit
            showDisplayName={false}
            onChange={(n) => setNode(n)}
          />
          <Button
            sx={{ marginTop: 1, margiBottom: 1 }}
            color="primary"
            variant="contained"
            onClick={handleSendClick}
            disabled={sending}
          >
            {t('send')}
          </Button>
        </Paper>
        <Box sx={{ margin: 1 }}>
          <ErrorAlert text={errorText} />
          <SuccessAlert text={successText} />
        </Box>
      </Box>
      {sending && (
        <CircularProgress
          size="8rem"
          sx={{ position: 'relative', top: '-50%', left: '50%' }}
        />
      )}
    </>
  );
};

export default CEcho;
