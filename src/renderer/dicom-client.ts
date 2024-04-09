import xpath, { SelectReturnType } from 'xpath';
import log from 'electron-log/renderer';
import {
  DicomImageMeta,
  DicomPatientMeta,
  DicomSeriesMeta,
  DicomStudyMeta,
} from '../shared/shared-types';

export function getFirstValue(doc: Node, xp: string): string {
  const nodes: Array<Node> = xpath.select(xp, doc) as Array<Node>;

  return nodes === null || nodes.length === 0 || nodes[0].firstChild === null
    ? undefined
    : nodes[0].firstChild.data;
}

export function getTagValue(node: Node, tag: string): string {
  return getFirstValue(node, `element[contains(@tag, '${tag}')]`);
}

export function mapPatient(node: Node): DicomPatientMeta {
  return {
    patientID: getTagValue(node, '0010,0020'),
    patientDisplayName: getTagValue(node, '0010,0010'),
    patientDayOfBirth: getTagValue(node, '0010,0030'),
    patientGender: getTagValue(node, '0010,0040'),
  };
}

export function mapStudy(node: Node): DicomStudyMeta {
  return {
    studyInstanceUID: getTagValue(node, '0020,000d'),
    studyDescription: getTagValue(node, '0008,1030'),
    performedDate: getTagValue(node, '0008,0020'),
    performedTime: getTagValue(node, '0008,0030'),
    accessionNumber: getTagValue(node, '0008,0050'),
    series: [],
  };
}

export function mapSeries(node: Node): DicomSeriesMeta {
  return {
    seriesInstanceUID: getTagValue(node, '0020,000e'),
    seriesDescription: getTagValue(node, '0008,103e'),
    modality: getTagValue(node, '0008,0060'),
    institutionName: getTagValue(node, '0008,0080'),
    images: [],
    previewImage: undefined,
  };
}

export function mapImage(
  node: Node,
  seriesInstanceUID: string,
  studyInstanceUID: string,
  folder: string,
): DicomImageMeta {
  const refFileId = getTagValue(node, '0004,1500');
  return {
    instanceNumber: parseInt(getTagValue(node, '0020,0013'), 10),
    seriesInstanceUID,
    studyInstanceUID,
    manufacturer: getTagValue(node, '0008,0070'),
    manufacturerModelName: getTagValue(node, '0008,1090'),
    // objectURI: `elosi::${seriesInstanceUID}:${refFileId}:`,
    refFileId: getTagValue(node, '0004,1500'),
    // Will crash with the 'path' module
    // fileURL: path.join(folder, refFileId.replaceAll('\\', path.sep)),
    dicomFileURL: folder.concat('/', refFileId.replaceAll('\\', '/')),
    directoryRecordType: getTagValue(node, '0004,1430'),
  };
}

export const mapDicomDirIntoModel = (
  xml: string,
  folder: string,
  listener: (
    patientCount: number,
    studyCount: number,
    seriesCount: number,
  ) => void,
): DicomStudyMeta[] => {
  log.debug('mapDicomDirIntoModel folder=%s', folder);

  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const nodes: SelectReturnType = xpath.select(
    '/file-format/data-set/sequence/item',
    doc,
  ) as Array<Node>;

  const patients = new Map<string, DicomPatientMeta>();
  const studies = new Map<string, DicomStudyMeta>();
  const series = new Map<string, DicomSeriesMeta>();

  let currentPatient: DicomPatientMeta;
  let currentStudyInstance: DicomStudyMeta;
  let currentSeriesInstance: DicomSeriesMeta;

  try {
    // TODO May be we have to build up complete here DICOM DIR tree for the study list UI to save performance/time.
    nodes.forEach((node: Node) => {
      const type = getTagValue(node, '0004,1430');

      if (type === 'PATIENT') {
        const patient = mapPatient(node);
        currentPatient = patients.get(patient.patientID) ?? patient;
        patients.set(currentPatient.patientID, patient);

        listener(patients.size, studies.size, series.size);
      } else if (type === 'STUDY') {
        const study = mapStudy(node);
        currentStudyInstance = studies.get(study.studyInstanceUID) ?? study;
        study.patient = currentPatient;
        studies.set(
          currentStudyInstance.studyInstanceUID,
          currentStudyInstance,
        );

        listener(patients.size, studies.size, series.size);
      } else if (type === 'SERIES') {
        const serie = mapSeries(node);
        serie.patient = currentPatient;
        currentSeriesInstance = series.get(serie.seriesInstanceUID) ?? serie;
        series.set(
          currentSeriesInstance.seriesInstanceUID,
          currentSeriesInstance,
        );
        currentStudyInstance.series.push(currentSeriesInstance);

        listener(patients.size, studies.size, series.size);
      } else if (type === 'IMAGE' || type === 'ENCAP DOC') {
        const image = mapImage(
          node,
          currentSeriesInstance.seriesInstanceUID,
          currentStudyInstance.studyInstanceUID,
          folder,
        );
        currentSeriesInstance.images.push(image);
        currentSeriesInstance.previewImage =
          currentSeriesInstance.images[
            Math.floor(currentSeriesInstance.images.length / 2)
          ];
      }
    });
  } catch (err) {
    log.error(err);
    throw err;
  }

  return [...studies.values()];
};
