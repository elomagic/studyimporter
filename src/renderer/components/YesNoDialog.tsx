import React, { FunctionComponent } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';

interface YesNoDialogProps {
  title: string;
  text: string;
  captionYes: string;
  captionNo: string;
  open: boolean;
  onYesClick: () => void;
  onNoClick: () => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const YesNoDialog: FunctionComponent<YesNoDialogProps> = ({
  title,
  text,
  captionYes,
  captionNo,
  open,
  onYesClick,
  onNoClick,
}: YesNoDialogProps) => {
  return (
    <Dialog open={open} TransitionComponent={Transition} onClose={onNoClick}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onNoClick}> {captionNo}</Button>
        <Button onClick={onYesClick}>{captionYes}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default YesNoDialog;
