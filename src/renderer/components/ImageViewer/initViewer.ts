import { init as csToolsInit } from '@cornerstonejs/tools';
import { init as csRenderInit } from '@cornerstonejs/core';
import initVolumeLoader from './initVolumeLoader';
import initImageLoader from './initImageLoader';

export default async function initViewer() {
  initImageLoader();
  initVolumeLoader();

  await csRenderInit();
  csToolsInit();
}
