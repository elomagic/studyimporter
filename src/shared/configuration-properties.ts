/**
 * Used by main and renderer process.
 *
 * So, don't import modules like 'app' from main or renderer!!!
 */
import {
  defaultDicomStorage,
  defaultDicomWorklist,
  DicomNode,
  DicomWorklistNode,
} from './shared-types';

export enum ImportSource {
  Path1 = 'path1',
  Path2 = 'path2',
  Folder = 'folder',
  Files = 'files',
}

export type FhirConnectionOptions = {
  baseURL: string | undefined;
  username: string | undefined;
  password: string | undefined;
  bearerToken: string | undefined;
};

export enum AnnouncementMode {
  NoAnnouncement = 'NoAnnouncement',
  BeforeStoringImages = 'BeforeStoringImages',
  AfterStoringImages = 'AfterStoringImages',
}

export type Announcement = FhirConnectionOptions & {
  mode: AnnouncementMode | undefined;
};

export type ImportOptions = {
  defaultImportPath1: string | undefined;
  defaultImportType1: string | undefined;
  defaultImportPath2: string | undefined;
  defaultImportType2: string | undefined;
  lastUsedImportFolder: string | undefined;
  lastUsedImportMode: ImportSource | undefined;
  announcement: Announcement;
};

export type DicomOptions = {
  localAET: string | undefined;
  storage: DicomNode;
  worklist: DicomWorklistNode;
};

export type FhirOptions = FhirConnectionOptions & {
  patientIdJsonPath: string | undefined;
};

export interface UiOptions {
  language: string;
}

export type Settings = {
  ui: UiOptions;
  importOptions: ImportOptions;
  dicom: DicomOptions;
  fhir: FhirOptions;
};

export const defaultUISettings = (): UiOptions => {
  return {
    language: 'de',
  };
};

export const defaultAnnouncement = (): Announcement => {
  return {
    mode: AnnouncementMode.NoAnnouncement,
    baseURL: undefined,
    username: undefined,
    password: undefined,
    bearerToken: undefined,
  };
};

export const defaultImportSettings = (): ImportOptions => {
  return {
    defaultImportPath1: 'd:\\',
    defaultImportType1: 'CD-ROM',
    defaultImportPath2: 'e:\\',
    defaultImportType2: 'USB-DRIVE',
    lastUsedImportFolder: undefined,
    lastUsedImportMode: ImportSource.Path1,
    announcement: defaultAnnouncement(),
  };
};

export const defaultDicomSettings = (): DicomOptions => {
  return {
    localAET: 'STUDY-IMP',
    storage: defaultDicomStorage(),
    worklist: defaultDicomWorklist(),
  };
};

export const defaultFhirConnectionOptions = (): FhirConnectionOptions => {
  return {
    baseURL: undefined,
    username: undefined,
    password: undefined,
    bearerToken: undefined,
  };
};

export const defaultFhirSettings = (): FhirOptions => {
  return {
    baseURL: undefined,
    username: undefined,
    password: undefined,
    bearerToken: undefined,
    patientIdJsonPath: undefined,
  };
};

export const undefinedSettings = (): Settings => {
  return {
    ui: {
      language: 'de',
    },
    importOptions: {
      defaultImportPath1: undefined,
      defaultImportType1: undefined,
      defaultImportPath2: undefined,
      defaultImportType2: undefined,
      lastUsedImportFolder: undefined,
      lastUsedImportMode: undefined,
      announcement: {
        mode: undefined,
        baseURL: undefined,
        username: undefined,
        password: undefined,
        bearerToken: undefined,
      },
    },
    dicom: {
      localAET: undefined,
      storage: {
        displayName: undefined,
        hostname: undefined,
        port: undefined,
        aet: undefined,
        localAET: undefined,
      },
      worklist: {
        displayName: undefined,
        hostname: undefined,
        port: undefined,
        aet: undefined,
        localAET: undefined,
        query: {
          scheduledModality: undefined,
          scheduledAET: undefined,
          scheduledDate: undefined,
        },
      },
    },
    fhir: {
      baseURL: undefined,
      username: undefined,
      password: undefined,
      bearerToken: undefined,
      patientIdJsonPath: undefined,
    },
  };
};

export const defaultConfiguration = (): Settings => {
  return {
    ui: defaultUISettings(),
    importOptions: defaultImportSettings(),
    dicom: defaultDicomSettings(),
    fhir: defaultFhirSettings(),
  };
};
