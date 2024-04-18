import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonGroup, IconButton, Tooltip } from '@mui/material';
import { GrLinkNext, GrLinkPrevious } from 'react-icons/gr';

export enum ButtonModes {
  PreviousPage = 'PreviousPage',
  NextPage = 'NextPage',
}

type PdfToolBarProps = {
  onChange: (value: ButtonModes, event: any) => void;
};

// eslint-disable-next-line react/function-component-definition
const PdfToolBar: FunctionComponent<PdfToolBarProps> = ({
  onChange,
}: PdfToolBarProps) => {
  const { t } = useTranslation();

  return (
    <ButtonGroup
      id="PdfToolBar"
      color="primary"
      variant="outlined"
      orientation="vertical"
      aria-label="button group"
    >
      <Tooltip title={t('previous_page')}>
        <IconButton
          onClick={(event) => onChange(ButtonModes.PreviousPage, event)}
        >
          <GrLinkPrevious />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('next_page')}>
        <IconButton onClick={(event) => onChange(ButtonModes.NextPage, event)}>
          <GrLinkNext />
        </IconButton>
      </Tooltip>
    </ButtonGroup>
  );
};

export default PdfToolBar;
