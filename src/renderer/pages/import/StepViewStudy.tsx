import React, { FunctionComponent, useState } from 'react';
import { Box } from '@mui/material';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import logger from 'electron-log/renderer';
import { useDispatch, useSelector } from 'react-redux';
import StepperButtons from './StepperButtons';
import {
  DicomImageMeta,
  DicomSeriesMeta,
  DicomStudyMeta,
} from '../../../shared/shared-types';
import PdfViewer from '../../components/PdfViewer/PdfViewer';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import StudyListUI from './StudyListUI';
import { getStudies, setSelectedStudies } from './jobSlice';

interface StepPreviewStudiesProps {
  onNext: () => void;
  onBack: () => void;
}

// eslint-disable-next-line react/function-component-definition
const StepViewStudy: FunctionComponent<StepPreviewStudiesProps> = ({
  onNext,
  onBack,
}: StepPreviewStudiesProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const readStudies: DicomStudyMeta[] = useSelector(getStudies);
  const [bottomRight, setBottomRight] = useState<any>('');
  const [previewImage, setPreviewImage] = useState<DicomImageMeta>();
  const [dicomSerie, setDicomSerie] = useState<DicomSeriesMeta | undefined>();
  const [dicomStudy, setDicomStudy] = useState<DicomStudyMeta | undefined>();
  const [studiesSelected, setStudiesSelected] =
    useState<DicomStudyMeta[]>(readStudies);

  const handleBackStepClick = () => {
    onBack();
  };

  const handleNextStepClick = () => {
    // @ts-ignore
    dispatch(setSelectedStudies(studiesSelected));
    onNext();
  };

  const handleStudySelected = (study: DicomStudyMeta, selected: boolean) => {
    const index: number = studiesSelected.indexOf(study);

    if (selected && index === -1) {
      setStudiesSelected(studiesSelected.slice().concat(study));
    } else if (!selected && index !== -1) {
      setStudiesSelected(studiesSelected.filter((e, i) => i !== index));
    }
  };

  const handlePreviewImageClick = (
    serie: DicomSeriesMeta,
    study: DicomStudyMeta,
  ) => {
    logger.debug('Image clicked %s', previewImage);

    if (serie === undefined) {
      setBottomRight('');
      setPreviewImage(undefined);
      setDicomSerie(undefined);
      setDicomStudy(undefined);
    } else {
      logger.info('select series ', serie.seriesInstanceUID);

      setPreviewImage(serie.previewImage);
      setDicomSerie(serie);
      setDicomStudy(study);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {/* Contains left side list of studies and in the center the image/pdf viewer */}
      <Box sx={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
        <StudyListUI
          studiesSelected={studiesSelected}
          onSelectedStudy={handleStudySelected}
          onImageClick={handlePreviewImageClick}
        />

        {previewImage?.directoryRecordType !== 'ENCAP DOC' && (
          <ImageViewer
            bottomRight={bottomRight}
            center=""
            dicomSerie={dicomSerie}
            study={dicomStudy}
          />
        )}

        {previewImage?.directoryRecordType === 'ENCAP DOC' && (
          <PdfViewer image={previewImage} />
        )}
      </Box>

      <StepperButtons
        sx={{ marginTop: 1 }}
        backCaption={t('back')}
        backIcon={<FaArrowLeft />}
        onBack={handleBackStepClick}
        nextCaption={t('studies_selected')}
        nextIcon={<FaArrowRight />}
        onNext={handleNextStepClick}
        nextDisabled={studiesSelected.length === 0}
      />
    </Box>
  );
};

export default StepViewStudy;
