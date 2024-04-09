import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import logger from 'electron-log/renderer';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  FaArrowRight,
  FaCompactDisc,
  FaFolder,
  FaHome,
  FaImages,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { BsFillUsbDriveFill } from 'react-icons/bs';
import { useDispatch } from 'react-redux';
import { Dispatch, PayloadAction } from '@reduxjs/toolkit';
import {
  ImportSource,
  Settings,
  undefinedSettings,
} from '../../../shared/configuration-properties';
import StepperButtons from './StepperButtons';
import TextFieldFolderChooser from '../../components/TextFieldFolderChooser';
import { mapDicomDirIntoModel } from '../../dicom-client';
import ErrorAlert from '../../components/ErrorAlert';
import TabContent from '../../components/TabContext';
import { DicomStudyMeta } from '../../../shared/shared-types';
import { setStudies } from './jobSlice';

const tab2KeyMap = new Map<number, ImportSource>([
  [0, ImportSource.Path1],
  [1, ImportSource.Path2],
  [2, ImportSource.Folder],
  [3, ImportSource.Files],
]);

interface SelectMediaSourceProps {
  onNext: () => void;
  onBack: () => void;
}

// eslint-disable-next-line react/function-component-definition
const StepSelectMediaSource: FunctionComponent<SelectMediaSourceProps> = ({
  onNext,
  onBack,
}: SelectMediaSourceProps) => {
  const { t } = useTranslation();
  const dispatch: Dispatch<PayloadAction<DicomStudyMeta[]>> = useDispatch();
  const importFolderRef = useRef<HTMLInputElement>(null);
  const [readStudies, setReadStudies] = useState<DicomStudyMeta[]>([]);
  const [alertText, setAlertText] = useState<string | undefined>(undefined);
  const [patientCount, setPatientCount] = useState(0);
  const [serieCount, setSerieCount] = useState(0);
  const [defaultDir1, setDefaultDir1] = useState<string | undefined>('');
  const [defaultDir2, setDefaultDir2] = useState<string | undefined>('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [nextDisabled, setNextDisabled] = useState<boolean>(true);
  const [readDisabled, setReadDisabled] = useState(false);
  const [progressMode, setProgressMode] = useState<
    'determinate' | 'indeterminate'
  >('indeterminate');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    window.electron.ipcRenderer
      .getSettings()
      .then((settings: Settings) => {
        setDefaultDir1(settings.importOptions?.defaultImportPath1);
        setDefaultDir2(settings.importOptions?.defaultImportPath2);

        switch (settings.importOptions?.lastUsedImportMode) {
          case ImportSource.Path1: {
            setSelectedTab(0);
            break;
          }
          case ImportSource.Path2: {
            setSelectedTab(1);
            break;
          }
          case ImportSource.Folder: {
            setSelectedTab(2);
            break;
          }
          default: {
            setSelectedTab(0);
          }
        }

        if (importFolderRef?.current != null) {
          importFolderRef.current.value =
            settings.importOptions?.lastUsedImportFolder ?? '';
        }

        // return settings.importOptions?.lastUsedImportFolder === undefined
        //   ? window.electron.ipcRenderer.getPath('home')
        //   : Promise.resolve(settings.importOptions?.lastUsedImportFolder);
        return settings;
      })
      .catch((ex) => {
        logger.error(ex);
        setAlertText(ex.message);
      });
  }, []);

  const getSelectedFolder = (): string | undefined => {
    switch (selectedTab) {
      case 0: {
        return defaultDir1;
      }
      case 1: {
        return defaultDir2;
      }
      case 2: {
        return importFolderRef?.current?.value;
      }
      // case 3: {
      //   setSelectedFolder(importFolderRef?.current?.value);
      //  break;
      // }
      default: {
        logger.warn(`Tab index ${selectedTab} not supported`);
        return defaultDir1;
      }
    }
  };

  const readDicomDir = () => {
    logger.info("Request 'readDicomDirAsXml'");
    setReadDisabled(true);
    setNextDisabled(true);
    setPatientCount(0);
    setSerieCount(0);
    setProgressMode('indeterminate');
    setAlertText(undefined);
    window.electron.ipcRenderer
      .readDicomDirAsXml(getSelectedFolder())
      .then((xmlResponse) => {
        const settings = undefinedSettings();
        settings.importOptions.lastUsedImportMode = tab2KeyMap.get(selectedTab);
        window.electron.ipcRenderer.applySettings(settings);
        return xmlResponse.xml;
      })
      .then((xml) => {
        setReadStudies(
          mapDicomDirIntoModel(xml, getSelectedFolder(), (pc, sc, serc) => {
            setPatientCount(pc);
            setSerieCount(serc);
            setNextDisabled(sc === 0);
          }),
        );

        return xml;
      })
      .finally(() => {
        setReadDisabled(false);
      })
      .catch((ex: Error) => {
        logger.error(ex);
        setNextDisabled(true);
        setAlertText(ex.message);
      });
  };

  const readDicomFiles = () => {
    // TODO
    logger.info("Request 'readDicomDirAsXml'");
    setReadDisabled(true);
    setNextDisabled(true);
    setPatientCount(0);
    setSerieCount(0);
    setProgressMode('determinate');
    setAlertText(undefined);
    window.electron.ipcRenderer
      .collectDicomFiles(getSelectedFolder())
      .then((files) => {
        // TODO CircleProgress setProgress(0);
        const settings = undefinedSettings();
        settings.importOptions.lastUsedImportMode = tab2KeyMap.get(selectedTab);
        window.electron.ipcRenderer.applySettings(settings);
        return files;
      })
      .then((dicomFiles) => {
        dicomFiles.forEach((file, index, files) => {
          window.electron.ipcRenderer
            .readDicomFileAsXml(file)
            // eslint-disable-next-line promise/no-nesting
            .then((xmlResponse) => {
              const settings = undefinedSettings();
              settings.importOptions.lastUsedImportMode =
                tab2KeyMap.get(selectedTab);
              window.electron.ipcRenderer.applySettings(settings);
              return xmlResponse.xml;
            })
            // eslint-disable-next-line promise/no-nesting
            .then((xml) => {
              // TODO Map file and append to tree
              // TODO Update read counter
              // TODO If last item then call onStudiesRead
              setReadStudies(
                mapDicomDirIntoModel(
                  xml,
                  getSelectedFolder(),
                  (pc, sc, serc) => {
                    setPatientCount(pc);
                    setSerieCount(serc);
                    setNextDisabled(sc === 0);
                  },
                ),
              );

              setProgress((100 / files.length) * index);
              return xml;
            })
            .finally(() => {
              setReadDisabled(false);
            })
            // eslint-disable-next-line promise/no-nesting
            .catch((ex: Error) => {
              logger.error(ex.message);
              setNextDisabled(true);
              setAlertText(ex.message);
            });
        });
        return dicomFiles;
      })
      .finally(() => {
        setReadDisabled(false);
      })
      .catch((ex: Error) => {
        logger.error(ex.message);
        setNextDisabled(true);
        setAlertText(ex.message);
      });
  };

  const handleReadData = () => {
    window.electron.ipcRenderer
      .existsDicomDirFile(getSelectedFolder())
      .then((exists: boolean) => {
        if (exists) {
          readDicomDir();
        } else {
          readDicomFiles();
        }
        return exists;
      })
      .catch((ex: Error) => {
        logger.error(ex.message);
        setNextDisabled(true);
        setAlertText(ex.message);
      });
  };

  const handleBackClick = () => {
    onBack();
  };

  const handleNextClick = () => {
    logger.info('Studies read: %s', readStudies.length);
    // @ts-ignore
    dispatch(setStudies(readStudies));
    onNext();
  };

  const handleFolderChanged = (folder: string): void => {
    const settings = undefinedSettings();
    if (folder !== undefined) {
      settings.importOptions.lastUsedImportFolder = folder;
      window.electron.ipcRenderer.applySettings(settings).catch((ex) => {
        logger.error(ex);
        setAlertText(ex.message);
      });
    }
  };

  const handleTabChange = (
    event: React.SyntheticEvent,
    newTabIndex: number,
  ) => {
    setNextDisabled(true);
    setPatientCount(0);
    setSerieCount(0);
    setSelectedTab(newTabIndex);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Paper sx={{ padding: 1, marginTop: 1, marginBottom: 1 }}>
        <ToggleButtonGroup
          value={selectedTab}
          exclusive
          size="large"
          onChange={handleTabChange}
          aria-label="text alignment"
        >
          <ToggleButton value={0} aria-label={t('cd_rom')}>
            <FaCompactDisc />
            &nbsp;
            {t('cd_rom')}
          </ToggleButton>
          <ToggleButton value={1} aria-label={t('sd_card')}>
            <BsFillUsbDriveFill />
            &nbsp;
            {t('usb_stick')}
          </ToggleButton>
          <ToggleButton value={2} aria-label={t('folder')}>
            <FaFolder />
            &nbsp;
            {t('folder')}
          </ToggleButton>
          <ToggleButton value={3} aria-label={t('files')}>
            <FaImages />
            &nbsp;
            {t('files')}
          </ToggleButton>
        </ToggleButtonGroup>

        <TabContent index={0} value={selectedTab}>
          <h5>{t('insert_cd')}</h5>
        </TabContent>
        <TabContent index={1} value={selectedTab}>
          <h5>{t('insert_usb')}</h5>
        </TabContent>
        <TabContent index={2} value={selectedTab}>
          <TextFieldFolderChooser
            sx={{ width: '100%', marginTop: 1, marginBottom: 1 }}
            inputRef={importFolderRef}
            onChange={handleFolderChanged}
            label={t('folder')}
            placeholder={t('choose_dicom_folder')}
          />
        </TabContent>
        <TabContent index={3} value={selectedTab}>
          <h5>{t('not_implemented_yet')}</h5>
        </TabContent>

        <Button
          variant="contained"
          onClick={handleReadData}
          disabled={readDisabled}
        >
          {t('read_data')}
        </Button>
      </Paper>

      <ErrorAlert text={alertText} />

      {!alertText && (
        <Box>
          <Paper sx={{ padding: 1, marginTop: 1, marginBottom: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={2}>
                {t('patients_found')}:
              </Grid>
              <Grid item xs={10}>
                {patientCount}
              </Grid>

              <Grid item xs={2}>
                {t('studies_found')}:
              </Grid>
              <Grid item xs={10}>
                {readStudies.length}
              </Grid>

              <Grid item xs={2}>
                {t('series_found')}:
              </Grid>
              <Grid item xs={10}>
                {serieCount}
              </Grid>
            </Grid>
          </Paper>
          {readDisabled && (
            <CircularProgress
              variant={progressMode}
              value={progress}
              size="5rem"
              sx={{ position: 'relative', top: '-50%', left: '50%' }}
            />
          )}
        </Box>
      )}

      <Box sx={{ flexGrow: 1 }} />

      <StepperButtons
        backCaption={t('home')}
        backIcon={<FaHome />}
        onBack={handleBackClick}
        nextDisabled={nextDisabled}
        nextCaption={t('data_read')}
        nextIcon={<FaArrowRight />}
        onNext={handleNextClick}
      />
    </Box>
  );
};

export default StepSelectMediaSource;
