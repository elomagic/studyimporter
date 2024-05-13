/**
 * Shared data types between main and renderer process.
 *
 * Only "enum"'s and "type"'s are allowed !
 */
import { PathLike } from 'node:fs';

export enum WorklistQueryDateRange {
  Yesterday = 'Yesterday',
  Today = 'Today',
  Tomorrow = 'Tomorrow',
  TodayAndTomorrow = 'TodayAndTomorrow',
}

export type ProcessExit = {
  exitCode: number | null;
};

type DisplayName = {
  displayName: string | undefined;
};

type DisplayText = {
  displayText: string;
};

export type HostnamePortAddress = {
  hostname: string | undefined;
  port: number | undefined;
};

export type DicomNode = HostnamePortAddress &
  DisplayName & {
    aet: string | undefined;
    localAET: string | undefined;
  };

// Study Importer Settings

export type DicomQuery = {
  scheduledModality: string | undefined;
  scheduledAET: string | undefined;
  scheduledDate: WorklistQueryDateRange | undefined;
};

export type DicomWorklistNode = DicomNode & {
  query: DicomQuery;
};

// Messages

export type CEchoRequest = DicomNode;

export type CEchoResponse = DisplayText & ProcessExit;

export type CFindRequest = DicomWorklistNode;

export type DicomTool = {
  displayName: string;
  version: string | undefined;
  status: boolean | undefined;
};

export type DcmtkValidationResult = {
  dicomTools: DicomTool[];
};

// Every attribute is data type string because values can be invalid
export interface DicomWorklistEntry {
  patientID: string;
  patientDisplayName: string;
  patientDayOfBirth: string;
  patientGender: string;
  studyDescription: string;
  scheduledDate: string;
  scheduledTime: string;
  accessionNumber: string;
}

export type CFindResponse = DisplayText &
  ProcessExit & {
    entries: DicomWorklistEntry[];
  };

export type ReadDicomDirAsXmlResponse = ProcessExit & {
  xml: string;
};

export type ReadDicomFileAsXmlResponse = ProcessExit & {
  xml: string;
};

export type DicomPatientMeta = {
  patientID: string;
  patientDisplayName: string;
  patientDayOfBirth: string;
  patientGender: string;
};

export type DicomSeriesMeta = {
  seriesInstanceUID: string;
  seriesDescription: string;
  modality: string;
  institutionName?: string;
  // eslint-disable-next-line no-use-before-define
  images: DicomImageMeta[];
  // eslint-disable-next-line no-use-before-define
  previewImage: DicomImageMeta | undefined;
  patient?: DicomPatientMeta;
  // studyInstanceUID: string;
};

export type DicomStudyMeta = {
  studyInstanceUID: string;
  studyDescription: string;
  performedDate: string;
  performedTime: string;
  accessionNumber: string;
  series: DicomSeriesMeta[];
  patient?: DicomPatientMeta;
};

export type DicomFile = {
  file: PathLike;
  compressed: boolean;
};

export type DicomImageMeta = {
  instanceNumber: number;
  /**
   * Parent series instance UID.
   */
  seriesInstanceUID: string;
  manufacturer?: string;
  manufacturerModelName?: string;
  /**
   * URL of the original DICOM file.
   */
  dicomFileURL: string;
  /**
   * DirectoryRecordType (0004,1430).
   */
  directoryRecordType: string;
  /**
   * Path of the PNG file (optional).
   */
  imageFile?: string;
  /**
   * Reference file id of the DICOM tag (optional).
   */
  refFileId?: string;
  patient?: DicomPatientMeta;
  studyInstanceUID?: string;
};

export const defaultLocalAet = 'STUDYIMP';
export const defaultPacsAet = 'PACS';

export type CStoreRequest = DicomImageMeta & DicomNode;

export type CStoreResponse = DisplayText & ProcessExit;

export type TestFhirConnectionResponse = {
  status: number;
  statusText: string;
};
export const defaultDicomNode = (): DicomNode => {
  return {
    displayName: 'Local DICOM node',
    hostname: 'localhost',
    port: 104,
    aet: 'ANY-NODE',
    localAET: 'ELO-SI',
  };
};

export const defaultDicomStorage = (): DicomNode => {
  return {
    displayName: 'Local DICOM Storage',
    hostname: 'localhost',
    port: 104,
    aet: 'STORAGE',
    localAET: 'ELO-SI',
  };
};

export const defaultDicomWorklistQuery = (): DicomQuery => {
  return {
    scheduledModality: undefined,
    scheduledAET: undefined,
    scheduledDate: undefined,
  };
};

export const defaultDicomWorklist = (): DicomWorklistNode => {
  return {
    displayName: 'Local DICOM WORKLIST',
    hostname: 'localhost',
    port: 104,
    aet: 'WORKLIST',
    localAET: undefined,
    query: defaultDicomWorklistQuery(),
  };
};
