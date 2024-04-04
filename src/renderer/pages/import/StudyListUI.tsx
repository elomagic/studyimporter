import React, { FunctionComponent } from 'react';
import { Box, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { DicomSeriesMeta, DicomStudyMeta } from '../../../shared/shared-types';
import StudyListItemUI from './StudyListItemUI';
import { getStudies } from './jobSlice';

interface StudyListUIProps {
  studiesSelected: DicomStudyMeta[];
  onSelectedStudy: (study: DicomStudyMeta, selected: boolean) => void;
  onImageClick: (serie: DicomSeriesMeta, study: DicomStudyMeta) => void;
}

// eslint-disable-next-line react/function-component-definition
const StudyListUI: FunctionComponent<StudyListUIProps> = ({
  studiesSelected,
  onSelectedStudy,
  onImageClick,
}: StudyListUIProps) => {
  const readStudies: DicomStudyMeta[] = useSelector(getStudies);
  const handleStudySelectionChanged = (
    study: DicomStudyMeta,
    selected: boolean,
  ) => {
    onSelectedStudy(study, selected);
  };

  return (
    <Box
      id="StudyListUI"
      sx={{ width: '200px', display: 'flex', flexDirection: 'column' }}
    >
      <Button
        size="small"
        variant="contained"
        color="info"
        sx={{ marginBottom: 1 }}
      >
        (Un-)Select All
      </Button>
      <Box sx={{ overflow: 'hidden scroll', flexGrow: 1, height: '1px' }}>
        {readStudies?.map((study) => (
          <StudyListItemUI
            key={study.studyInstanceUID}
            study={study}
            checked={studiesSelected.indexOf(study) > -1}
            onSelected={handleStudySelectionChanged}
            onImageClick={(serie: DicomSeriesMeta) =>
              onImageClick(serie, study)
            }
          />
        ))}
      </Box>
    </Box>
  );
};

export default StudyListUI;
