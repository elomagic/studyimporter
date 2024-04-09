enum IpcChannels {
  AnnouncementFhirStudy = 'announcement-fhir-study',
  AppGetPath = 'app-get-path',
  ApplySettings = 'apply-settings',
  CheckDicomTools = 'check-dicom-tools',
  CloseApplication = 'close-application',
  CollectDicomFiles = 'collect-dicom-files',
  FetchFhirPatients = 'fetch-fhir-patients',
  GetDicomDocument = 'get-document',
  GetDicomImage = 'get-image',
  GetDicomSeriesMetaData = 'get-dicom-series-meta',
  GetSettings = 'get-settings',
  ExistsDicomDirFile = 'exists-dicom-dir-file',
  OpenFolder = 'open-folder',
  RequestDicomDirAsXml = 'request-dicom-dir-as-xml',
  RequestDicomFileAsXml = 'request-dicom-file-as-xml',
  SendDicomCEcho = 'request-c-echo',
  SendDicomCFind = 'request-c-find',
  StoreDicomImage = 'store-dicom-image',
  TestFhirConnection = 'test-fhir-connection',
}

export default IpcChannels;
