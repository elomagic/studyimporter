import React, { FunctionComponent, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import log from 'electron-log/renderer';
import { DicomImageMeta } from '../../../shared/shared-types';
import './ImagePreview.css';
import icon from '../../../../assets/pdf.svg';

interface ImagePreviewProps {
  image: DicomImageMeta | undefined;
  onClick: (image: DicomImageMeta) => void;
}

// eslint-disable-next-line react/function-component-definition
const ImagePreview: FunctionComponent<ImagePreviewProps> = ({
  image,
  onClick,
}: ImagePreviewProps) => {
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (image === undefined) {
      setImageUri(undefined);
    } else if (image.directoryRecordType === 'ENCAP DOC') {
      setImageUri(icon);
    } else {
      window.electron.ipcRenderer
        .getDicomImage(image.seriesInstanceUID, image.dicomFileURL)
        .then((arrayBuffer) => {
          const arrayBufferView = new Uint8Array(arrayBuffer);
          const blob = new Blob([arrayBufferView]);
          const urlCreator = window.URL || window.webkitURL;
          const url = urlCreator.createObjectURL(blob);

          setImageUri(url);

          return url;
        })
        .catch((ex) => {
          log.error(ex);
        });
    }
  }, [image]);

  const handleOnImageClick = () => {
    if (image !== undefined) {
      onClick(image);
    }
  };

  return (
    <Box className="ImagePreview-Container">
      <Box
        component="img"
        src={imageUri}
        alt="Serie Preview"
        role="button"
        loading="lazy"
        sx={{
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        onClick={handleOnImageClick}
      />
    </Box>
  );
};

export default ImagePreview;
