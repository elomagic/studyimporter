import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import logger from 'electron-log/renderer';
import * as cornerstone3D from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
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
const RENDERING_ENGINE_ID = `myRenderingEngine`;
const VIEWPORT_ID = `myViewport-${nanoid()}`;
const VOLUME_ID = 'myVolume';
const TOOL_GROUP_ID = 'myToolGroupId';

const {
  PanTool,
  WindowLevelTool,
  StackScrollMouseWheelTool,
  ZoomTool,
  ToolGroupManager,
  Enums: csToolsEnums,
} = cornerstoneTools;
const { IMAGE_RENDERED } = cornerstone3D.Enums.Events;

const { MouseBindings } = csToolsEnums;

// Instances
let renderingEngine: cornerstone3D.RenderingEngine;
let viewport: cornerstone3D.Types.IStackViewport;
let toolGroup: cornerstoneTools.Types.IToolGroup;

async function initCornerstone() {
  if (cornerstone3D.isCornerstoneInitialized()) {
    logger.info('Cornerstone already initialize...');
    return;
  }

  logger.info('Initializing cornerstone...');

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
  logger.info('Initializing rendering engine...');
  try {
    renderingEngine = new cornerstone3D.RenderingEngine(RENDERING_ENGINE_ID);
    renderingEngine.enableElement({
      viewportId: VIEWPORT_ID,
      type: cornerstone3D.Enums.ViewportType.STACK,
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
  logger.info('Initializing viewport...');
  if (!renderingEngine) {
    logger.error(
      'Rendering engine not yet initialized. Skipping init viewport',
    );
  }

  viewport = renderingEngine.getViewport(
    VIEWPORT_ID,
  ) as cornerstone3D.Types.IStackViewport;

  // Set the tool group on the viewport
  toolGroup.addViewport(VIEWPORT_ID, RENDERING_ENGINE_ID);

  logger.info('Viewport initialized.');
}

async function initCornerstoneTools(): Promise<void> {
  logger.info('Initializing cornerstone tools...');

  const tempToolGroup = ToolGroupManager.createToolGroup(TOOL_GROUP_ID);
  if (tempToolGroup === undefined) {
    logger.info('Cornerstone tools already initialized...');
    return;
  }

  toolGroup = tempToolGroup;

  // Add tools to Cornerstone3D
  cornerstoneTools.addTool(WindowLevelTool);
  cornerstoneTools.addTool(PanTool);
  cornerstoneTools.addTool(ZoomTool);
  cornerstoneTools.addTool(StackScrollMouseWheelTool);

  // Add tools to the tool group
  toolGroup.addTool(WindowLevelTool.toolName);
  toolGroup.addTool(PanTool.toolName);
  toolGroup.addTool(ZoomTool.toolName);
  toolGroup.addTool(StackScrollMouseWheelTool.toolName, { loop: false });

  // Set the initial state of the tools, here all tools are active and bound to
  // Different mouse inputs
  toolGroup.setToolActive(WindowLevelTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Primary, // Left Click
      },
    ],
  });
  toolGroup.setToolActive(PanTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Auxiliary, // Middle Click
      },
    ],
  });
  toolGroup.setToolActive(ZoomTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Secondary, // Right Click
      },
    ],
  });
  // As the Stack Scroll mouse wheel is a tool using the `mouseWheelCallback`
  // hook instead of mouse buttons, it does not need to assign any mouse button.
  toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);

  logger.info('Cornerstone tools initialized.');
}

async function init(container: HTMLDivElement): Promise<void> {
  return initViewer()
    .then(() => {
      return initCornerstone();
    })
    .then(() => {
      return initCornerstoneTools();
    })
    .then(() => {
      return initRenderingEngine(container);
    })
    .then(() => {
      return initViewport();
    })
    .then((a) => {
      logger.info('ImageViewer initialized.');
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

  cornerstone3D.metaData.removeAllProviders();
  cornerstone3D.metaData.addProvider(
    (type: string, imageId: string) =>
      hardcodedMetaDataProvider(type, imageId, imageIds),
    10000,
  );

  const index = Math.floor(imageIds.length / 2);

  logger.info(`Index: ${index},Stack=${imageIds}`);

  return cornerstone3D.volumeLoader
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
  const [currentImageMeta, setCurrentImageMeta] = useState<
    DicomImageMeta | undefined
  >();

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
    container.addEventListener(IMAGE_RENDERED, () => {
      const index = dicomSerie?.images.findIndex((meta) => {
        return meta.instanceNumber === viewport.getCurrentImageIdIndex();
      });
      setCurrentImageMeta(
        index === undefined ? undefined : dicomSerie?.images[index],
      );
    });

    init(container)
      .then(() => {
        return setStack(dicomSerie?.images ?? [], dicomSerie);
      })
      .catch((err) => {
        logger.error(err);
      });
  }, [dicomSerie]);

  const handleToolButtonClick = (mode: ButtonModes) => {
    logger.info(mode);

    const { invert } = viewport.getProperties();

    switch (mode) {
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
          image={currentImageMeta}
          dicomSerie={dicomSerie}
          study={study}
        />
      </Box>
      <ToolsBar onChange={handleToolButtonClick} />
    </Box>
  );
};

export default ImageViewer;
