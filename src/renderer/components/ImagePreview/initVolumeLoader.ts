import { volumeLoader } from '@cornerstonejs/core';
import {
  cornerstoneStreamingImageVolumeLoader,
  cornerstoneStreamingDynamicImageVolumeLoader,
} from '@cornerstonejs/streaming-image-volume-loader';

export default function initVolumeLoader() {
  volumeLoader.registerUnknownVolumeLoader(
    // @ts-ignore
    cornerstoneStreamingImageVolumeLoader,
  );
  volumeLoader.registerVolumeLoader(
    'cornerstoneStreamingImageVolume',
    // @ts-ignore
    cornerstoneStreamingImageVolumeLoader,
  );
  volumeLoader.registerVolumeLoader(
    'cornerstoneStreamingDynamicImageVolume',
    // @ts-ignore
    cornerstoneStreamingDynamicImageVolumeLoader,
  );
}
