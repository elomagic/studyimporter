import React, { FunctionComponent, useEffect, useState } from 'react';
import { Box, Button, LinearProgress, Paper } from '@mui/material';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';
import logger from 'electron-log/renderer';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import StepperButtons from './StepperButtons';
import {
  CStoreRequest,
  CStoreResponse,
  defaultDicomStorage,
  DicomImageMeta,
  DicomNode,
  DicomStudyMeta,
} from '../../../shared/shared-types';
import ErrorAlert from '../../components/ErrorAlert';
import {
  Announcement,
  AnnouncementMode,
  defaultAnnouncement,
  Settings,
} from '../../../shared/configuration-properties';
import { getLinkPatient, getSelectedStudies } from './jobSlice';

interface StepStoreStudiesProps {
  onNext: () => void;
  onBack: () => void;
}

// eslint-disable-next-line react/function-component-definition
const StepStoreStudies: FunctionComponent<StepStoreStudiesProps> = ({
  onBack,
  onNext,
}: StepStoreStudiesProps) => {
  const { t } = useTranslation();
  const [backDisabled, setBackDisabled] = useState<boolean>(false);
  const [nextDisabled, setNextDisabled] = useState<boolean>(true);
  const [storeDisabled, setStoreDisabled] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [storingLogLines, setStoringLogLines] = useState<string[]>([
    'Log output',
  ]);
  const [dicomNode, setDicomNode] = useState<DicomNode>(defaultDicomStorage);
  const [announcement, setAnnouncement] =
    useState<Announcement>(defaultAnnouncement);
  const linkPatient = useSelector(getLinkPatient);
  const selectedStudies: DicomStudyMeta[] = useSelector(getSelectedStudies);

  const showError = (text: string) => {
    setAlertText(text);
  };

  useEffect(() => {
    showError('');

    window.electron.ipcRenderer
      .getSettings()
      .then(
        (settings: Settings) => {
          setDicomNode(settings?.dicom?.storage);
          setAnnouncement(settings?.importOptions.announcement);
          return settings;
        },
        (reject) => {
          throw reject;
        },
      )
      .catch((ex) => {
        logger.error(ex);
        showError(ex.message);
      });
  }, []);

  const handleBackClick = () => {
    onBack();
  };

  const handleNextClick = () => {
    onNext();
  };

  const insertStoringLog = async (
    lines: string[],
    text: string,
  ): Promise<string[]> => {
    lines.splice(0, 0, text);
    setStoringLogLines(lines);
    return lines;
  };

  const announceStudy = (
    study: DicomStudyMeta,
    lines: string[],
  ): Promise<string[]> => {
    logger.info(
      `❓ Announcing new study ${study.studyInstanceUID} to patient ID: ${linkPatient.patientID}`,
    );
    // TODO
    return insertStoringLog(lines, 'Linking to patient announced');
  };

  const storeImage = async (
    image: DicomImageMeta,
    lines: string[],
  ): Promise<string[]> => {
    const request: CStoreRequest = {
      ...image,
      ...dicomNode,
    };

    return window.electron.ipcRenderer.storeDicomImage(request).then(
      (_storeResponse: CStoreResponse) => {
        return insertStoringLog(
          lines,
          t('image_successful_stored', { url: image.dicomFileURL }),
        );
      },
      (reject) => {
        throw reject;
      },
    );
  };

  const storeStudies = () => {
    let textLines: string[] = [];

    showError('');
    setStoringLogLines([]);
    setProgress(0);
    setBackDisabled(true);
    setStoreDisabled(true);
    setNextDisabled(true);

    if (
      linkPatient &&
      announcement.mode === AnnouncementMode.BeforeStoringImages
    ) {
      selectedStudies.forEach((study) => {
        announceStudy(study, textLines);
      });
    }

    const images: DicomImageMeta[] = [];

    // Collect all DICOM files to store in one array
    selectedStudies.forEach((study) => {
      study.series.forEach((serie) => {
        serie.images.forEach((image) => {
          images.push(image);
        });
      });
    });

    images.sort((a, b) => a.dicomFileURL.localeCompare(b.dicomFileURL));

    let count = 0;

    images.forEach((image) => {
      storeImage(image, textLines)
        .then((lines) => {
          textLines = lines;
          return textLines;
        })
        .finally(() => {
          count += 1;
          setProgress(Math.round((count / images.length) * 100));
          setNextDisabled(count < images.length - 1);
        })
        .catch((e) => {
          logger.error(e);
          showError(e);
          insertStoringLog(
            textLines,
            t('image_store_failed', { url: image.dicomFileURL }),
          ).then((text) => {
            textLines = text;
            return textLines;
          });
        });
    });

    if (
      linkPatient &&
      announcement.mode === AnnouncementMode.AfterStoringImages
    ) {
      selectedStudies.forEach((study) => {
        announceStudy(study, textLines);
      });
    }
  };

  const handleStoreStudies = () => {
    try {
      storeStudies();
    } catch (ex: any) {
      showError(ex);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex' }}>
        <Button
          size="small"
          sx={{ marginBottom: 1 }}
          variant="contained"
          onClick={handleStoreStudies}
          disabled={storeDisabled}
        >
          {t('store_studies')}
        </Button>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ marginBottom: 1 }}
      />

      <ErrorAlert text={alertText} />

      <Paper
        id="filled-multiline-static"
        sx={{
          marginBottom: 1,
          width: '100%',
          flexGrow: 1,
          padding: 1,
          overflow: 'auto',
        }}
      >
        <Box sx={{ height: 0 }}>
          {storingLogLines.map((line: string) => {
            return (
              <Box key={line}>
                {line}
                <br />
              </Box>
            );
          })}
        </Box>
      </Paper>

      <StepperButtons
        backCaption={t('back')}
        backIcon={<FaArrowLeft />}
        backDisabled={backDisabled}
        onBack={handleBackClick}
        nextDisabled={nextDisabled}
        nextCaption={t('close')}
        nextIcon={<FaCheck />}
        onNext={handleNextClick}
      />
    </Box>
  );
};

export default StepStoreStudies;
