import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import logger from 'electron-log/renderer';
import {
  Enums,
  isCornerstoneInitialized,
  metaData,
  RenderingEngine,
  Types,
  volumeLoader,
} from '@cornerstonejs/core';
import * as cornerstone3D from '@cornerstonejs/core';
import { Box } from '@mui/material';
import { utilities } from '@cornerstonejs/tools';
import { nanoid } from '@reduxjs/toolkit';
import ToolsBar, { ButtonModes } from './ToolsBar';
import { IMAGE_LOADER_SCHEMA } from './initImageLoader';
import {
  DicomImageMeta,
  DicomSeriesMeta,
  DicomStudyMeta,
} from '../../../shared/shared-types';
import './ImageViewer.css';
import hardcodedMetaDataProvider from './hardcodedMetaDataProvider';
import initViewer from './initViewer';
import TextOverlay from './TextOverlay';

// ======== Constants ======= //
const RENDERING_ENGINE_ID = 'myRenderingEngine';
const VIEWPORT_ID = `myViewport-${nanoid()}`;
const VOLUME_ID = 'myVolume';

// Instances
let renderingEngine: RenderingEngine;
let viewport: Types.IStackViewport;

async function initCornerstone() {
  if (isCornerstoneInitialized()) {
    return;
  }

  cornerstone3D.setUseCPURendering(true);
  await cornerstone3D.init();
}

/**
 * @description Basic working example of cornerstone3D with React using a stripped down version of the webLoader example linked below. Their initDemo function seemed to be the key to getting this working.
 * @link https://github.com/cornerstonejs/cornerstone3D/blob/main/packages/core/examples/webLoader/index.ts
 * @link https://github.com/cornerstonejs/cornerstone3D/blob/main/utils/demo/helpers/initDemo.js
 *
 * @link https://github.com/cornerstonejs/cornerstone3D/blob/main/packages/tools/examples/webWorker/index.ts
 */
function initRenderingEngine(container: HTMLDivElement) {
  try {
    renderingEngine = new RenderingEngine(RENDERING_ENGINE_ID);
    renderingEngine.enableElement({
      viewportId: VIEWPORT_ID,
      type: Enums.ViewportType.STACK,
      element: container,
      defaultOptions: {
        background: [0.2, 0, 0.2],
      },
    });
    logger.info('RenderingEngine initialized.');
  } catch (error) {
    logger.error(error);
  }
}

async function initViewport(): Promise<void> {
  if (!renderingEngine) {
    logger.error('Rendering engine not yet initialized');
  }

  viewport = renderingEngine.getViewport(VIEWPORT_ID) as Types.IStackViewport;
  logger.info('Viewport initialized.');
}

async function init(container: HTMLDivElement): Promise<void> {
  return initViewer()
    .then(() => {
      logger.info('Initializing cornerstone...');
      return initCornerstone();
    })
    .then(() => {
      logger.info('Initializing rendering engine...');
      return initRenderingEngine(container);
    })
    .then(() => {
      logger.info('Initializing viewport...');
      return initViewport();
    })
    .then((a) => {
      logger.info('Viewer initialized.');
      return a;
    });
}

async function setStack(
  dicomImageMetas: DicomImageMeta[],
  dicomSerie: DicomSeriesMeta | undefined,
): Promise<DicomImageMeta[]> {
  if (dicomImageMetas.length === 0 || dicomSerie === undefined) {
    return [];
  }

  if (!renderingEngine) {
    logger.error('Engine not initialized. Unable to set stack with image ids');
    return [];
  }

  const i: DicomImageMeta[] =
    dicomImageMetas.slice().sort((a, b) => {
      return a.instanceNumber - b.instanceNumber;
    }) ?? [];

  const imageIds: string[] =
    i.slice().map((dicomFileInstance) => {
      return `${IMAGE_LOADER_SCHEMA}://?seriesInstanceUid=${dicomFileInstance.seriesInstanceUID}&modality=${dicomSerie?.modality}&file=${dicomFileInstance.dicomFileURL}&instanceNumber=${dicomFileInstance.instanceNumber}`;
    }) ?? [];

  metaData.removeAllProviders();
  metaData.addProvider(
    (type: string, imageId: string) =>
      hardcodedMetaDataProvider(type, imageId, imageIds),
    10000,
  );

  const index = Math.floor(imageIds.length / 2);

  logger.info(`Index: ${index},Stack=${imageIds}`);

  return volumeLoader
    .createAndCacheVolume(VOLUME_ID, {
      imageIds,
    })
    .then((volume) => {
      logger.debug(`Count of image ids to set: ${imageIds.length}`);
      volume.load();
      return viewport.setStack(imageIds);
    })
    .then(() => {
      // Reset index
      return viewport.setImageIdIndex(0);
    })
    .then(() => {
      // Set the VOI of the stack
      // TODO viewport.setProperties({ voiRange: ctVoiRange });

      utilities.stackContextPrefetch.enable(viewport.element);

      viewport.render();
      logger.info('Stack successfully set.');
      return i;
    });
}

type ImagePreviewProps = {
  bottomRight: string;
  center: string;
  dicomSerie: DicomSeriesMeta | undefined;
  study: DicomStudyMeta | undefined;
};

// eslint-disable-next-line react/function-component-definition
const ImageViewer: FunctionComponent<ImagePreviewProps> = ({
  bottomRight,
  center,
  dicomSerie,
  study,
}: ImagePreviewProps) => {
  const containerRef: React.MutableRefObject<HTMLDivElement | undefined> =
    useRef();
  // const [dicomImages, setDicomImages] = useState<DicomImageMeta[]>([]);
  const [images, setImages] = useState<DicomImageMeta[]>([]);
  const [image, setImage] = useState<DicomImageMeta | undefined>();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  function setImageIndex(index: number) {
    viewport
      .setImageIdIndex(index)
      .then((imageId: string) => {
        viewport.render();
        setImage(images[index]);
        setCurrentImageIndex(index);
        logger.info(`New current index: ${viewport.getCurrentImageIdIndex()}`);
        return imageId;
      })
      .catch((err) => {
        logger.error(err);
      });
  }

  useEffect(() => {
    function handleResize() {
      logger.log('resized to: ', window.innerWidth, 'x', window.innerHeight);

      renderingEngine.resize(true);
    }

    window.addEventListener('resize', handleResize);
  });

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      logger.error('Container element not yet created.');
      return;
    }

    container.oncontextmenu = (e) => e.preventDefault();

    init(container)
      .then(() => {
        return setStack(dicomSerie?.images ?? [], dicomSerie);
      })
      .then((i) => {
        setImages(i);
        setImage(i[0]);
        setCurrentImageIndex(0);
        return i;
      })
      .catch((err) => {
        logger.error(err);
      });
  }, [dicomSerie]);

  const handleToolButtonClick = (mode: ButtonModes) => {
    logger.info(mode);

    const { invert } = viewport.getProperties();

    switch (mode) {
      case ButtonModes.PreviousImage:
        setImageIndex(viewport.getCurrentImageIdIndex() - 1);
        break;
      case ButtonModes.NextImage:
        setImageIndex(viewport.getCurrentImageIdIndex() + 1);
        break;
      case ButtonModes.FlipHorizontal:
        viewport.setCamera({
          flipHorizontal: !viewport.getCamera().flipHorizontal,
        });
        break;
      case ButtonModes.FlipVertical:
        viewport.setCamera({
          flipVertical: !viewport.getCamera().flipVertical,
        });
        break;
      case ButtonModes.ZoomImage:
        break;
      case ButtonModes.ScrollImages:
        break;
      case ButtonModes.Invert:
        viewport.setProperties({ invert: !invert });
        break;
      case ButtonModes.Reset:
        // Resets the viewport's camera
        viewport.resetCamera();
        // Resets the viewport's properties
        viewport.resetToDefaultProperties();
        break;
      case ButtonModes.RotateLeft:
        viewport.setProperties({ rotation: viewport.getRotation() - 90 });
        break;
      case ButtonModes.RotateRight:
        viewport.setProperties({ rotation: viewport.getRotation() + 90 });
        break;
      default:
        break;
    }

    viewport.render();
  };

  return (
    // eslint-disable-next-line max-len
    <Box sx={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              height: '512px',
              width: '512px',
            }}
            ref={containerRef}
            id="cornerstone-element"
          />
        </Box>
        <TextOverlay
          bottomRight={bottomRight}
          center={center}
          image={image}
          dicomSerie={dicomSerie}
          study={study}
        />
      </Box>
      <ToolsBar
        previousDisabled={currentImageIndex === 0}
        nextDisabled={images.length <= currentImageIndex + 1}
        onChange={handleToolButtonClick}
      />
    </Box>
  );
};

export default ImageViewer;
