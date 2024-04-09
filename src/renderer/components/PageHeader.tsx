import { FunctionComponent, useState } from 'react';
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { FaHome } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import YesNoDialog from './YesNoDialog';

interface BreadcrumbProps {
  title: string;
  // eslint-disable-next-line react/require-default-props
  importMode?: boolean;
}

// eslint-disable-next-line react/function-component-definition
const PageHeader: FunctionComponent<BreadcrumbProps> = ({
  title,
  importMode,
}: BreadcrumbProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(false);

  const handleHomeClick = () => {
    if (importMode) {
      setOpen(true);
    } else {
      navigate('/');
    }
  };

  return (
    <Box sx={{ width: '100vw' }}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Tooltip title={t('back_to_the_main_menu')}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={handleHomeClick}
            >
              <FaHome />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" color="inherit" component="div">
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      <YesNoDialog
        title={t('confirmation')}
        text={t('cancel_import_question')}
        captionYes={t('cancel_import')}
        captionNo={t('continue_import')}
        open={open}
        onYesClick={() => navigate('/')}
        onNoClick={() => setOpen(false)}
      />
    </Box>
  );
};

export default PageHeader;
