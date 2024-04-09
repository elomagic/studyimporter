import React, { useState } from 'react';
import { Box, Button, Link, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TableVirtuoso } from 'react-virtuoso';
import { FaCheckCircle } from 'react-icons/fa';
import { MdError } from 'react-icons/md';
import { DcmtkValidationResult, DicomTool } from '../../../shared/shared-types';
import ErrorAlert from '../../components/ErrorAlert';
import SuccessAlert from '../../components/SuccessAlert';

const emptyResult: DcmtkValidationResult = {
  dicomTools: [],
};

function rowContent(index: number, tool: DicomTool) {
  return (
    <>
      <td style={{ width: 40 }}>
        {tool.status ? (
          <FaCheckCircle style={{ color: 'green' }} />
        ) : (
          <MdError style={{ color: 'red' }} />
        )}
      </td>
      <td style={{ width: 100 }}>{tool.displayName}</td>
      <td style={{ width: 200 }}>{tool.version}</td>
    </>
  );
}

export default function SectionDicomTools() {
  const { t } = useTranslation();
  const [dcmtkVersions, setDcmtkVersions] =
    useState<DcmtkValidationResult>(emptyResult);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [toolErrorText, setToolErrorText] = useState<string | undefined>(
    undefined,
  );
  const [toolSuccessText, setToolSuccessText] = useState<string | undefined>(
    undefined,
  );

  const handleDcmtkCheck = () => {
    setIsChecking(true);
    setToolSuccessText('');
    setToolErrorText('');

    window.electron.ipcRenderer
      .checkDicomTools()
      .then((result: DcmtkValidationResult) => {
        const success =
          result.dicomTools.filter((tool) => !tool.status || false).length ===
          0;

        if (success) {
          setToolSuccessText(t('toolkit_was_found'));
        } else {
          setToolErrorText(t('please_check_your_system'));
        }
        setDcmtkVersions(result);
        return result;
      })
      .finally(() => {
        setIsChecking(false);
      })
      .catch(() => {
        setToolErrorText(t('please_check_your_system'));
        setDcmtkVersions(emptyResult);
      });
  };

  return (
    <>
      <Box>
        <Button
          sx={{ marginBottom: 1 }}
          onClick={handleDcmtkCheck}
          variant="contained"
          disabled={isChecking}
        >
          {t('check_dcmtk_version')}
        </Button>
        {'  '}
        <Link
          component="button"
          onClick={() => window.open('https://dicom.offis.de/')}>
          {t('visit_offis')}
        </Link>
      </Box>

      <ErrorAlert text={toolErrorText} />
      <SuccessAlert text={toolSuccessText} />

      <Paper sx={{ marginTop: 1, padding: 2 }}>
        <TableVirtuoso
          useWindowScroll={false}
          data={dcmtkVersions.dicomTools.sort((a, b) =>
            a.displayName.localeCompare(b.displayName),
          )}
          itemContent={rowContent}
          style={{ height: '400px' }}
        />
      </Paper>
    </>
  );
}
