import React, { useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import useLazyLoad from '../../hooks/useLazyLoad';
import { Game } from '../result/showResult';
import { Box } from '@mui/material';
import { chosenPackages } from '../result/fetchSolverResult';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface LazyAccordionProps {
  tournamentName: string;
  games: Game[];
  solverResult: chosenPackages[]
  openAccordions: string[]
}

const LazyAccordion: React.FC<LazyAccordionProps> = ({ tournamentName, games, openAccordions, solverResult }) => {
  const [isVisible, ref] = useLazyLoad();
  const packageNames = solverResult.map(pkg => pkg.packageName)

  const getCoverageStatus = (games: Game[], packageName: string) => {
    const coveredGames = games.filter(game => game.name === packageName);
    let status = ''
    if (coveredGames.length === games.length) {
        status = 'all';
    } else if (coveredGames.length > 0) {
        status = 'partial';
    } else {
        status = 'none';
    }
    return {coverageStatus: status, count: coveredGames.length}
  };

  
  return (
    <Accordion
        slotProps={{ transition: { unmountOnExit: true } }}
        expanded={openAccordions.includes(tournamentName)}
        elevation={1}
        sx={{boxShadow: 'none'}}
    >
      <AccordionSummary>
        {packageNames.map((pkg, pkgIdx) => {
        const { coverageStatus, count } = getCoverageStatus(games, pkg);
        return (
            <Box key={pkgIdx} sx={{display: 'flex', justifyContent: 'left', alignItems: 'center', flex: 1, height: 20}}>
                <Box sx={{marginLeft: 5}}>
                    {coverageStatus === 'all' && <CheckIcon color="success" />}
                    {coverageStatus === 'partial' && <CheckIcon color="warning" />}
                    {coverageStatus === 'none' && <CloseIcon color="error" />}
                </Box>
                <Typography variant="body2" sx={{ marginLeft: 5 }}>({count} / {games.length})</Typography>
            </Box>
        )})}
      </AccordionSummary>
      <AccordionDetails>
          <List>
            <TableContainer>
              <Table>
                <TableBody>
                  {games.map((game, idx) => (
                    <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 }, flex: 1 }}>
                      {packageNames.map((pkg, pkgIdx) => (
                      <TableCell key={pkgIdx} sx={{height: 130}}>
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        {game.name === pkg ? <CheckIcon color="success" /> : <CloseIcon color="error" />}
                        </div>
                      </TableCell>
                    ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </List>
      </AccordionDetails>
    </Accordion>
  );
};

export default LazyAccordion;


/* {Object.keys(groupedGames).map((tournamentName, index) => {
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
  })} */