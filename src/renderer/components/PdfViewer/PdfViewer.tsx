import React, { FunctionComponent, useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import 'pdfjs-dist/build/pdf.worker.min.js';
import logger from 'electron-log';
import { Box, Stack } from '@mui/material';
import { DicomImageMeta } from '../../../shared/shared-types';
import PdfToolBar, { ButtonModes } from './PdfToolBar';

interface PdfViewerProps {
  image: DicomImageMeta | undefined;
}

pdfjs.GlobalWorkerOptions.workerSrc =
  'node_modules/pdfjs-dist/build/pdf.worker.min.js';

// eslint-disable-next-line react/function-component-definition
const PdfViewer: FunctionComponent<PdfViewerProps> = ({
  image,
}: PdfViewerProps) => {
  const [pagesCount, setPagesCount] = useState<number>(0);
  // Current page index starts from 1
  const [currentPage, setCurrentPage] = useState<number>(1);
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
    setPagesCount(numPages);
    setCurrentPage(1);
  };

  const handleToolbarClick = (value: ButtonModes) => {
    if (value === ButtonModes.PreviousPage && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (value === ButtonModes.NextPage && currentPage < pagesCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Stack id="PdfViewer" direction="row" flexGrow={1}>
      <Box flexGrow={1}>
        <Box overflow="auto">
          <Document
            className="PdfDocument"
            file={data}
            onLoadSuccess={handleDocumentLoadSuccess}
            options={options}
          >
            <Page className="PdfPage" pageNumber={currentPage} />
          </Document>
        </Box>
      </Box>
      <PdfToolBar onChange={handleToolbarClick} />
    </Stack>
  );
};

export default PdfViewer;
