import React, { useEffect, Fragment } from 'react';
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
import { Box } from '@mui/material';
import { chosenPackages } from '../result/fetchSolverResult';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { GroupedGame } from './carousel';

interface LazyAccordionProps {
  tournamentName: string;
  games: GroupedGame[];
  solverResult: chosenPackages[]
  openAccordions: string[]
  isLiveAndHighlights: boolean
}

const LazyAccordion: React.FC<LazyAccordionProps> = ({ tournamentName, games, openAccordions, solverResult, isLiveAndHighlights }) => {
  const packageNames = solverResult.map(pkg => pkg.packageName)

  const getCoverageStatus = (games: GroupedGame[], packageName: string, type?: string) => {
    if (type === 'live') {
      const coveredGames = games.filter(game => game.packages.some(pkg => pkg.name === packageName && pkg.live === 1))
      let statusLive = ''
      if (coveredGames.length === games.length) {
        statusLive = 'all'
      } else if (coveredGames.length > 0) {
        statusLive = 'partial'
      } else {
        statusLive = 'none'
      }
      return {coverageStatusLive: statusLive, countLive: coveredGames.length}
    } else if (type === 'highlights') {
      const coveredGames = games.filter(game => game.packages.some(pkg => pkg.name === packageName && pkg.highlights === 1))
      let statusHighlights = ''
      if (coveredGames.length === games.length) {
        statusHighlights = 'all'
      } else if (coveredGames.length > 0) {
        statusHighlights = 'partial'
      } else {
        statusHighlights = 'none'
      }
      return {coverageStatusHighlights: statusHighlights, countHighlights: coveredGames.length}
    } else {
    const coveredGames = games.filter(game => game.packages.some(pkg => pkg.name === packageName));
    let status = ''
    if (coveredGames.length === games.length) {
        status = 'all';
    } else if (coveredGames.length > 0) {
        status = 'partial';
    } else {
        status = 'none';
    }
    return {coverageStatus: status, count: coveredGames.length}
    }
  };
  
  return (
    <Accordion
        slotProps={{ transition: { unmountOnExit: true } }}
        expanded={openAccordions.includes(tournamentName)}
        elevation={1}
        
        sx={{boxShadow: 'none'}}
    >
      <AccordionSummary>
        {solverResult.map((pkg) => {
        const { coverageStatus, count } = getCoverageStatus(games, pkg.packageName);
        const { coverageStatusLive, countLive } = getCoverageStatus(games, pkg.packageName, 'live');
        const { coverageStatusHighlights, countHighlights } = getCoverageStatus(games, pkg.packageName, 'highlights');
        return (
          <div style={{ display: 'flex', flex: 1 }} key={pkg.packageId}>
            {isLiveAndHighlights ? (
              <Box key={`${pkg.packageId}-live-highlights`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1, height: 20 }}>
                <div style={{ width: '100%', display: 'flex' }}>
                  <Box sx={{ marginLeft: 2 }}>
                    {coverageStatusLive === 'all' && <CheckIcon color="success" />}
                    {coverageStatusLive === 'partial' && <CheckIcon color="warning" />}
                    {coverageStatusLive === 'none' && <CloseIcon color="error" />}
                  </Box>
                  <Typography variant="body2" sx={{ marginLeft: 2 }}>({countLive} / {games.length})</Typography>
                </div>
                <div style={{ width: '100%', display: 'flex' }}>
                  <Box sx={{ marginLeft: 2 }}>
                    {coverageStatusHighlights === 'all' && <CheckIcon color="success" />}
                    {coverageStatusHighlights === 'partial' && <CheckIcon color="warning" />}
                    {coverageStatusHighlights === 'none' && <CloseIcon color="error" />}
                  </Box>
                  <Typography variant="body2" sx={{ marginLeft: 2 }}>({countHighlights} / {games.length})</Typography>
                </div>
              </Box>
            ) : (
              <Box key={`${pkg.packageId}-coverage`} sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center', flex: 1, height: 20 }}>
                <Box sx={{ marginLeft: 5 }}>
                  {coverageStatus === 'all' && <CheckIcon color="success" />}
                  {coverageStatus === 'partial' && <CheckIcon color="warning" />}
                  {coverageStatus === 'none' && <CloseIcon color="error" />}
                </Box>
                <Typography variant="body2" sx={{ marginLeft: 5 }}>({count} / {games.length})</Typography>
              </Box>
            )}
          </div>
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
                        <Fragment key={pkgIdx}>
                          {isLiveAndHighlights ? (
                            <TableCell key={`${idx}-${pkgIdx}`} sx={{height: 130}}>
                              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>{game.packages.some(p => p.name.includes(pkg) && p.live === 1) ? <CheckIcon color="success" /> : <CloseIcon color="error" />}</div>
                                <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>{game.packages.some(p => p.name.includes(pkg) && p.highlights === 1) ? <CheckIcon color="success" /> : <CloseIcon color="error" />}</div>
                              </div>
                            </TableCell>
                          ) : (
                            <TableCell key={`${idx}-${pkgIdx}`} sx={{height: 130}}>
                              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                {game.packages.some(p => p.name.includes(pkg)) ? <CheckIcon color="success" /> : <CloseIcon color="error" />}
                              </div>
                            </TableCell>
                          )}
                        </Fragment>
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