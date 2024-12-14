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
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import { chosenPackages } from './fetchSolverResult';
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, List, ListItem, ListItemText, Skeleton } from '@mui/material';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

interface solverResultGames {
  tournamentName: string;
  startsAt: string;
  teamHome: string;
  teamAway: string;
}

interface Game {
  tournamentName: string;
  startsAt: string;
  teamHome: string;
  teamAway: string;
  dataPackageName: string;
}

interface PackageCardProps {
  packageName: string
  packagePrice: number
  loading: boolean
  solverResultGames: Game[]
  onExpandChange: (isExpanded: boolean) => void;
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


export default function PackageCard({ packageName, packagePrice, loading, solverResultGames, onExpandChange }: PackageCardProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  console.log(packagePrice)

  const handleExpandClick = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onExpandChange(newExpanded);
  };

  const groupedGames = solverResultGames.reduce((acc: any, game: Game) => {
    if (!acc[game.tournamentName]) {
      acc[game.tournamentName] = []
  }
    // Use a Set to track unique games
    const uniqueGames = new Set(acc[game.tournamentName].map((g: Game) => JSON.stringify(g)));
    if (!uniqueGames.has(JSON.stringify(game))) {
        acc[game.tournamentName].push(game);
  }
  return acc;
  }, {});

  const getCoverageStatus = (games: Game[]) => {
    const coveredGames = games.filter(game => game.dataPackageName === packageName);
    if (coveredGames.length === games.length) {
        return 'all';
    } else if (coveredGames.length > 0) {
        return 'partial';
    } else {
        return 'none';
    }
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
        <Typography variant="h5" sx={{ color: 'text.secondary', flexGrow: 1, height: '5.5em' }}>
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
          <Typography variant="h6">Games Covered:</Typography>
          {Object.keys(groupedGames).map((tournamentName, index) => {
            const coverageStatus = getCoverageStatus(groupedGames[tournamentName]);
            return (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Typography>{tournamentName}</Typography>
                  <Box>
                    {coverageStatus === 'all' && <CheckIcon color="success" />}
                    {coverageStatus === 'partial' && <CheckIcon color="warning" />}
                    {coverageStatus === 'none' && <CloseIcon color="error" />}
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List dense={true}>
                  {groupedGames[tournamentName].map((game: Game, idx: number) => (
                    <div>
                      <ListItem key={idx} sx={{ height: 110 }}>
                        {game.dataPackageName === packageName ? <CheckIcon color="success" /> : <CloseIcon color="error" />}
                      </ListItem>
                      {idx < groupedGames[tournamentName].length - 1 && <Divider />}
                    </div>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
            );
          })}
        </CardContent>
      </Collapse>
    </Card>
  );
}