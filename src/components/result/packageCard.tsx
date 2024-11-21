import * as React from 'react';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { chosenPackages } from '../fetchBackendData';
import { Skeleton } from '@mui/material';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: 'rotate(0deg)',
      },
    },
    {
      props: ({ expand }) => !!expand,
      style: {
        transform: 'rotate(180deg)',
      },
    },
  ],
}));


export default function PackageCard({ packageName, packagePrice, loading }: chosenPackages): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ width: 300 }}>
      {loading ? (
        <Skeleton sx={{ height: 194 }} animation="wave" variant="rectangular" />
      ) : (
        <CardMedia
        component="img"
        height="194"
        image="/T-Magenta_newsroom.png"
        alt="Logo"
        />
      )}
      <CardContent>
        <Typography variant="h4" sx={{ color: 'text.secondary', flexGrow: 1, height: '4.5em' }}>
        {loading ? (
            <Skeleton />
        ) : (
          packageName
        )}
        </Typography>
        <Typography variant="h5" sx={{ marginTop: 'auto' }}>
        {loading ? (
          <Skeleton />
        ) : (
          packagePrice / 100 + " €"
        )}
        </Typography>
        
      </CardContent>
      <CardActions disableSpacing>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography>
            Package Description
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}