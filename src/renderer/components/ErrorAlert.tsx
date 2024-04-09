import React, { FunctionComponent, useEffect, useState } from 'react';
import { Alert, AlertTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ErrorAlertProps {
  text: string | undefined;
}

// eslint-disable-next-line react/function-component-definition
const ErrorAlert: FunctionComponent<ErrorAlertProps> = ({
  text,
}: ErrorAlertProps) => {
  const { t } = useTranslation();
  const [alertText, setAlertText] = useState<string | undefined>('');

  useEffect(() => {
    setAlertText(text);
  }, [text]);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {alertText === undefined ||
        (alertText.length > 0 && (
          <Alert color="error" variant="filled">
            <AlertTitle>{t('failure_occurred')}</AlertTitle>
            <hr />
            <p className="mb-0" style={{ whiteSpace: 'pre' }}>
              {alertText}
            </p>
          </Alert>
        ))}
    </>
  );
};

export default ErrorAlert;
