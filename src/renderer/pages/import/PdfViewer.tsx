import React, { FunctionComponent, useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import logger from 'electron-log';
import { SxProps } from '@mui/system/styleFunctionSx';
import { Box, Theme } from '@mui/material';
import { DicomImageMeta } from '../../../shared/shared-types';

// TODO Should be replaced by https://github.com/mozilla/pdf.js

interface PdfViewerProps {
  image: DicomImageMeta | undefined;
  // eslint-disable-next-line react/require-default-props
  sx?: SxProps<Theme>;
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  // @ts-ignore
  import.meta.url,
).toString();

// eslint-disable-next-line react/function-component-definition
const PdfViewer: FunctionComponent<PdfViewerProps> = ({
  image,
  sx,
}: PdfViewerProps) => {
  // const [numPages, setNumPages] = useState<number | undefined>(undefined);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [data, setData] = useState<{ data: Uint8Array } | undefined>(undefined);

  const options = {
    cMapUrl: 'cmaps/',
    cMapPacked: true,
  };

  useEffect(() => {
    if (image === undefined) {
      return;
    }

    logger.log('Loading PDF document.', image.dicomFileURL);

    window.electron.ipcRenderer
      .getDicomDocument(image.seriesInstanceUID, image.dicomFileURL)
      .then((d: Buffer) => {
        setData({
          data: d.valueOf(),
        });
        return d;
      })
      .catch((e: Error) => {
        logger.error(e.message);
      });
  }, [image]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    logger.log('PDF document successful loaded. Num pages', numPages);
    // setNumPages(pdf.numPages);
    setPageNumber(1);
  };

  return (
    <Box className="PdfViewer" sx={sx}>
      <Document
        className="overflow-auto position-absolute h-100 w-100"
        file={data}
        onLoadSuccess={handleDocumentLoadSuccess}
        options={options}
      >
        <Page pageNumber={pageNumber} />
      </Document>
    </Box>
  );
};

export default PdfViewer;
