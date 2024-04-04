import React, { FunctionComponent, useEffect, useState } from 'react';
import { Alert, AlertTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface SuccessAlertProps {
  text: string | undefined;
}

// eslint-disable-next-line react/function-component-definition
const SuccessAlert: FunctionComponent<SuccessAlertProps> = ({
  text,
}: SuccessAlertProps) => {
  const { t } = useTranslation();
  const [successText, setSuccessText] = useState<string | undefined>('');

  useEffect(() => {
    setSuccessText(text);
  }, [text]);

  return (
    <>
      {successText === undefined ||
        (successText.length > 0 && (
          <Alert color="success" variant="filled">
            <AlertTitle>{t('success')}</AlertTitle>
            <hr />
            <p className="mb-0" style={{ whiteSpace: 'pre' }}>
              {successText}
            </p>
          </Alert>
        ))}
    </>
  );
};

export default SuccessAlert;
