import React, { FunctionComponent, useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import 'pdfjs-dist/build/pdf.worker.min.js';
import logger from 'electron-log';
import { Box } from '@mui/material';
import { DicomImageMeta } from '../../../shared/shared-types';

interface PdfViewerProps {
  image: DicomImageMeta | undefined;
}

pdfjs.GlobalWorkerOptions.workerSrc =
  'node_modules/pdfjs-dist/build/pdf.worker.min.js';

// eslint-disable-next-line react/function-component-definition
const PdfViewer: FunctionComponent<PdfViewerProps> = ({
  image,
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
    <Box id="PdfViewer" sx={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <Document
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
