import React, { FunctionComponent, useEffect, useState } from 'react';
import logger from 'electron-log';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';
import { useTranslation } from 'react-i18next';
import {
  CFindResponse,
  defaultDicomWorklist,
  DicomWorklistEntry,
  DicomWorklistNode,
} from '../../shared/shared-types';
import DicomNodeUI from './DicomNodeUI';
import DicomWorklistQueryUI from './DicomWorklistQueryUI';
import { Settings } from '../../shared/configuration-properties';
import SuccessAlert from './SuccessAlert';
import ErrorAlert from './ErrorAlert';

interface ColumnData {
  dataKey: keyof DicomWorklistEntry;
  label: string;
  width: number;
}

interface DicomWorklistProps {
  edit: boolean;
}

const columns: ColumnData[] = [
  {
    width: 200,
    label: 'ID',
    dataKey: 'patientID',
  },
  {
    width: 120,
    label: 'Name',
    dataKey: 'patientDisplayName',
  },
  {
    width: 120,
    label: 'Day\u00A0Of\u00A0Birth',
    dataKey: 'patientDayOfBirth',
  },
  {
    width: 120,
    label: 'Gender',
    dataKey: 'patientGender',
  },
  {
    width: 120,
    label: 'Study\u00A0Description',
    dataKey: 'studyDescription',
  },
  {
    width: 120,
    label: 'Scheduled\u00A0Date',
    dataKey: 'scheduledDate',
  },
  {
    width: 120,
    label: 'Scheduled\u00A0Time',
    dataKey: 'scheduledTime',
  },
  {
    width: 120,
    label: 'Accession\u00A0Number',
    dataKey: 'accessionNumber',
  },
];

const VirtuosoTableComponents: TableComponents<DicomWorklistEntry> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }}
    />
  ),
  TableHead,
  TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

function fixedHeaderContent() {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align="left"
          style={{ width: column.width }}
          sx={{
            backgroundColor: 'background.paper',
          }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );
}

function rowContent(_index: number, row: DicomWorklistEntry) {
  return (
    <>
      {columns.map((column) => (
        <TableCell key={column.dataKey} align="left">
          {row[column.dataKey]}
        </TableCell>
      ))}
    </>
  );
}

// eslint-disable-next-line react/function-component-definition
const DicomWorklistUI: FunctionComponent<DicomWorklistProps> = ({
  edit = false,
}: DicomWorklistProps) => {
  const { t } = useTranslation();
  const [node, setNode] = useState<DicomWorklistNode>(defaultDicomWorklist);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [sending, setSending] = useState(false);
  const [rows, setRows] = useState<DicomWorklistEntry[] | undefined>(undefined);

  useEffect(() => {
    window.electron.ipcRenderer
      .getSettings()
      .then((settings: Settings) => {
        setNode(settings?.dicom?.worklist);
        return settings;
      })
      .catch((ex) => {
        logger.error(ex);
      });
  }, []);

  const handleRetrieveClick = () => {
    setSending(true);
    logger.info('Send C-FIND request', node);
    setErrorText('');
    setSuccessText('');
    window.electron.ipcRenderer
      .sendDicomCFind(node)
      .then((response: CFindResponse) => {
        setRows(response.entries);
        if (response.exitCode === 0) {
          setSuccessText(response.displayText);
          setErrorText('');
        } else {
          setErrorText(response.displayText);
          setSuccessText('');
        }
        return response;
      })
      .finally(() => {
        setSending(false);
      })
      .catch((ex: Error) => {
        logger.error('C-FIND response', ex);
        setErrorText(ex.message);
        setSuccessText('');
      });
  };

  return (
    <>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ padding: 1, margin: 1 }}>
          <DicomNodeUI
            node={node}
            edit={edit}
            showDisplayName
            onChange={(data) => setNode(Object.assign(data, node))}
          />

          <DicomWorklistQueryUI
            query={node.query}
            edit={edit}
            onChange={(data) => {
              node.query = data;
              setNode(node);
            }}
          />
          <Box>
            <Button
              sx={{ marginTop: 1, margiBottom: 1 }}
              color="primary"
              variant="contained"
              onClick={handleRetrieveClick}
              disabled={sending}
            >
              {t('retrieve')}
            </Button>
          </Box>
        </Paper>

        <TableVirtuoso
          data={rows}
          components={VirtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={rowContent}
        />
      </Box>
      <Box sx={{ margin: 1 }}>
        <ErrorAlert text={errorText} />
        <SuccessAlert text={successText} />
      </Box>
      {sending && (
        <CircularProgress
          size="8rem"
          sx={{ position: 'relative', top: '-50%', left: '50%' }}
        />
      )}
    </>
  );
};

export default DicomWorklistUI;
