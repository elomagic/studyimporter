import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import logger from 'electron-log/renderer';
import {
  formatDicomDateString,
  formatDicomTimeString,
} from '../../string-formatter';
import {
  DicomImageMeta,
  DicomSeriesMeta,
  DicomStudyMeta,
} from '../../../shared/shared-types';
import { Settings } from '../../../shared/configuration-properties';

type ImagePreviewProps = {
  bottomRight: string;
  center: string;
  image: DicomImageMeta | undefined;
  dicomSerie: DicomSeriesMeta | undefined;
  study: DicomStudyMeta | undefined;
};

// eslint-disable-next-line react/function-component-definition
const TextOverlay: FunctionComponent<ImagePreviewProps> = ({
  bottomRight,
  center,
  image,
  dicomSerie,
  study,
}: ImagePreviewProps) => {
  const { t } = useTranslation();
  // const [dicomImages, setDicomImages] = useState<DicomImageMeta[]>([]);
  const [locale, setLocale] = useState<string>();

  useEffect(() => {
    window.electron.ipcRenderer
      .getSettings()
      .then((settings: Settings) => {
        setLocale(settings.ui.language);
        return settings;
      })
      .catch((ex) => {
        logger.error(ex);
      });
  }, []);

  return (
    <>
      <Box className="ImageViewer-top-left">
        <div>
          #{dicomSerie?.patient?.patientID}{' '}
          {dicomSerie?.patient?.patientDisplayName}
        </div>
        <div>
          *
          {formatDicomDateString(
            dicomSerie?.patient?.patientDayOfBirth,
            locale,
          )}{' '}
          {dicomSerie?.patient?.patientGender}
        </div>
        <div>
          {(image?.instanceNumber ?? 0) + 1}/{dicomSerie?.images.length}
        </div>
      </Box>
      <Box className="ImageViewer-top-right">
        <div>{dicomSerie?.institutionName}</div>
        <div>
          {image?.manufacturer} {image?.manufacturerModelName}
        </div>
        <div>{study?.studyDescription}</div>
        <div>
          {formatDicomDateString(study?.performedDate, locale)}{' '}
          {formatDicomTimeString(study?.performedTime, t('time_format'))}
        </div>
      </Box>
      <Box className="ImageViewer-bottom-left">
        <div>{dicomSerie?.seriesDescription}</div>
        <div>{dicomSerie?.modality}</div>
      </Box>
      <Box className="ImageViewer-bottom-right">{bottomRight}</Box>
      <Box className="ImageViewer-center">{center}</Box>
    </>
  );
};

export default TextOverlay;
