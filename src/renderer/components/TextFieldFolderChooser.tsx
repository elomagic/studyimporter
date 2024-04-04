import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Theme,
} from '@mui/material';
import logger from 'electron-log/renderer';
import { MdMoreHoriz } from 'react-icons/md';
import { SxProps } from '@mui/system';

interface DirectoryTextFieldProps {
  // eslint-disable-next-line react/require-default-props
  value?: string | undefined;
  label: string;
  placeholder: string;
  // eslint-disable-next-line react/require-default-props
  inputRef?: React.RefObject<HTMLInputElement>;
  // eslint-disable-next-line react/require-default-props
  sx?: SxProps<Theme>;
  // eslint-disable-next-line react/require-default-props
  onChange?: (folder: string) => void;
}

// eslint-disable-next-line react/function-component-definition
const TextFieldFolderChooser: FunctionComponent<DirectoryTextFieldProps> = ({
  value,
  label,
  placeholder,
  inputRef,
  sx,
  onChange,
}: DirectoryTextFieldProps) => {
  const [folder, setFolder] = useState<string | undefined>(undefined);

  useEffect(() => {
    setFolder(value);
  }, [value]);

  const handleSelectFolderClick = () => {
    window.electron.ipcRenderer
      .openFolder(folder)
      // eslint-disable-next-line no-undef
      .then((result: Electron.OpenDialogReturnValue) => {
        let dir = folder;
        if (result.filePaths !== undefined && !result.canceled) {
          [dir] = result.filePaths;

          setFolder(dir);

          if (onChange) {
            onChange(dir);
          }
        }

        return dir;
      })
      .catch((ex) => {
        logger.error(ex);
      });
  };

  return (
    <FormControl sx={sx} variant="outlined">
      <InputLabel htmlFor="outlined-folder-chooser" size="small">
        {label}
      </InputLabel>
      <OutlinedInput
        sx={sx}
        id="outlined-folder-chooser"
        inputRef={inputRef}
        type="text"
        size="small"
        value={folder}
        defaultValue={folder}
        placeholder={placeholder}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={handleSelectFolderClick}
              edge="end"
              size="small"
            >
              <MdMoreHoriz />
            </IconButton>
          </InputAdornment>
        }
        label={label}
      />
    </FormControl>
  );
};

export default TextFieldFolderChooser;
