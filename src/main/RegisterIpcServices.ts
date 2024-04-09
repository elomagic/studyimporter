import { app, dialog, ipcMain, BrowserWindow } from 'electron';
import logger from 'electron-log/main';
import {
  CEchoRequest,
  CEchoResponse,
  CFindRequest,
  CFindResponse,
  CStoreRequest,
  CStoreResponse,
  DcmtkValidationResult,
  DicomFile,
  DicomStudyMeta,
  ReadDicomDirAsXmlResponse,
  ReadDicomFileAsXmlResponse,
  TestFhirConnectionResponse,
} from '../shared/shared-types';
// Exchange following line when you want to integrate another DICOM toolkit.
import {
  collectDicomFiles,
  existsDicomDirFile,
  getImagePromise,
  getPdfPromise,
  readDicomDirAsXml,
  readDicomFileAsXml,
  sendCEcho,
  sendCFind,
  storeImagePromise,
  validateDicomTools,
} from './dicom-tk';
import IpcChannels from '../shared/IpcChannels';
import {
  FhirConnectionOptions,
  Settings,
} from '../shared/configuration-properties';
import {
  announcementFhirStudy,
  applySettings,
  fetchFhirPatients,
  readSettings,
  testFhirConnection,
} from './common-services';
// eslint-disable-next-line no-undef
import OpenDialogReturnValue = Electron.Main.OpenDialogReturnValue;

// eslint-disable-next-line import/prefer-default-export
export const registerMainHandlers = () => {
  ipcMain.handle(
    IpcChannels.OpenFolder,
    (_event, defaultFolder: string): Promise<OpenDialogReturnValue> => {
      return dialog.showOpenDialog({
        title: 'Select a folder',
        defaultPath: defaultFolder,
        properties: ['openDirectory'],
      });
    },
  );

  ipcMain.on('minimize-window', () => {
    BrowserWindow.getFocusedWindow()?.minimize();
  });

  ipcMain.on('maximize-window', () => {
    if (BrowserWindow.getFocusedWindow()?.isFullScreenable()) {
      if (BrowserWindow.getFocusedWindow()?.isFullScreen()) {
        BrowserWindow.getFocusedWindow()?.setFullScreen(false);
      } else {
        BrowserWindow.getFocusedWindow()?.setFullScreen(true);
      }
    } else if (BrowserWindow.getFocusedWindow()?.isMaximized()) {
      BrowserWindow.getFocusedWindow()?.unmaximize();
    } else {
      BrowserWindow.getFocusedWindow()?.maximize();
    }
  });

  ipcMain.on(IpcChannels.CloseApplication, () => {
    app.quit();
  });

  ipcMain.handle(IpcChannels.GetSettings, (): Promise<Settings> => {
    logger.debug('Handle GetSettings');
    return readSettings();
  });

  ipcMain.handle(
    IpcChannels.ApplySettings,
    (_event, settings: Settings): Promise<Settings> => {
      logger.debug('[ipcMain] Handle ApplySettings');
      return applySettings(settings);
    },
  );

  ipcMain.handle(
    IpcChannels.AppGetPath,
    (
      _event,
      name:
        | 'home'
        | 'appData'
        | 'userData'
        | 'temp'
        | 'exe'
        | 'module'
        | 'desktop'
        | 'documents'
        | 'downloads'
        | 'music'
        | 'pictures'
        | 'videos'
        | 'recent'
        | 'logs'
        | 'crashDumps'
        | 'sessionData',
    ): Promise<string> => {
      return Promise.resolve(app.getPath(name));
    },
  );

  ipcMain.handle(
    IpcChannels.FetchFhirPatients,
    (_event, query: string, fhir: FhirConnectionOptions): Promise<any> => {
      logger.info('Fetch FHIR patient', query);
      return fetchFhirPatients(query, fhir);
    },
  );

  ipcMain.handle(
    IpcChannels.AnnouncementFhirStudy,
    (
      _event,
      study: DicomStudyMeta,
      fhir: FhirConnectionOptions,
    ): Promise<any> => {
      logger.info('Announce FHIR study', study);
      return announcementFhirStudy(study, fhir);
    },
  );

  ipcMain.handle(
    IpcChannels.TestFhirConnection,
    (
      _event,
      fhir: FhirConnectionOptions,
    ): Promise<TestFhirConnectionResponse> => {
      logger.info('Test FHIR connection');
      return testFhirConnection(fhir);
    },
  );

  ipcMain.handle(
    IpcChannels.SendDicomCEcho,
    (_event, request: CEchoRequest): Promise<CEchoResponse> => {
      logger.info('C-ECHO request received', request);
      return sendCEcho(request);
    },
  );

  ipcMain.handle(
    IpcChannels.SendDicomCFind,
    (_event, request: CFindRequest): Promise<CFindResponse> => {
      logger.info('C-FIND request received', request);
      return sendCFind(request);
    },
  );

  ipcMain.handle(
    IpcChannels.CheckDicomTools,
    (): Promise<DcmtkValidationResult> => {
      return validateDicomTools();
    },
  );

  ipcMain.handle(
    IpcChannels.GetDicomDocument,
    (_event, seriesInstanceUID: string, filePath: string): Promise<Buffer> => {
      logger.info('Handle "get-document". File: ', filePath);

      return getPdfPromise(seriesInstanceUID, filePath);
    },
  );

  ipcMain.handle(
    IpcChannels.GetDicomImage,
    (
      _event,
      seriesInstanceUID: string,
      dicomFileUri: string,
    ): Promise<Buffer> => {
      logger.info('Handle "get-image". File: ', dicomFileUri);

      return getImagePromise(seriesInstanceUID, dicomFileUri);
    },
  );

  ipcMain.handle(
    IpcChannels.StoreDicomImage,
    (_event, request: CStoreRequest): Promise<CStoreResponse> => {
      logger.info('Handle "store-dicom-image". File: ', request.dicomFileURL);

      return storeImagePromise(request);
    },
  );

  ipcMain.handle(
    IpcChannels.ExistsDicomDirFile,
    (_event, folder: string | undefined): Promise<boolean> => {
      logger.info('Handle ', IpcChannels.ExistsDicomDirFile, folder);
      return existsDicomDirFile(folder);
    },
  );

  ipcMain.handle(
    IpcChannels.RequestDicomDirAsXml,
    (event, folder: string): Promise<ReadDicomDirAsXmlResponse> => {
      logger.info('Handle "%s"', IpcChannels.RequestDicomDirAsXml, folder);
      return readDicomDirAsXml(folder);
    },
  );

  ipcMain.handle(
    IpcChannels.CollectDicomFiles,
    (event, folder: string | undefined): Promise<DicomFile[]> => {
      logger.info('Handle "%s"', IpcChannels.CollectDicomFiles, folder);
      return collectDicomFiles(folder);
    },
  );

  ipcMain.handle(
    IpcChannels.RequestDicomFileAsXml,
    (event, file: DicomFile): Promise<ReadDicomFileAsXmlResponse> => {
      logger.info('Handle "%s"', IpcChannels.RequestDicomFileAsXml, file);
      return readDicomFileAsXml(file);
    },
  );
};
