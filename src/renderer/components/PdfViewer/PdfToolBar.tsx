import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonGroup, IconButton, Tooltip } from '@mui/material';
import {
  FaRegArrowAltCircleLeft,
  FaRegArrowAltCircleRight,
} from 'react-icons/fa';

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
          <FaRegArrowAltCircleLeft />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('next_page')}>
        <IconButton onClick={(event) => onChange(ButtonModes.NextPage, event)}>
          <FaRegArrowAltCircleRight />
        </IconButton>
      </Tooltip>
    </ButtonGroup>
  );
};

export default PdfToolBar;
