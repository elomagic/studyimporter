/**
 * Integrate the Offis DICOM Toolkit.
 */
import { ChildProcess, ExecException, execFile } from 'child_process';
import fs from 'fs';
import yauzl from 'yauzl';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import logger from 'electron-log/main';
import { ExecFileException } from 'node:child_process';
import { getUsersSessionPath, readFilePromise } from './common-services';
import {
  CEchoRequest,
  CEchoResponse,
  CFindRequest,
  CFindResponse,
  CStoreRequest,
  CStoreResponse,
  DcmtkValidationResult,
  defaultLocalAet,
  defaultPacsAet,
  DicomFile,
  DicomTool,
  ReadDicomDirAsXmlResponse,
  ReadDicomFileAsXmlResponse,
} from '../shared/shared-types';

const tools: string[] = [
  'findscu',
  'storescu',
  'echoscu',
  'dcmj2pnm',
  'dcm2xml',
  'dcmj2pnm',
];

function validateToolsQueue(
  toolsQueue: string[],
  result: DcmtkValidationResult,
  _child: (
    file: string,
    args: ReadonlyArray<string> | undefined | null,
    callback: (
      error: ExecException | null,
      stdout: string,
      stderr: string,
    ) => void,
  ) => ChildProcess,
  resolve: (resolve: DcmtkValidationResult) => void,
  reject: (reason?: Error) => void,
) {
  try {
    const tool = toolsQueue.shift();
    logger.debug('[ipcMain] Checking tool %s', tool);

    if (tool === undefined) {
      logger.error('Tool can never be undefined.');
    } else {
      const childProcess = execFile(
        tool,
        ['--version'],
        (_ex: ExecFileException | null, data: string) => {
          const dicomTool: DicomTool = {
            displayName: tool,
            version: /(?<=dcmtk: ).*/
              .exec(data)
              ?.toString()
              .replace(tool, '')
              .replace('$', ''),
            status: childProcess.exitCode === 0,
          };

          result.dicomTools.push(dicomTool);

          if (toolsQueue.length === 0) {
            resolve(result);
          } else {
            validateToolsQueue(toolsQueue, result, execFile, resolve, reject);
          }
        },
      );
    }
  } catch (e: any) {
    logger.error(e);
    reject(e);
  }
}

export function validateDicomTools(): Promise<DcmtkValidationResult> {
  logger.debug('[ipcMain] "ValidateDicomTool" called');
  return new Promise<DcmtkValidationResult>((resolve, reject) => {
    const result: DcmtkValidationResult = {
      dicomTools: [],
    };

    validateToolsQueue([...tools], result, execFile, resolve, reject);
  });
}

export function sendCEcho(request: CEchoRequest): Promise<CEchoResponse> {
  const executablePath = 'echoscu';
  const parameters: string[] = [
    '-v',
    '-aet',
    request.localAET ?? defaultLocalAet,
    '-aec',
    request.aet ?? defaultPacsAet,
    request.hostname ?? 'localhost',
    String(request.port ?? 11112),
  ];

  return new Promise<CStoreResponse>((resolve) => {
    // eslint-disable-next-line func-names
    const childProcess = execFile(
      executablePath,
      parameters,
      (_ex: ExecFileException | null, stdout: string, stderr: string) => {
        logger.info('Error: ', childProcess.exitCode);
        logger.info('Data: ', stdout);

        const response: CEchoResponse = {
          exitCode: childProcess.exitCode,
          displayText:
            childProcess.exitCode === 0 ? stdout.toString() : stderr.toString(),
        };

        resolve(response);
      },
    );
  });
}

export function getImagePromise(
  seriesInstanceUID: string,
  dicomFileUri: string | undefined,
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    if (dicomFileUri === undefined) {
      logger.warn("DICOM image doesn't exists", dicomFileUri);

      readFilePromise('./assets/icon.png')
        .then((data) => {
          resolve(data);
          return data;
        })
        .catch((e) => {
          reject(e);
        });
      return;
    }
    const dicomFile = dicomFileUri;
    const imageName = path.parse(dicomFileUri).name;
    const targetFile = path.join(
      getUsersSessionPath(true),
      `${seriesInstanceUID}-${imageName}.png`,
    );

    if (fs.existsSync(targetFile)) {
      logger.info('Read already converted DICOM file', targetFile);

      readFilePromise(targetFile)
        .then((data) => {
          resolve(data);
          return data;
        })
        .catch((e) => {
          reject(e);
        });
    } else {
      logger.info('Convert DICOM file to PNG', dicomFileUri);
      const parameters = ['-v', '+on2', dicomFile, targetFile];
      logger.info('Convert dicom data to png: ', parameters);

      // eslint-disable-next-line func-names
      const childProcess = execFile(
        'dcmj2pnm',
        parameters,
        (_err: ExecFileException | null, out: string) => {
          logger.info('ExitCode: ', childProcess.exitCode);
          logger.info('Data: ', out);

          if (childProcess.exitCode === 0) {
            logger.info('Reading file', targetFile);
            readFilePromise(targetFile)
              .then((data) => {
                resolve(data);
                return data;
              })
              .catch((e) => {
                reject(e);
              });
          } else {
            reject(
              new Error(
                `Unable to convert DICOM file '${dicomFile}'. Exitcode ${childProcess.exitCode}`,
              ),
            );
          }
        },
      );
    }
  });
}

export function getPdfPromise(
  seriesInstanceUID: string,
  filePath: string | undefined,
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    if (filePath === undefined) {
      logger.info("DICOM series or image doesn't exists", filePath);

      readFilePromise('./assets/icon.png')
        .then((data) => {
          resolve(data);
          return data;
        })
        .catch((e) => {
          reject(e);
        });

      return;
    }

    const dicomFile = filePath;
    const imageName = path.parse(filePath).name;
    const targetFile = path.join(
      getUsersSessionPath(true),
      `${seriesInstanceUID}-${imageName}.pdf`,
    );

    if (fs.existsSync(targetFile)) {
      logger.info('Read already converted DICOM file', filePath);
      readFilePromise(targetFile)
        .then((data) => {
          resolve(data);
          return data;
        })
        .catch((e) => {
          reject(e);
        });
    } else {
      // dcm2pdf -v 0098 0098.pdf
      const parameters = ['-v', dicomFile, targetFile];
      logger.info('Convert DICOM file to PDF', seriesInstanceUID, filePath);

      // eslint-disable-next-line func-names
      const childProcess = execFile(
        'dcm2pdf',
        parameters,
        (_err: ExecFileException | null, out: string) => {
          logger.info('ExitCode: ', childProcess.exitCode);
          logger.info('Data: ', out);

          if (childProcess.exitCode === 0) {
            logger.info('Reading file', filePath);
            readFilePromise(filePath)
              .then((data) => {
                resolve(data);
                return data;
              })
              .catch((e) => {
                reject(e);
              });
          } else {
            reject(
              new Error(
                `Unable to convert DICOM file '${dicomFile}'. Exitcode ${childProcess.exitCode}`,
              ),
            );
          }
        },
      );
    }
  });
}

export function storeImagePromise(
  request: CStoreRequest,
): Promise<CStoreResponse> {
  const dicomFile = request.dicomFileURL;

  return new Promise<CStoreResponse>((resolve, reject) => {
    if (dicomFile === undefined) {
      logger.info("DICOM series or image doesn't exists", dicomFile);
      reject(
        new Error(`Unable to store DICOM file '${dicomFile}'. File not set`),
      );
      return;
    }

    if (fs.existsSync(dicomFile)) {
      // dcm2pdf -v 0098 0098.pdf
      const parameters: string[] = [
        '-v',
        '-aet',
        request.localAET ?? defaultLocalAet,
        '-aec',
        request.aet ?? defaultPacsAet,
        request.hostname ?? 'localhost',
        `${request.port}`,
        request.dicomFileURL,
      ];

      logger.info('Storing DICOM file: storescu ', parameters);
      // eslint-disable-next-line func-names
      const childProcess = execFile(
        'storescu',
        parameters,
        (_err: ExecFileException | null, out: string) => {
          logger.info('ExitCode: ', childProcess.exitCode);
          logger.info('Data: ', out);

          if (childProcess.exitCode === 0) {
            const response: CStoreResponse = {
              exitCode: childProcess.exitCode,
              displayText: 'Successfully',
            };

            resolve(response);
          } else {
            reject(
              new Error(
                `Unable to store DICOM file '${dicomFile}'. Exitcode ${childProcess.exitCode}`,
              ),
            );
          }
        },
      );
    } else {
      reject(
        new Error(`Unable to store DICOM file '${dicomFile}'. File not found`),
      );
    }
  });
}

/**
 * Collect DICOM files from a folder or also a single file.
 * @param folder Folder to scan
 */
export function collectDicomFiles(
  folder: string | undefined,
): Promise<DicomFile[]> {
  if (folder === undefined || !fs.statSync(folder).isDirectory()) {
    return Promise.resolve([]);
  }
  return Promise.resolve(
    fs
      .readdirSync(folder)
      .filter((filename) => {
        return (
          filename.indexOf('pre') === -1 &&
          (filename.toLowerCase().endsWith('.dicom') ||
            filename.toLowerCase().endsWith('.dicomzip'))
        );
      })
      .map((filename) => {
        return path.join(folder, filename);
      })
      .map((filename) => {
        const result: DicomFile = {
          file: filename,
          compressed: filename.toLowerCase().endsWith('.dicomzip'),
        };
        return result;
      }),
  );
}

const uncompressDicomFile = (compressedDicomFile: DicomFile): string => {
  const workFile = path.join(
    getUsersSessionPath(true),
    `uncompressed.${uuidv4()}.dicom`,
  );
  yauzl.open(
    compressedDicomFile.file.toString(),
    { lazyEntries: true },
    (err, zipfile) => {
      zipfile.readEntry();
      zipfile.on('entry', (entry) => {
        const outputStream = fs.createWriteStream(workFile);
        try {
          zipfile.openReadStream(entry, (_err, inputStream) => {
            inputStream.pipe(outputStream);
          });
        } finally {
          // outputStream.close();
        }
      });
    },
  );

  return workFile;
};

export function readDicomFileAsXml(
  dicomFile: DicomFile,
): Promise<ReadDicomFileAsXmlResponse> {
  return new Promise<ReadDicomFileAsXmlResponse>((resolve, reject) => {
    let workFile = dicomFile.file.toString();
    if (dicomFile.compressed) {
      workFile = uncompressDicomFile(dicomFile);
    }

    const parameters = ['--convert-to-utf8', workFile];
    logger.info('Analyzing DICOM file: ', parameters);
    // eslint-disable-next-line func-names
    const childProcess = execFile(
      'dcm2xml',
      parameters,
      {
        maxBuffer: 1024 * 1024 * 16,
      },
      (_err: ExecFileException | null, xml: string) => {
        logger.info('dcm2xml ExitCode: ', childProcess.exitCode);
        if (childProcess.exitCode === null || childProcess.exitCode !== 0) {
          reject(new Error('Unable to extract studies from DICOMDIR.'));
        } else {
          logger.debug('dcm xml: ', xml);

          resolve({
            xml,
            exitCode: childProcess.exitCode,
          });
        }
      },
    );
  });
}

export function existsDicomDirFile(
  folder: string | undefined,
): Promise<boolean> {
  return Promise.resolve(
    folder !== undefined && fs.existsSync(path.join(folder, 'DICOMDIR')),
  );
}

/**
 * Analyze folder and returns DICOM DIR as XML model .
 * @param folder Folder to analyze
 */
export function readDicomDirAsXml(
  folder: string,
): Promise<ReadDicomDirAsXmlResponse> {
  const dicomDirFile = path.join(folder, 'DICOMDIR');

  // TODO
  // TODO Tool can check only files and not a hole folder. So we have to iterate each file?

  return new Promise<ReadDicomDirAsXmlResponse>((resolve, reject) => {
    const parameters = ['--convert-to-utf8', dicomDirFile];
    logger.info('Analyzing DICOMDIR: ', parameters);

    // eslint-disable-next-line func-names
    const childProcess = execFile(
      'dcm2xml',
      parameters,
      {
        maxBuffer: 1024 * 1024 * 16,
      },
      (err: ExecFileException | null, xml: string) => {
        logger.info('dcm2xml ExitCode: ', childProcess.exitCode, err?.message);
        if (childProcess.exitCode === null || childProcess.exitCode !== 0) {
          reject(
            new Error(
              `Unable to extract studies from DICOMDIR: ${err?.message}`,
            ),
          );
        } else {
          logger.debug('dcm xml: ', xml);

          resolve({
            xml,
            exitCode: childProcess.exitCode,
          });
        }
      },
    );
  });
}

export function sendCFind(request: CFindRequest): Promise<CFindResponse> {
  const executablePath = 'findscu';
  // const parameters = ['-v', request.hostname, request.port];
  // findscu -k "(0040,0100)[0].Modality=CT" -k "(0010,0010)=Alw*"
  // -aet DIP localhost 4114 .\query-worklist-attributes.dcm
  // findscu -k "(0040,0100)[0].Modality=CT" -k "(0010,0010)=*"
  // -aet DIP -Xs query-worklist-attributes-result.xml localhost 4114 query-worklist-attributes.txt.dcm
  const parameters: string[] = [
    '-aet',
    request.localAET ?? defaultLocalAet,
    '-Xs',
    'query-worklist-attributes-result.xml',
    request.hostname ?? 'localhost',
    String(request.port ?? 11112),
    '-aec',
    request.aet ?? defaultPacsAet,
    path.join('assets', 'query-worklist-attributes.dcm'),
  ];

  if (request.query?.scheduledModality !== undefined) {
    parameters.unshift(
      '-k',
      `(0040,0100)[0].Modality=${request.query.scheduledModality}`,
    );
  }

  if (request.query?.scheduledAET !== undefined) {
    parameters.unshift('-k', `(0040,0001)=${request.query?.scheduledAET}`);
  }

  return new Promise<CFindResponse>((resolve) => {
    // eslint-disable-next-line func-names
    const childProcess = execFile(
      executablePath,
      parameters,
      (_err: ExecFileException | null, data: string) => {
        logger.info('Error: ', childProcess.exitCode);
        logger.info('Data: ', data);

        // TODO Read xml, create and send CFindResponse
        // Delete xml

        const response: CFindResponse = {
          exitCode: childProcess.exitCode,
          displayText: data.toString(),
          entries: [],
        };

        logger.info('Send C-FIND response', response);
        resolve(response);
      },
    );
  });
}
