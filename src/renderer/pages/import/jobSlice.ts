import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
import { DicomPatientMeta, DicomStudyMeta } from '../../../shared/shared-types';

export interface JobState {
  studies: DicomStudyMeta[];
  linkPatient: DicomPatientMeta | undefined;
  selectedStudies: DicomStudyMeta[];
}

const initialState: JobState = {
  studies: [],
  linkPatient: undefined,
  selectedStudies: [],
};

const jobSlice: Slice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    reset: () => ({ ...initialState }),
    setStudies: (state, action: PayloadAction<DicomStudyMeta[]>) => {
      state.studies = action.payload;
    },
    setLinkPatient: (state, action: PayloadAction<DicomPatientMeta>) => {
      state.linkPatient = action.payload;
    },
    setSelectedStudies: (state, action: PayloadAction<DicomStudyMeta[]>) => {
      state.selectedStudies = action.payload;
    },
  },
});

export const { reset, setStudies, setLinkPatient, setSelectedStudies } =
  jobSlice.actions;

export const getStudies = (state: any): DicomStudyMeta[] => state.job.studies;
export const getLinkPatient = (state: any): DicomPatientMeta =>
  state.job.linkPatient;
export const getSelectedStudies = (state: any): DicomStudyMeta[] =>
  state.job.selectedStudies;

export default jobSlice.reducer;
