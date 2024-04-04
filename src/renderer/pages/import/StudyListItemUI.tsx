import { FunctionComponent } from 'react';
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { DicomSeriesMeta, DicomStudyMeta } from '../../../shared/shared-types';
import ImagePreview from './ImagePreview';

interface StudyListItemUIProps {
  study: DicomStudyMeta;
  checked: boolean;
  onSelected: (study: DicomStudyMeta, selected: boolean) => void;
  onImageClick: (serie: DicomSeriesMeta) => void;
}
// eslint-disable-next-line react/function-component-definition
const StudyListItemUI: FunctionComponent<StudyListItemUIProps> = ({
  study,
  checked,
  onSelected,
  onImageClick,
}: StudyListItemUIProps) => {
  const handleOnChange = () => {
    onSelected(study, !checked);
  };

  const handleImageClick = (i: DicomSeriesMeta) => {
    onImageClick(i);
  };

  return (
    <>
      <FormControlLabel
        control={
          <Checkbox checked={checked} size="small" onChange={handleOnChange} />
        }
        label={study.studyDescription}
      />
      {[...study.series].map((serie) => (
        <Box key={serie.seriesInstanceUID}>
          <Typography
            variant="body2"
            component="div"
            sx={{ whiteSpace: 'nowrap', overflow: 'none' }}
          >
            {serie.modality} / {serie.seriesDescription}
          </Typography>
          <ImagePreview
            image={serie.previewImage}
            onClick={() => handleImageClick(serie)}
          />
        </Box>
      ))}
    </>
  );
};

export default StudyListItemUI;
