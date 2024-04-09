import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Grid, TextField } from '@mui/material';
import { BsDatabase } from 'react-icons/bs';
import { FaEdit } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { DicomNode } from '../../shared/shared-types';

type DicomNodeProps = {
  node: DicomNode;
  edit: boolean;
  showDisplayName: boolean;
  onChange: (data: DicomNode) => void;
};

// eslint-disable-next-line react/function-component-definition
const DicomNodeUI: FunctionComponent<DicomNodeProps> = ({
  node,
  edit = false,
  showDisplayName = true,
  onChange,
}: DicomNodeProps) => {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState<boolean>(false);

  const inputDisplayNameRef = useRef<HTMLInputElement>(null);
  const inputHostnameRef = useRef<HTMLInputElement>(null);
  const inputPortRef = useRef<HTMLInputElement>(null);
  const inputAetRef = useRef<HTMLInputElement>(null);
  const inputMyAetRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputDisplayNameRef?.current != null) {
      inputDisplayNameRef.current.value = node.displayName ?? '';
    }

    if (inputHostnameRef?.current != null) {
      inputHostnameRef.current.value = node.hostname ?? '';
    }

    if (inputPortRef?.current != null) {
      inputPortRef.current.value =
        node.port === undefined ? '' : `${node.port}`;
    }
    if (inputAetRef?.current != null) {
      inputAetRef.current.value = node.aet ?? '';
    }

    if (inputMyAetRef?.current != null) {
      inputMyAetRef.current.value = node.localAET ?? '';
    }
  }, [node]);

  const fireEvent = (fn: (n: DicomNode) => void) => {
    const n: DicomNode = {
      displayName: inputDisplayNameRef?.current?.value,
      hostname: inputHostnameRef?.current?.value,
      port:
        inputPortRef?.current?.value === undefined
          ? undefined
          : parseInt(inputPortRef?.current?.value, 10),
      aet: inputAetRef?.current?.value,
      localAET: inputMyAetRef?.current?.value,
    };

    fn(n);

    onChange(n);
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  return (
    <>
      {(edit || editMode) && (
        <Grid container spacing={1}>
          {showDisplayName && (
            <Grid item xs={12}>
              <TextField
                sx={{ width: '100%' }}
                label={t('display_name')}
                type="text"
                placeholder={t('display_name')}
                size="small"
                inputRef={inputDisplayNameRef}
                name="displayname"
                onChange={(e) => {
                  fireEvent((n) => {
                    n.displayName = e.target.value;
                  });
                }}
              />
            </Grid>
          )}
          <Grid item xs={8}>
            <TextField
              sx={{ width: '100%' }}
              label={t('hostname')}
              type="text"
              placeholder={t('hostname_or_ip')}
              size="small"
              inputRef={inputHostnameRef}
              name="hostname"
              onChange={(e) => {
                fireEvent((n) => {
                  n.hostname = e.target.value;
                });
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              sx={{ width: '100%' }}
              label={t('port')}
              type="number"
              placeholder={t('port_number')}
              size="small"
              inputRef={inputPortRef}
              name="port"
              onChange={(e) => {
                fireEvent((n) => {
                  n.port = +e.target.value;
                });
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              sx={{ width: '100%' }}
              label={t('scp_aet')}
              type="text"
              placeholder={t('aet')}
              size="small"
              inputRef={inputAetRef}
              name="aet"
              onChange={(e) => {
                fireEvent((n) => {
                  n.aet = e.target.value;
                });
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              sx={{ width: '100%' }}
              label={t('my_aet')}
              type="text"
              placeholder={t('aet')}
              size="small"
              inputRef={inputMyAetRef}
              name="myAet"
              onChange={(e) => {
                fireEvent((n) => {
                  n.localAET = e.target.value;
                });
              }}
            />
          </Grid>
        </Grid>
      )}

      {!edit && !editMode && (
        <>
          <BsDatabase />
          &nbsp;&nbsp;
          {node.displayName} (AET: {node.aet}, Addr: {node.hostname}:{node.port}
          ) &nbsp;
          <FaEdit onClick={handleEditClick} />
        </>
      )}
    </>
  );
};

export default DicomNodeUI;
