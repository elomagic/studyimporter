import React, { FunctionComponent, useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Box, Paper, Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import logger from 'electron-log';
import { useDispatch } from 'react-redux';
import StepperButtons from './StepperButtons';
import PatientQueryUI from '../../components/PatientQueryUI';
import TabContent from '../../components/TabContext';
import { setLinkPatient } from './jobSlice';

interface StepLinkStudiesProps {
  onNext: () => void;
  onBack: () => void;
}

// eslint-disable-next-line react/function-component-definition
const StepLinkStudies: FunctionComponent<StepLinkStudiesProps> = ({
  onBack,
  onNext,
}: StepLinkStudiesProps) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const dispatch = useDispatch();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handlePatientSelected = (patient: any | undefined) => {
    logger.info('Selected row: %s', patient);
    // @ts-ignore
    dispatch(setLinkPatient(patient));
  };

  const handleBackClick = () => {
    onBack();
  };

  const handleNextClick = () => {
    onNext();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          padding: 1,
          marginBottom: 1,
        }}
      >
        <Box>
          <Tabs value={selectedTab} onChange={handleChange}>
            <Tab label={t('query_patient')} />
            <Tab label={t('dicom_modality_worklist')} />
          </Tabs>
        </Box>
        <TabContent index={0} value={selectedTab}>
          <PatientQueryUI onSelect={handlePatientSelected} />
        </TabContent>
        <TabContent index={1} value={selectedTab}>
          e.g. DICOM Worklist, Patient FHIR Query. {t('not_implemented_yet')}
        </TabContent>
      </Paper>
      <StepperButtons
        backCaption={t('back')}
        backIcon={<FaArrowLeft />}
        onBack={handleBackClick}
        nextCaption={t('studies_linked')}
        nextIcon={<FaArrowRight />}
        onNext={handleNextClick}
        nextDisabled={false}
      />
    </Box>
  );
};

export default StepLinkStudies;
