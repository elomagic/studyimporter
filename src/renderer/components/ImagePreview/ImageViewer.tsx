import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import logger from 'electron-log/renderer';
import {
  Enums,
  getRenderingEngine,
  RenderingEngine,
  imageLoader,
  metaData,
  volumeLoader,
} from '@cornerstonejs/core';
import { Box } from '@mui/material';
import {
  IRenderingEngine,
  IStackViewport,
} from '@cornerstonejs/core/dist/types/types';
import { useTranslation } from 'react-i18next';
import ToolsBar, { ButtonModes } from './ToolsBar';
import { IMAGE_LOADER_SCHEMA } from './initImageLoader';
import {
  DicomImageMeta,
  DicomSeriesMeta,
  DicomStudyMeta,
} from '../../../shared/shared-types';
import './ImageViewer.css';
import {
  formatDicomDateString,
  formatDicomTimeString,
} from '../../string-formatter';
import { Settings } from '../../../shared/configuration-properties';
import registerWebImageLoader from './registerWebImageLoader';
import hardcodedMetaDataProvider from './hardcodedMetaDataProvider';
import initViewer from './initViewer';

// ======== Constants ======= //
const renderingEngineId = 'myRenderingEngine';
const viewportId = 'CT_STACK';
const volumeId = 'myVolume';
// const imageIds = ['web:https://picsum.photos/500'];

registerWebImageLoader(imageLoader);

/**
 * @description Basic working example of cornerstone3D with React using a stripped down version of the webLoader example linked below. Their initDemo function seemed to be the key to getting this working.
 * @link https://github.com/cornerstonejs/cornerstone3D/blob/main/packages/core/examples/webLoader/index.ts
 * @link https://github.com/cornerstonejs/cornerstone3D/blob/main/utils/demo/helpers/initDemo.js
 */
async function run(container: HTMLDivElement) {
  try {
    await initViewer();

    const renderingEngine = new RenderingEngine(renderingEngineId);

    renderingEngine.setViewports([
      {
        element: container,
        type: Enums.ViewportType.STACK,
        viewportId,
      },
    ]);
  } catch (error) {
    logger.error(error);
  }
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
  const { t } = useTranslation();
  // const [dicomImages, setDicomImages] = useState<DicomImageMeta[]>([]);
  const [locale, setLocale] = useState<string>();
  const [image, setImage] = useState<DicomImageMeta | undefined>();

  const getViewport: () => IStackViewport | undefined = () => {
    const engine = getRenderingEngine(renderingEngineId);
    if (engine === undefined) {
      logger.error('Rendering engine not initialized');
      return undefined;
    }

    const vp = engine.getViewport(viewportId) as IStackViewport;
    if (vp === undefined) {
      logger.error('Viewport not yet initialized');
    }

    return vp;
  };

  function setImageIndex(index: number) {
    const viewport = getViewport();
    if (viewport === undefined) {
      logger.error('Viewport not yet initialized');
      return;
    }

    viewport
      .setImageIdIndex(index)
      .then(() => {
        viewport.render();
        setImage(dicomSerie?.images[index]);
        logger.info(`New current index: ${viewport.getCurrentImageIdIndex()}`);
        return index;
      })
      .catch((err) => {
        logger.error(err);
      });
  }

  useEffect(() => {
    function handleResize() {
      logger.log('resized to: ', window.innerWidth, 'x', window.innerHeight);

      getRenderingEngine(renderingEngineId)?.resize(true);
    }

    window.addEventListener('resize', handleResize);
  });

  useEffect(() => {
    logger.info('First and only useEffect call');

    window.electron.ipcRenderer
      .getSettings()
      .then((settings: Settings) => {
        setLocale(settings.ui.language);
        return settings;
      })
      .catch((ex) => {
        logger.error(ex);
      });

    const container = containerRef.current;

    if (!container) return;

    run(container)
      .then((a) => {
        logger.info('Element container initialized.');
        return a;
      })
      .catch((err) => {
        logger.error(err);
      });
  }, []);

  async function setStack(imageIds: string[]) {
    const renderingEngine: IRenderingEngine | undefined =
      getRenderingEngine(renderingEngineId);

    if (!renderingEngine) {
      logger.error('Engine not initialized');
      return;
    }

    const index = Math.floor(imageIds.length / 2);

    logger.info(`Index: ${index},Stack=${imageIds}`);

    const viewport = renderingEngine.getStackViewports()[0];

    const volume = await volumeLoader.createAndCacheVolume(volumeId, {
      imageIds,
    });

    volume.load();

    await viewport.setStack(imageIds);

    await viewport.setImageIdIndex(0);

    renderingEngine.render();
  }

  useEffect(() => {
    const viewport = getViewport();
    if (viewport === undefined) {
      return;
    }

    const imageIds = dicomSerie?.images
      .slice()
      .sort((a, b) => {
        return a.instanceNumber - b.instanceNumber;
      })
      .map((dicomFileInstance) => {
        return `${IMAGE_LOADER_SCHEMA}://${dicomFileInstance.seriesInstanceUID},${dicomFileInstance.dicomFileURL}`;
      });

    metaData.removeAllProviders();

    if (imageIds !== undefined && imageIds.length !== 0) {
      metaData.addProvider(
        (type: string, imageId: string) =>
          hardcodedMetaDataProvider(type, imageId, imageIds),
        10000,
      );

      setStack(imageIds)
        .then((a) => {
          logger.info('Stack successfully set.');
          return a;
        })
        .catch((err) => {
          logger.error(err);
        });
    }
  }, [dicomSerie]);

  const handleToolButtonClick = (mode: ButtonModes) => {
    logger.info(mode);

    const viewport = getViewport();
    if (viewport === undefined) {
      logger.info('Viewport not yet initialized');
      return;
    }

    const { invert } = viewport.getProperties();

    switch (mode) {
      case ButtonModes.FlipHorizontal:
        viewport.setCamera({ flipHorizontal: !viewport.getCamera() });
        break;
      case ButtonModes.FlipVertical:
        viewport.setCamera({ flipVertical: !viewport.getCamera() });
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
        viewport.resetProperties();
        break;
      case ButtonModes.RotateLeft:
        // viewport.setProperties({ rotation: viewport.getRotation() - 90 });
        setImageIndex(viewport.getCurrentImageIdIndex() - 1);
        break;
      case ButtonModes.RotateRight:
        // viewport.setProperties({ rotation: viewport.getRotation() + 90 });
        setImageIndex(viewport.getCurrentImageIdIndex() + 1);
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
              height: '500px',
              width: '500px',
            }}
            ref={containerRef}
            id="cornerstone-element"
          />
        </Box>
        <Box className="ImageViewer-top-left">
          <div>
            #{dicomSerie?.patient?.patientID}{' '}
            {dicomSerie?.patient?.patientDisplayName}
          </div>
          <div>
            *
            {formatDicomDateString(
              dicomSerie?.patient?.patientDayOfBirth,
              locale,
            )}{' '}
            {dicomSerie?.patient?.patientGender}
          </div>
          <div>
            {image?.instanceNumber}/{dicomSerie?.images.length}
          </div>
        </Box>
        <Box className="ImageViewer-top-right">
          <div>{dicomSerie?.institutionName}</div>
          <div>
            {image?.manufacturer} {image?.manufacturerModelName}
          </div>
          <div>{study?.studyDescription}</div>
          <div>
            {formatDicomDateString(study?.performedDate, locale)}{' '}
            {formatDicomTimeString(study?.performedTime, t('time_format'))}
          </div>
        </Box>
        <Box className="ImageViewer-bottom-left">
          <div>{dicomSerie?.seriesDescription}</div>
          <div>{dicomSerie?.modality}</div>
        </Box>
        <Box className="ImageViewer-bottom-right">{bottomRight}</Box>
        <Box className="ImageViewer-center">{center}</Box>
      </Box>
      <ToolsBar onChange={handleToolButtonClick} />
    </Box>
  );
};

export default ImageViewer;
