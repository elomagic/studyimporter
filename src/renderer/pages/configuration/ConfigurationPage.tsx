import React, { useEffect } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import logger from 'electron-log/renderer';
import { useLocation } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import SectionCommon from './SectionCommon';
import SectionStorage from './SectionStorage';
import SectionWorklist from './SectionWorklist';
import SectionDicomTools from './SectionDicomTools';
import SectionIsIntegration from './SectionIsIntegration';
import TabContent from '../../components/TabContext';
import SectionImport from './SectionImport';

export default function ConfigurationPage() {
  const { t } = useTranslation();
  const [value, setValue] = React.useState(0);
  const location = useLocation();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    const { hash } = location;

    logger.log(`Hash=${hash}`);
    switch (hash) {
      case '#DicomTools':
        setValue(1);
        break;
      case '#PacsStorage':
        setValue(2);
        break;
      case '#ImportOptions':
        setValue(3);
        break;
      case '#DMWL':
        setValue(4);
        break;
      case '#IsIntegration':
        setValue(5);
        break;
      default:
        setValue(0);
    }
    if (hash === '#DicomTools') {
      setValue(3);
    }
  }, [location]);

  return (
    <>
      <PageHeader title={t('configuration')} />
      <Box sx={{ margin: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label={t('common')} />
          <Tab label={t('dicom_tools')} />
          <Tab label={t('pacs_storage')} />
          <Tab label={t('import')} />
          <Tab label={t('d_mwl')} />
          <Tab label={t('is_integration')} />
        </Tabs>
      </Box>
      <TabContent index={0} value={value}>
        <SectionCommon />
      </TabContent>
      <TabContent index={1} value={value}>
        <SectionDicomTools />
      </TabContent>
      <TabContent index={2} value={value}>
        <SectionStorage />
      </TabContent>
      <TabContent index={3} value={value}>
        <SectionImport />
      </TabContent>
      <TabContent index={4} value={value}>
        <SectionWorklist />
      </TabContent>
      <TabContent index={5} value={value}>
        <SectionIsIntegration />
      </TabContent>
    </>
  );
}
