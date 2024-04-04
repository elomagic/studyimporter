import React, { FunctionComponent } from 'react';
import { Box, Button, Stack, Theme } from '@mui/material';
import { SxProps } from '@mui/system/styleFunctionSx';

interface StepperButtonsProps {
  backCaption: string;
  backIcon: React.ReactNode;
  // eslint-disable-next-line react/require-default-props
  backDisabled?: boolean;
  nextCaption: string;
  nextIcon: React.ReactNode;
  nextDisabled: boolean;
  onNext: () => void;
  onBack: () => void;
  // eslint-disable-next-line react/require-default-props
  sx?: SxProps<Theme>;
}

// eslint-disable-next-line react/function-component-definition
const StepperButtons: FunctionComponent<StepperButtonsProps> = ({
  backCaption,
  backIcon,
  backDisabled = false,
  onBack,
  nextCaption,
  nextIcon,
  nextDisabled = false,
  onNext,
  sx,
}: StepperButtonsProps) => {
  const handleBackClick = () => {
    onBack();
  };

  const handleNextClick = () => {
    onNext();
  };

  return (
    <Stack direction="row" justifyContent="center" sx={sx}>
      {backCaption && (
        <Button
          disabled={backDisabled}
          startIcon={backIcon}
          onClick={handleBackClick}
          variant="contained"
        >
          {backCaption}
        </Button>
      )}
      <Box sx={{ flexGrow: 1 }} />
      {nextCaption && (
        <Button
          disabled={nextDisabled}
          endIcon={nextIcon}
          onClick={handleNextClick}
          variant="contained"
          color="success"
        >
          {nextCaption}
        </Button>
      )}
    </Stack>
  );
};

export default StepperButtons;
