import { app } from 'electron';
import logger from 'electron-log/main';
import path from 'path';
import fs from 'fs';
import { Buffer } from 'buffer';
import PromiseQueue from './queue';
import {
  defaultConfiguration,
  defaultDicomSettings,
  defaultFhirSettings,
  defaultImportSettings,
  defaultUISettings,
  DicomOptions,
  FhirConnectionOptions,
  FhirOptions,
  ImportOptions,
  Settings,
  UiOptions,
} from '../shared/configuration-properties';
import {
  defaultDicomStorage,
  defaultDicomWorklist,
  defaultDicomWorklistQuery,
  DicomNode,
  DicomQuery,
  DicomStudyMeta,
  DicomWorklistNode,
  TestFhirConnectionResponse,
} from '../shared/shared-types';

export function getUsersStudyImporterPath(): string {
  return path.join(app.getPath('home'), '.study-importer');
}

/**
 * Returns session folder for current user.
 *
 * Usually, this folder can be deleted and should deleted before terminate application
 * @param create
 */
export function getUsersSessionPath(create = false): string {
  const folder = path.join(getUsersStudyImporterPath(), 'session');

  if (create && !fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  return folder;
}

const getFilename = (): string => {
  return path.join(getUsersStudyImporterPath(), 'study-importer-settings.json');
};

export const writeSettings = (settings: Settings): Promise<Settings> => {
  logger.log('Writing settings file: ', getFilename());
  const json = JSON.stringify(settings, null, 2);
  return new Promise<Settings>((resolve) => {
    if (!fs.existsSync(getUsersStudyImporterPath())) {
      fs.mkdirSync(getUsersStudyImporterPath());
    }

    fs.writeFile(getFilename(), json, { encoding: 'utf8' }, () => {
      resolve(settings);
    });
  });
};

export const readFilePromise = (file: string) => {
  return new Promise<Buffer>((resolve, reject) => {
    logger.info('Reading file', file);
    fs.readFile(file, (err2, data: Buffer) => {
      if (err2) {
        reject(err2);
      }
      resolve(data);
    });
  });
};

let settingsCache: Settings;

export const readSettings = (): Promise<Settings> => {
  return new Promise<Settings>((resolve, reject) => {
    if (settingsCache === undefined) {
      if (fs.existsSync(getFilename())) {
        logger.log('Reading settings file: ', getFilename());
        fs.readFile(
          getFilename(),
          { encoding: 'utf8' },
          (err, data: string) => {
            if (err) {
              reject(err);
            }

            try {
              settingsCache = JSON.parse(data);
              resolve(settingsCache);
            } catch (e) {
              reject(new Error(`Unable to parse JSON: ${e}, JSON=${data}`));
            }
          },
        );
      } else {
        logger.log('Creating new settings file');
        writeSettings(defaultConfiguration())
          .then((settings) => {
            resolve(settings);
            return settings;
          })
          .catch((ex) => {
            reject(ex);
          });
      }
    } else {
      resolve(settingsCache);
    }
  });
};

const applyUi = (
  uiOptions: UiOptions,
  toApply: UiOptions | undefined,
): UiOptions => {
  const o = uiOptions ?? defaultUISettings();

  if (toApply === undefined) {
    return uiOptions;
  }

  if (toApply.language !== undefined) {
    o.language = toApply.language;
  }

  return o;
};

const applyImport = (
  importOptions: ImportOptions,
  toApply: ImportOptions | undefined,
): ImportOptions => {
  const o = importOptions ?? defaultImportSettings();

  if (toApply === undefined) {
    return importOptions;
  }

  if (toApply.defaultImportPath1 !== undefined) {
    o.defaultImportPath1 = toApply.defaultImportPath1;
  }

  if (toApply.defaultImportType1 !== undefined) {
    o.defaultImportType1 = toApply.defaultImportType1;
  }

  if (toApply.defaultImportPath2 !== undefined) {
    o.defaultImportPath2 = toApply.defaultImportPath2;
  }

  if (toApply.defaultImportType2 !== undefined) {
    o.defaultImportType2 = toApply.defaultImportType2;
  }

  if (toApply.lastUsedImportFolder !== undefined) {
    o.lastUsedImportFolder = toApply.lastUsedImportFolder;
  }

  if (toApply.lastUsedImportMode !== undefined) {
    o.lastUsedImportMode = toApply.lastUsedImportMode;
  }

  return o;
};

const applyDicomStorageSettings = (
  storageSettings: DicomNode,
  toApply: DicomNode | undefined,
): DicomNode => {
  const o = storageSettings ?? defaultDicomStorage();

  if (toApply === undefined) {
    return storageSettings;
  }

  if (toApply.hostname !== undefined) {
    o.hostname = toApply.hostname;
  }

  if (toApply.port !== undefined) {
    o.port = toApply.port;
  }

  if (toApply.displayName !== undefined) {
    o.displayName = toApply.displayName;
  }
  if (toApply.aet !== undefined) {
    o.aet = toApply.aet;
  }

  if (toApply.localAET !== undefined) {
    o.localAET = toApply.localAET;
  }

  return o;
};

const applyDicomWorklistQuerySettings = (
  querySettings: DicomQuery,
  toApply: DicomQuery | undefined,
): DicomQuery => {
  const o = querySettings ?? defaultDicomWorklistQuery();

  if (toApply === undefined) {
    return querySettings;
  }

  if (toApply.scheduledModality !== undefined) {
    o.scheduledModality = toApply.scheduledModality;
  }

  if (toApply.scheduledAET !== undefined) {
    o.scheduledAET = toApply.scheduledAET;
  }

  if (toApply.scheduledDate !== undefined) {
    o.scheduledDate = toApply.scheduledDate;
  }

  logger.log('Applied query', o);

  return o;
};

const applyDicomWorklistSettings = (
  worklistSettings: DicomWorklistNode,
  toApply: DicomWorklistNode | undefined,
): DicomWorklistNode => {
  const o = worklistSettings ?? defaultDicomWorklist();

  if (toApply === undefined) {
    return worklistSettings;
  }

  if (toApply.hostname !== undefined) {
    o.hostname = toApply.hostname;
  }

  if (toApply.port !== undefined) {
    o.port = toApply.port;
  }

  if (toApply.displayName !== undefined) {
    o.displayName = toApply.displayName;
  }
  if (toApply.aet !== undefined) {
    o.aet = toApply.aet;
  }

  if (toApply.localAET !== undefined) {
    o.localAET = toApply.localAET;
  }

  o.query = applyDicomWorklistQuerySettings(o.query, toApply.query);

  return o;
};

const applyDicomSettings = (
  dicomSettings: DicomOptions,
  toApply: DicomOptions | undefined,
): DicomOptions => {
  const o = dicomSettings ?? defaultDicomSettings();

  if (toApply === undefined) {
    return dicomSettings;
  }

  if (toApply.localAET !== undefined) {
    o.localAET = toApply.localAET;
  }

  o.storage = applyDicomStorageSettings(o.storage, toApply.storage);
  o.worklist = applyDicomWorklistSettings(o.worklist, toApply.worklist);

  return o;
};

const applyFhirImport = (
  fhirSettings: FhirOptions,
  toApply: FhirOptions | undefined,
): FhirOptions => {
  const o = fhirSettings ?? defaultFhirSettings();

  if (toApply === undefined) {
    return fhirSettings;
  }

  if (toApply.baseURL !== undefined) {
    o.baseURL = toApply.baseURL;
  }

  return o;
};

const settingsApplyQueue = new PromiseQueue();

export const applySettings = (toApply: Settings): Promise<Settings> => {
  return settingsApplyQueue.enqueue(() =>
    readSettings()
      .then((settings) => {
        logger.info('[Main] Apply settings');

        settings.ui = applyUi(settings.ui, toApply.ui);
        settings.importOptions = applyImport(
          settings.importOptions,
          toApply.importOptions,
        );
        settings.dicom = applyDicomSettings(settings.dicom, toApply.dicom);
        settings.fhir = applyFhirImport(settings.fhir, toApply.fhir);

        return settings;
      })
      .then((settings) => {
        return writeSettings(settings);
      }),
  );
};

const creatingAuthHeader = (
  username: string | undefined,
  password: string | undefined,
  token: string | undefined,
): Headers => {
  const headers: Headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else if (username) {
    headers.set(
      'Authorization',
      Buffer.from(`${username}:${password}`, 'binary').toString('base64'),
    );
  }

  return headers;
};

export const fetchFhirPatients = (
  query: string,
  fhir: FhirConnectionOptions,
): Promise<any> => {
  const headers: Headers = creatingAuthHeader(
    fhir.username,
    fhir.password,
    fhir.bearerToken,
  );
  headers.set('Accept', 'application/json');

  return new Promise((resolve) => {
    resolve(
      readSettings().then(async (settings) => {
        const url = `${settings?.fhir?.baseURL}/Patient?phonetic=${query}`;
        logger.info(`Fetching URL: ${url}`);
        const response = await fetch(url, {
          method: 'GET',
          headers,
        });
        if (!response.ok) {
          throw new Error(
            `Query failed. Server response status ${response.status}: ${response.statusText}.`,
          );
        }
        return response.json();
      }),
    );
  });
};

export const announcementFhirStudy = (
  study: DicomStudyMeta,
  fhir: FhirConnectionOptions,
): Promise<any> => {
  return new Promise((resolve) => {
    const fhirModel = {
      resourceType: 'ImagingStudy',
      id: 'example-xr',
      identifier: [
        {
          use: 'official',
          system: 'urn:dicom:uid',
          value: `urn:oid:${study.studyInstanceUID}`,
        },
      ],
      subject: {
        reference: `Patient/${study.patient?.patientID}`,
      },
      basedOn: [
        {
          identifier: {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'ACSN',
                },
              ],
            },
            system: 'http://studyimporter.org/accession',
            value: study.accessionNumber,
          },
        },
      ],
    };

    const headers: Headers = creatingAuthHeader(
      fhir.username,
      fhir.password,
      fhir.bearerToken,
    );
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');

    resolve(
      readSettings().then(async (settings) => {
        const url = `${settings?.importOptions.announcement.baseURL}/ImagingStudy`;
        logger.info(`Fetching URL: ${url}`);
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(fhirModel),
        });
        if (!response.ok) {
          throw new Error(
            `Query failed. Server response status ${response.status}: ${response.statusText}.`,
          );
        }
        return response.json();
      }),
    );
  });
};

export const testFhirConnection = (
  fhir: FhirConnectionOptions,
): Promise<TestFhirConnectionResponse> => {
  logger.info(`Fetching Test URL: ${fhir.baseURL}`);
  const headers: Headers = creatingAuthHeader(
    fhir.username,
    fhir.password,
    fhir.bearerToken,
  );
  headers.set('Accept', 'application/json');

  const url = `${fhir.baseURL}/Patient?phonetic=ABC`;
  return fetch(url, {
    method: 'GET',
    headers,
  }).then((response) => {
    return {
      status: response.status,
      statusText: response.statusText,
    };
  });
};
