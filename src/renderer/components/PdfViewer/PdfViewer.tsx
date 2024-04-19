import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import 'pdfjs-dist/build/pdf.worker.min.js';
import logger from 'electron-log';
import { Box, Stack } from '@mui/material';
import { DicomImageMeta } from '../../../shared/shared-types';
import './PdfViewer.css';
import { useResizeObserver } from '@wojtekmaj/react-hooks';

const maxWidth = 800;

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
};

interface PdfViewerProps {
  image: DicomImageMeta | undefined;
}

const resizeObserverOptions = {};

pdfjs.GlobalWorkerOptions.workerSrc =
  'node_modules/pdfjs-dist/build/pdf.worker.min.js';

// eslint-disable-next-line react/function-component-definition
const PdfViewer: FunctionComponent<PdfViewerProps> = ({
  image,
}: PdfViewerProps) => {
  const [pagesCount, setPagesCount] = useState<number>(0);
  // Current page index starts from 1
  const [data, setData] = useState<{ data: Uint8Array } | undefined>(undefined);

  const containerRef = useRef<Element>();
  const [containerWidth, setContainerWidth] = useState<number>();

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef?.current === undefined ? null : containerRef.current, resizeObserverOptions, onResize);

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
  };

  return (
    <Stack id="PdfViewer" direction="row" flexGrow={1}>
      <Stack flexGrow={1} direction="column">
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }} ref={containerRef}>
          <Document
            className="PdfDocument"
            file={data}
            onLoadSuccess={handleDocumentLoadSuccess}
            options={options}
          >
            {Array.from(new Array(pagesCount), (el, index) => (
              <Page
                className="PdfPage"
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth}
              />
            ))}
          </Document>
        </Box>
      </Stack>
      {/* <PdfToolBar onChange={handleToolbarClick} /> */}
    </Stack>
  );
};

export default PdfViewer;
