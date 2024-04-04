import { Box, Tab, Tabs } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/PageHeader';
import CEcho from '../../components/CEcho';
import DicomWorklistUI from '../../components/DicomWorklistUI';
import PatientQueryUI from '../../components/PatientQueryUI';
import TabContent from '../../components/TabContext';

export default function ToolsPage() {
  const { t } = useTranslation();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <PageHeader title={t('tools')} />
      <Box sx={{ margin: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label={t('send_c_echo')} />
          <Tab label={t('dicom_modality_worklist')} />
          <Tab label={t('query_patient')} />
        </Tabs>
      </Box>
      <TabContent index={0} value={value}>
        <CEcho />
      </TabContent>
      <TabContent index={1} value={value}>
        <DicomWorklistUI edit />
      </TabContent>
      <TabContent index={2} value={value}>
        <PatientQueryUI />
      </TabContent>
    </>
  );
}
