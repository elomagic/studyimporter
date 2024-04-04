// Disable no-unused-vars, broken for spread args
import { contextBridge, ipcRenderer } from 'electron';
import {
  FhirConnectionOptions,
  Settings,
} from '../shared/configuration-properties';
import { IpcChannels } from '../shared/ipc-channels';
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
// eslint-disable-next-line no-undef
import OpenDialogReturnValue = Electron.OpenDialogReturnValue;

const electronHandler = {
  ipcRenderer: {
    closeApplication(): void {
      ipcRenderer.send(IpcChannels.CloseApplication);
    },
    getSettings(): Promise<Settings> {
      return ipcRenderer.invoke(IpcChannels.GetSettings);
    },
    applySettings(settings: Settings): Promise<Settings> {
      return ipcRenderer.invoke(IpcChannels.ApplySettings, settings);
    },
    fetchFhirPatients(url: string, fhir: FhirConnectionOptions): Promise<any> {
      return ipcRenderer.invoke(IpcChannels.FetchFhirPatients, url, fhir);
    },
    announcementFhirStudy(
      study: DicomStudyMeta,
      fhir: FhirConnectionOptions,
    ): Promise<any> {
      return ipcRenderer.invoke(IpcChannels.AnnouncementFhirStudy, study, fhir);
    },
    testFhirConnection(
      fhir: FhirConnectionOptions,
    ): Promise<TestFhirConnectionResponse> {
      return ipcRenderer.invoke(IpcChannels.TestFhirConnection, fhir);
    },
    getPath(type: string): Promise<string> {
      return ipcRenderer.invoke(IpcChannels.AppGetPath, type);
    },
    openFolder(
      initDirectory: string | (() => string) | undefined,
    ): Promise<OpenDialogReturnValue> {
      return ipcRenderer.invoke(IpcChannels.OpenFolder, initDirectory);
    },
    checkDicomTools(): Promise<DcmtkValidationResult> {
      return ipcRenderer.invoke(IpcChannels.CheckDicomTools);
    },
    sendDicomCFind(data: CFindRequest): Promise<CFindResponse> {
      return ipcRenderer.invoke(IpcChannels.SendDicomCFind, data);
    },
    sendDicomCEcho(data: CEchoRequest): Promise<CEchoResponse> {
      return ipcRenderer.invoke(IpcChannels.SendDicomCEcho, data);
    },
    existsDicomDirFile(folder: string | undefined): Promise<boolean> {
      return ipcRenderer.invoke(IpcChannels.ExistsDicomDirFile, folder);
    },
    readDicomDirAsXml(
      folder: string | undefined,
    ): Promise<ReadDicomDirAsXmlResponse> {
      return ipcRenderer.invoke(IpcChannels.RequestDicomDirAsXml, folder);
    },
    readDicomFileAsXml(file: DicomFile): Promise<ReadDicomFileAsXmlResponse> {
      return ipcRenderer.invoke(IpcChannels.RequestDicomFileAsXml, file);
    },
    collectDicomFiles(folder: string | undefined): Promise<DicomFile[]> {
      return ipcRenderer.invoke(IpcChannels.CollectDicomFiles, folder);
    },
    getDicomDocument(
      seriesInstanceUID: string,
      filePath: string,
    ): Promise<Buffer> {
      return ipcRenderer.invoke(
        IpcChannels.GetDicomDocument,
        seriesInstanceUID,
        filePath,
      );
    },
    /**
     * Returns a promise a DICOM object or PNG image.
     * @param seriesInstanceUID
     * @param dicomFileUri
     */
    getDicomImage(
      seriesInstanceUID: string,
      dicomFileUri: string,
    ): Promise<Buffer> {
      return ipcRenderer.invoke(
        IpcChannels.GetDicomImage,
        seriesInstanceUID,
        dicomFileUri,
      );
    },
    storeDicomImage(image: CStoreRequest): Promise<CStoreResponse> {
      return ipcRenderer.invoke(IpcChannels.StoreDicomImage, image);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
