import {
  Box,
  Button,
  ButtonProps,
  Link,
  Slide,
  Stack,
  styled,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import log from 'electron-log';
import { GiCompactDisc, GiToolbox } from 'react-icons/gi';
import { RxGear } from 'react-icons/rx';
import { useTranslation } from 'react-i18next';
import { FaPowerOff } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import background from '../../../../assets/background.png';
import YesNoDialog from '../../components/YesNoDialog';

const TileColorButton = styled(Button)<ButtonProps>(() => ({
  width: '250px',
  height: '250px',
}));

export default function MainPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(false);

  const handleExitClick = () => {
    window.electron.ipcRenderer.closeApplication();
  };

  useEffect(() => {
    window.electron.ipcRenderer
      .checkDicomTools()
      .then((result) => {
        if (result.dicomTools.filter((tool) => !tool.status).length > 0) {
          enqueueSnackbar(t('no_dicom_toolkit_found'), {
            variant: 'warning',
            persist: true,
            preventDuplicate: true,
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
            action: (
              <Link href="/configuration#DicomTools" sx={{ color: '#0000EE;' }}>
                {t('setup')}
              </Link>
            ),
          });
        }
        return result;
      })
      .catch((err) => {
        log.error(err);
      });
  }, [navigate, t]);

  return (
    <Box
      sx={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        flexGrow: 1,
        display: 'flex',
      }}
    >
      <SnackbarProvider TransitionComponent={Slide}>
        <Box sx={{ margin: 1, position: 'absolute', top: 0, right: 0 }}>
          <FaPowerOff onClick={() => setOpen(true)} />
        </Box>
        <Stack direction="column" spacing={4} textAlign="center" margin="auto">
          <Box sx={{ flexGrow: 1 }} />
          <Typography
            variant="h1"
            textAlign="center"
            sx={{ textShadow: '2px 2px 4px black' }}
          >
            {t('study_importer')} 3
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Tooltip title={t('import_studies')}>
              <TileColorButton
                variant="contained"
                href="/import"
                sx={{
                  color: 'white',
                  backgroundColor: 'hsl(110,50%,50%)',
                  '&:hover': {
                    backgroundColor: '#3ffc00',
                  },
                }}
                startIcon={<GiCompactDisc size="8em" />}
              />
            </Tooltip>
            <Tooltip title={t('tools')}>
              <TileColorButton
                variant="contained"
                href="/tools"
                sx={{
                  color: 'white',
                  backgroundColor: 'hsl(209,50%,50%)',
                  '&:hover': {
                    backgroundColor: '#008ffc',
                  },
                }}
                startIcon={<GiToolbox size="8em" />}
              />
            </Tooltip>
            <Tooltip title={t('configuration')}>
              <TileColorButton
                variant="contained"
                href="/configuration"
                sx={{
                  color: 'white',
                  backgroundColor: 'hsl(297, 50%, 50%)',
                  '&:hover': {
                    backgroundColor: '#f000fc',
                  },
                }}
                startIcon={<RxGear size="8em" />}
              />
            </Tooltip>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
        </Stack>
        <Link
          href="/about"
          sx={{ margin: 1, position: 'absolute', bottom: 0, right: 0 }}
        >
          {t('about')}...
        </Link>
        <YesNoDialog
          title={t('confirmation')}
          text={t('exit_app_question')}
          captionYes={t('exit')}
          captionNo={t('cancel')}
          open={open}
          onYesClick={handleExitClick}
          onNoClick={() => setOpen(false)}
        />
      </SnackbarProvider>
    </Box>
  );
}
