import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import logger from 'electron-log';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Link,
  Paper,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import {
  defaultFhirConnectionOptions,
  FhirConnectionOptions,
  Settings,
} from '../../shared/configuration-properties';
import ErrorAlert from './ErrorAlert';

interface RowData {
  rowKey: any;
  identifier: string;
  name: string;
  gender: string;
  birthDate: string;
}

interface ColumnData {
  dataKey: keyof RowData;
  labelKey: string;
  width: number;
}

const columns: ColumnData[] = [
  {
    width: 60,
    labelKey: 'id',
    dataKey: 'rowKey',
  },
  {
    width: 180,
    labelKey: 'id',
    dataKey: 'identifier',
  },
  {
    width: 300,
    labelKey: 'name',
    dataKey: 'name',
  },
  {
    width: 160,
    labelKey: 'day_of_birth',
    dataKey: 'birthDate',
  },
  {
    width: 160,
    labelKey: 'gender',
    dataKey: 'gender',
  },
];

const VirtuosoTableComponents: TableComponents<RowData> = {
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

type PatientQueryUIProps = {
  onSelect?: (row: any | undefined) => void;
};

// eslint-disable-next-line react/function-component-definition
const PatientQueryUI: FunctionComponent<PatientQueryUIProps> = ({
  onSelect,
}) => {
  const { t } = useTranslation();
  const inputQueryRef = useRef<HTMLInputElement>(null);
  const [errorText, setErrorText] = useState<string | undefined>('');
  const [sending, setSending] = useState<boolean>(false);
  const [rows, setRows] = useState<RowData[]>([]);
  const [selectedRow, setSelectedRow] = useState<any | undefined>(undefined);
  const [connectionOptions, setConnectionOptions] =
    useState<FhirConnectionOptions>(defaultFhirConnectionOptions());

  const handleRowSelectClick = (rowData: any, selected: boolean) => {
    const d = selected ? rowData : undefined;
    setSelectedRow(d);

    if (onSelect) {
      onSelect(d);
    }
  };

  function rowContent(_index: number, row: RowData) {
    return (
      <>
        {columns.map((column, index) => (
          <TableCell key={column.dataKey} align="left">
            {index === 0 ? (
              <Checkbox
                checked={selectedRow === row.rowKey}
                onChange={(event) =>
                  handleRowSelectClick(row.rowKey, event.target.checked)
                }
              />
            ) : (
              row[column.dataKey]
            )}
          </TableCell>
        ))}
      </>
    );
  }

  function fixedHeaderContent() {
    return (
      <TableRow>
        {columns.map((column, index) => (
          <TableCell
            key={column.dataKey}
            variant="head"
            align="left"
            style={{ width: column.width }}
            sx={{
              backgroundColor: 'background.paper',
            }}
          >
            {t(index === 0 ? 'link' : column.labelKey)}
          </TableCell>
        ))}
      </TableRow>
    );
  }

  const queryModel = (query: string) => {
    setRows([]);
    setErrorText(undefined);
    setSending(true);
    window.electron.ipcRenderer
      .fetchFhirPatients(query, connectionOptions)
      .then((json) => {
        const r: RowData[] = json.entry.map(
          (entity: any): RowData => ({
            rowKey: entity.resource,
            identifier: entity.resource.identifier
              ? entity.resource.identifier[0]?.value
              : t('unknown'),
            name: entity.resource.name
              ? `${entity.resource.name[0]?.family}, ${entity.resource.name[0]?.given[0]}`
              : t('unknown'),
            gender: entity.resource.gender,
            birthDate: entity.resource.birthDate,
          }),
        );

        setRows(r);
        return r;
      })
      .finally(() => {
        setSending(false);
      })
      .catch((ex) => {
        setErrorText(ex);
      });
  };

  const handleQueryClick = () => {
    const q = inputQueryRef?.current?.value;
    if (q === undefined || q.length === 0) {
      setErrorText(t('you_must_enter_something'));
      return;
    }

    queryModel(q);
  };

  useEffect(() => {
    window.electron.ipcRenderer
      .getSettings()
      .then((settings: Settings) => {
        setConnectionOptions(settings.fhir);
        if (settings.fhir.baseURL === '' || !settings.fhir.baseURL) {
          enqueueSnackbar(t('fhir_url_is_not_configured'), {
            variant: 'warning',
            persist: true,
            preventDuplicate: true,
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
            action: (
              <Link
                href="/configuration#IsIntegration"
                sx={{ color: '#0000EE;' }}
              >
                {t('setup')}
              </Link>
            ),
          });
        }
        return settings;
      })
      .catch((ex) => {
        logger.error(ex);
      });
  }, [t]);

  return (
    <SnackbarProvider TransitionComponent={Slide}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        <Paper>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <TextField
              sx={{ flexGrow: 1, marginRight: 1 }}
              name="query"
              size="small"
              type="text"
              label={t('patient_name_or_id')}
              placeholder={t('query_patient_placeholder')}
              inputRef={inputQueryRef}
              onKeyUp={(event) => {
                if (event.key === 'Enter') {
                  handleQueryClick();
                }
              }}
            />
            <Button
              sx={{ marginTop: 1, marginBottom: 1 }}
              size="small"
              color="primary"
              variant="contained"
              onClick={handleQueryClick}
              disabled={sending}
            >
              {t('query')}
            </Button>
          </Box>
          <ErrorAlert text={errorText} />
        </Paper>
        <TableVirtuoso
          style={{ flexGrow: 1 }}
          data={rows}
          components={VirtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={rowContent}
        />
        {sending && (
          <CircularProgress
            size="8rem"
            sx={{ position: 'relative', top: '-50%', left: '50%' }}
          />
        )}
      </Box>
    </SnackbarProvider>
  );
};

export default PatientQueryUI;
