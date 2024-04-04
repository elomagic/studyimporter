import { Box, Divider, Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import { useTranslation } from 'react-i18next';
import background from '../../../../assets/background.png';
import licenses from '../../../../assets/license-report.json';
import PageHeader from '../../components/PageHeader';

interface License {
  name: string;
  installedVersion: string;
  licenseType: string;
}

function rowContent(index: number, license: License) {
  return (
    <>
      <td style={{ width: 300 }}>{license.name}</td>
      <td style={{ width: 100 }}>{license.installedVersion}</td>
      <td style={{ width: 120 }}>{license.licenseType}</td>
    </>
  );
}

export default function MainPage() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="column"
        spacing={4}
        justifyContent="center"
        sx={{ flexGrow: 1 }}
      >
        <PageHeader title={t('about')} />
        <Typography
          variant="h1"
          textAlign="center"
          sx={{ textShadow: '2px 2px 4px black' }}
        >
          {t('study_importer')}
        </Typography>
        <Paper
          square={false}
          sx={{
            width: '600px',
            opacity: '0.7',
            margin: '20px auto !important',
            padding: 2,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack
            direction="column"
            spacing={2}
            justifyContent="center"
            sx={{ flexGrow: 1 }}
          >
            <Typography
              textAlign="center"
              sx={{ textShadow: '2px 2px 4px black' }}
            >
              {t('developed_by')}
            </Typography>
            <Divider />
            <Typography
              textAlign="center"
              sx={{ textShadow: '2px 2px 4px black' }}
            >
              {t('powered_by_oss')}
            </Typography>

            <TableVirtuoso
              useWindowScroll={false}
              data={licenses.sort((a, b) => a.name.localeCompare(b.name))}
              itemContent={rowContent}
              style={{ flexGrow: 1 }}
            />
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
