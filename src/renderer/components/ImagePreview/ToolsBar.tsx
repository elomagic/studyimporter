import React, { FunctionComponent } from 'react';
import {
  Box,
  ButtonGroup,
  Divider,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import { FaImages, FaSearch } from 'react-icons/fa';
import { TbFlipHorizontal, TbFlipVertical } from 'react-icons/tb';
import { IoInvertMode } from 'react-icons/io5';
import {
  MdOutlineRotate90DegreesCcw,
  MdOutlineRotate90DegreesCw,
} from 'react-icons/md';
import { RxReset } from 'react-icons/rx';
import { useTranslation } from 'react-i18next';

export enum ButtonModes {
  FlipHorizontal = 'FlipHorizontal',
  FlipVertical = 'FlipVertical',
  Invert = 'Invert',
  Reset = 'Reset',
  RotateLeft = 'RotateLeft',
  RotateRight = 'RotateRight',
  ScrollImages = 'ScrollImages',
  ZoomImage = 'ZoomImages',
}

type ToolsBarProps = {
  onChange: (value: ButtonModes, event: any) => void;
};

// eslint-disable-next-line react/function-component-definition
const ToolsBar: FunctionComponent<ToolsBarProps> = ({
  onChange,
}: ToolsBarProps) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <ToggleButtonGroup
        orientation="vertical"
        defaultValue={ButtonModes.ScrollImages}
        onChange={(event, value) => onChange(value, event)}
      >
        <ToggleButton value={ButtonModes.ScrollImages}>
          <FaImages />
        </ToggleButton>
        <ToggleButton value={ButtonModes.ZoomImage}>
          <FaSearch />
        </ToggleButton>
      </ToggleButtonGroup>
      <Divider flexItem orientation="horizontal" sx={{ mx: 0.5, my: 1 }} />
      <ButtonGroup
        color="primary"
        variant="outlined"
        orientation="vertical"
        aria-label="button group"
      >
        <IconButton
          onClick={(event) => onChange(ButtonModes.FlipHorizontal, event)}
        >
          <TbFlipHorizontal />
        </IconButton>
        <IconButton
          onClick={(event) => onChange(ButtonModes.FlipVertical, event)}
        >
          <TbFlipVertical />
        </IconButton>
        <Tooltip title={t('invert_view')}>
          <IconButton onClick={(event) => onChange(ButtonModes.Invert, event)}>
            <IoInvertMode />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('rotate_right')}>
          <IconButton
            onClick={(event) => onChange(ButtonModes.RotateRight, event)}
          >
            <MdOutlineRotate90DegreesCw />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('rotate_left')}>
          <IconButton
            onClick={(event) => onChange(ButtonModes.RotateLeft, event)}
          >
            <MdOutlineRotate90DegreesCcw />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('reset_view')}>
          <IconButton onClick={(event) => onChange(ButtonModes.Reset, event)}>
            <RxReset />
          </IconButton>
        </Tooltip>
      </ButtonGroup>
    </Box>
  );
};

export default ToolsBar;
