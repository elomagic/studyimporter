import { Box, Step, StepLabel, Stepper } from '@mui/material';
import React, { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/PageHeader';
import StepViewStudy from './StepViewStudy';
import StepLinkStudies from './StepLinkStudies';
import StepStoreStudies from './StepStoreStudies';
import StepSelectMediaSource from './StepSelectMediaSource';

interface StepProps {
  children?: React.ReactNode;
  step: number;
  value: number;
}

function StepContent(props: Readonly<StepProps>) {
  const { children, value, step } = props;

  return (
    <Box
      sx={{
        p: 1,
        margin: 0,
        flexGrow: 1,
        display: value === step ? 'flex' : 'none',
        flexDirection: 'column',
      }}
      role="tabpanel"
      hidden={value !== step}
      id={`import-step-tab-content-${step}`}
      aria-labelledby={`tab-content-${step}`}
    >
      {children}
    </Box>
  );
}

// eslint-disable-next-line react/function-component-definition
const ImportPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [stepIndex, setStepIndex] = useState<number>(0);

  const steps = [
    t('select_source'),
    t('choose_studies'),
    t('link_studies'),
    t('store_images'),
  ];

  const handleBackClick = () => {
    if (stepIndex === 0) {
      navigate('/');
    } else {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleNextClick = () => {
    if (stepIndex + 1 === steps.length) {
      navigate('/');
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  return (
    <>
      <PageHeader title={t('import_studies')} importMode />
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          marginTop: 1,
        }}
      >
        <Stepper activeStep={stepIndex} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <StepContent step={0} value={stepIndex}>
          <StepSelectMediaSource
            onBack={handleBackClick}
            onNext={handleNextClick}
          />
        </StepContent>
        <StepContent step={1} value={stepIndex}>
          <StepViewStudy onBack={handleBackClick} onNext={handleNextClick} />
        </StepContent>
        <StepContent step={2} value={stepIndex}>
          <StepLinkStudies onBack={handleBackClick} onNext={handleNextClick} />
        </StepContent>
        <StepContent step={3} value={stepIndex}>
          <StepStoreStudies onBack={handleBackClick} onNext={handleNextClick} />
        </StepContent>
      </Box>
    </>
  );
};

export default ImportPage;
