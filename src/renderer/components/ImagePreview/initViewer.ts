import { init as csToolsInit } from '@cornerstonejs/tools';
import { init as csRenderInit } from '@cornerstonejs/core';
import initProviders from './initProviders';
import initVolumeLoader from './initVolumeLoader';
import initImageLoader from './initImageLoader';

export default async function initViewer() {
  initProviders();
  initImageLoader();
  initVolumeLoader();

  await csRenderInit();
  csToolsInit();
}
