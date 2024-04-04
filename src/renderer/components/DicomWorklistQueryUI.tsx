import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { FaEdit, FaFilter } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { DicomQuery, WorklistQueryDateRange } from '../../shared/shared-types';

type DicomQueryProps = {
  query: DicomQuery;
  edit: boolean | false;
  onChange: (data: DicomQuery) => void;
};

// eslint-disable-next-line react/function-component-definition
const DicomWorklistQueryUI: FunctionComponent<DicomQueryProps> = ({
  query,
  edit,
  onChange,
}: DicomQueryProps) => {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState<boolean>(false);

  const inputAETRef = useRef<HTMLInputElement>(null);
  const [modality, setModality] = useState<string | undefined>('');
  const [date, setDate] = useState<string | undefined>('');

  useEffect(() => {
    setModality(query.scheduledModality ?? '');
    if (inputAETRef?.current != null) {
      inputAETRef.current.value = query.scheduledAET ?? '';
    }
    setDate(query.scheduledDate ?? '');
  }, [query]);

  const fireEvent = (fn: (q: DicomQuery) => void) => {
    const q: DicomQuery = {
      scheduledModality: modality,
      scheduledAET: inputAETRef?.current?.value,
      scheduledDate:
        WorklistQueryDateRange[date as keyof typeof WorklistQueryDateRange],
    };

    fn(q);

    onChange(q);
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  return (
    <>
      {(edit || editMode) && (
        <Grid container spacing={1}>
          <Grid item xs={12} sx={{ marginTop: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="modalityLabel">
                {t('scheduled_modality')}
              </InputLabel>
              <Select
                size="small"
                labelId="modalityLabel"
                label={t('scheduled_modality')}
                name="modality"
                value={modality}
                onChange={(e) => {
                  fireEvent((q) => {
                    q.scheduledModality = String(e.target.value);
                  });
                }}
              >
                <MenuItem value="">-</MenuItem>
                <MenuItem value="DOC">DOC - Document</MenuItem>
                <MenuItem value="OT">OT - Other</MenuItem>
                <MenuItem value="XC">XC - External-camera Photography</MenuItem>
                <MenuItem value="">-</MenuItem>
                <MenuItem value="AR">AR - Autorefraction</MenuItem>
                <MenuItem value="ASMT">
                  ASMT - Content Assessment Results
                </MenuItem>
                <MenuItem value="AU">AU - Audio</MenuItem>
                <MenuItem value="BDUS">
                  BDUS - Bone Densitometry (ultrasound)
                </MenuItem>
                <MenuItem value="BI">BI - Biomagnetic imaging</MenuItem>
                <MenuItem value="BMD">BMD - Bone Densitometry (X-Ray)</MenuItem>
                <MenuItem value="CR">CR - Computed Radiography</MenuItem>
                <MenuItem value="CT">CT - Computed Tomography</MenuItem>
                <MenuItem value="CTPROTOCOL">
                  CTPROTOCOL - CT Protocol (Performed)
                </MenuItem>
                <MenuItem value="DG">DG - Diaphanography</MenuItem>
                <MenuItem value="DOC">DOC - Document</MenuItem>
                <MenuItem value="DX">DX - Digital Radiography</MenuItem>
                <MenuItem value="ECG">ECG - Electrocardiography</MenuItem>
                <MenuItem value="EPS">EPS - Cardiac Electrophysiology</MenuItem>
                <MenuItem value="ES">ES - Endoscopy</MenuItem>
                <MenuItem value="FID">FID - Fiducials</MenuItem>
                <MenuItem value="GM">GM - General Microscopy</MenuItem>
                <MenuItem value="HC">HC - Hard Copy</MenuItem>
                <MenuItem value="HD">HD - Hemodynamic Waveform</MenuItem>
                <MenuItem value="IO">IO - Intra-Oral Radiography</MenuItem>
                <MenuItem value="IOL">IOL - Intraocular Lens Data</MenuItem>
                <MenuItem value="IVOCT">
                  IVOCT - Intravascular Optical Coherence Tomography
                </MenuItem>
                <MenuItem value="IVUS">
                  IVUS - Intravascular Ultrasound
                </MenuItem>
                <MenuItem value="KER">KER - Keratometry</MenuItem>
                <MenuItem value="KO">KO - Key Object Selection</MenuItem>
                <MenuItem value="LEN">LEN - Lensometry</MenuItem>
                <MenuItem value="LS">LS - Laser surface scan</MenuItem>
                <MenuItem value="MG">MG - Mammography</MenuItem>
                <MenuItem value="MR">MR - Magnetic Resonance</MenuItem>
                <MenuItem value="M3D">
                  M3D - Model for 3D Manufacturing
                </MenuItem>
                <MenuItem value="NM">NM - Nuclear Medicine</MenuItem>
                <MenuItem value="OAM">
                  OAM - Ophthalmic Axial Measurements
                </MenuItem>
                <MenuItem value="OCT">
                  OCT - Optical Coherence Tomography (non-Ophthalmic)
                </MenuItem>
                <MenuItem value="OP">OP - Ophthalmic Photography</MenuItem>
                <MenuItem value="OPM">OPM - Ophthalmic Mapping</MenuItem>
                <MenuItem value="OPT">OPT - Ophthalmic Tomography</MenuItem>
                <MenuItem value="OPTBSV">
                  OPTBSV - Ophthalmic Tomography B-scan Volume Analysis
                </MenuItem>
                <MenuItem value="OPTENF">
                  OPTENF - Ophthalmic Tomography En Face
                </MenuItem>
                <MenuItem value="OPV">OPV - Ophthalmic Visual Field</MenuItem>
                <MenuItem value="OSS">OSS - Optical Surface Scan</MenuItem>
                <MenuItem value="OT">OT - Other</MenuItem>
                <MenuItem value="PLAN">PLAN - Plan</MenuItem>
                <MenuItem value="PR">PR - Presentation State</MenuItem>
                <MenuItem value="PT">
                  PT - Positron emission tomography (PET)
                </MenuItem>
                <MenuItem value="PX">PX - Panoramic X-Ray</MenuItem>
                <MenuItem value="REG">REG - Registration</MenuItem>
                <MenuItem value="RESP">RESP - Respiratory Waveform</MenuItem>
                <MenuItem value="RF">RF - Radio Fluoroscopy</MenuItem>
                <MenuItem value="RG">
                  RG - Radiographic imaging (conventional film/screen)
                </MenuItem>
                <MenuItem value="RTDOSE">RTDOSE - Radiotherapy Dose</MenuItem>
                <MenuItem value="RTIMAGE">
                  RTIMAGE - Radiotherapy Image
                </MenuItem>
                <MenuItem value="RTPLAN">RTPLAN - Radiotherapy Plan</MenuItem>
                <MenuItem value="RTRECORD">
                  RTRECORD - RT Treatment Record
                </MenuItem>
                <MenuItem value="RTSTRUCT">
                  RTSTRUCT - Radiotherapy Structure Set
                </MenuItem>
                <MenuItem value="RWV">RWV - Real World Value Map</MenuItem>
                <MenuItem value="SEG">SEG - Segmentation</MenuItem>
                <MenuItem value="SM">SM - Slide Microscopy</MenuItem>
                <MenuItem value="SMR">SMR - Stereometric Relationship</MenuItem>
                <MenuItem value="SR">SR - SR Document</MenuItem>
                <MenuItem value="SRF">SRF - Subjective Refraction</MenuItem>
                <MenuItem value="STAIN">
                  STAIN - Automated Slide Stainer
                </MenuItem>
                <MenuItem value="TG">TG - Thermography</MenuItem>
                <MenuItem value="US">US - Ultrasound</MenuItem>
                <MenuItem value="VA">VA - Visual Acuity</MenuItem>
                <MenuItem value="XA">XA - X-Ray Angiography</MenuItem>
                <MenuItem value="XC">XC - External-camera Photography</MenuItem>
                {/*
            Retired Defined Terms:
              AS    Angioscopy
              CD    Color flow Doppler
              CF    Cinefluorography
              CP    Culposcopy
              CS    Cystoscopy
              DD    Duplex Doppler
              DF    Digital fluoroscopy
              DM    Digital microscopy
              DS    Digital Subtraction Angiography
              EC    Echocardiography
              FA    Fluorescein angiography
              FS    Fundoscopy
              LP    Laparoscopy
              MA    Magnetic resonance angiography
              MS    Magnetic resonance spectroscopy
              OPR   Ophthalmic Refraction
              ST    Single-photon emission computed tomography (SPECT)
              VF    Videofluorography

            */}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              sx={{ width: '100%' }}
              label={t('scheduled_aet')}
              type="text"
              placeholder={t('aet')}
              size="small"
              name="scheduledAET"
              inputRef={inputAETRef}
              onChange={(e) => {
                fireEvent((q) => {
                  q.scheduledAET = String(e.target.value);
                });
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl sx={{ width: '100%' }}>
              <InputLabel id="scheduledDateLabel">
                {t('scheduled_date')}
              </InputLabel>
              <Select
                size="small"
                labelId="scheduledDateLabel"
                label={t('scheduled_date')}
                name="scheduledDate"
                value={date}
                onChange={(e) => {
                  const range: WorklistQueryDateRange =
                    WorklistQueryDateRange[
                      e.target.value as keyof typeof WorklistQueryDateRange
                    ];
                  fireEvent((q) => {
                    q.scheduledDate = range;
                  });
                }}
              >
                <MenuItem value={undefined}>-</MenuItem>
                <MenuItem value={WorklistQueryDateRange.Yesterday}>
                  {t('yesterday')}
                </MenuItem>
                <MenuItem value={WorklistQueryDateRange.Today}>
                  {t('today')}
                </MenuItem>
                <MenuItem value={WorklistQueryDateRange.Tomorrow}>
                  {t('tomorrow')}
                </MenuItem>
                <MenuItem value={WorklistQueryDateRange.TodayAndTomorrow}>
                  {t('today_and_tomorrow')}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )}

      {!edit && !editMode && (
        <>
          <FaFilter />
          &nbsp;&nbsp;Modality: {query.scheduledModality}, AET:{' '}
          {query.scheduledAET}, Date: {query.scheduledDate}&nbsp;
          <FaEdit onClick={handleEditClick} />
        </>
      )}
    </>
  );
};

export default DicomWorklistQueryUI;
