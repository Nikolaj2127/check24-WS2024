import React, { useState, useEffect, useRef, Suspense } from 'react';
import PackageCard from '../result/packageCard';
import { Box, Button, IconButton, List, ListItemText, Skeleton, Table, TableBody, TableContainer, TableRow, Typography } from '@mui/material';
import { chosenPackages } from '../result/fetchSolverResult';
import { Game } from '../result/showResult';
import _ from 'lodash';
import useLazyLoad from '../../hooks/useLazyLoad';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TableCell from "@mui/material/TableCell";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import './carousel.css';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

//TODO: Make Package Name sticky

const LazyAccordion = React.lazy(() => import('./LazyAccordion'));

interface CarouselProps {
  solverResult: chosenPackages[];
  loading: boolean;
  solverResultGames: Game[];
  objectiveValue: number;
}

const Carousel: React.FC<CarouselProps> = ({ solverResult, loading, solverResultGames, objectiveValue }) => {
  const [expandedCount, setExpandedCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [solverResultGroupedGames, setSolverResultGroupedGames] = useState<{ [key: string]: Game[] }>({})
  const [openAccordions, setOpenAccordions] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null);
  const isFewCards = solverResult.length <= visibleCount;
 

  const carousel = document.querySelector(".carousel-container");
    const slide = document.querySelector(".carousel-slide");

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const cardWidth = 300;
        const count = Math.floor(containerWidth / cardWidth);
        setVisibleCount(count);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerRef, solverResult]);

  const handleExpandChange = (isExpanded: boolean) => {
    setExpandedCount((prevCount) =>
      isExpanded ? prevCount + 1 : prevCount - 1
    );
  };

  function handleCarouselMove(positive = true) {
    if (slide) {
      const slideWidth = slide.clientWidth;
      if (carousel instanceof HTMLElement) {
        carousel.scrollLeft = positive ? carousel.scrollLeft + slideWidth : carousel.scrollLeft - slideWidth;
      }
    }
  }

  useEffect(() => {
    if (Object.keys(solverResultGroupedGames).length === 0 ){
        const group = (array: any) => {
        const uniqueGames = solverResultGames.filter((game, index, self) => 
        index === self.findIndex((g) => g.game_id === game.game_id)
        );
        const grouped = _.groupBy(uniqueGames, (game: any) => game.tournament_name);
        console.log(grouped)
        return grouped
      };
      setSolverResultGroupedGames(group(solverResultGames))
    }
      
  }, [solverResultGames])
  
  useEffect(() => {
    console.log('gLoad')
  }, [])

  

  return (
    <div style={{width: '90vw'}}>
        <div style={{marginLeft: 300}}>
            <IconButton onClick={() => handleCarouselMove(false)} sx={{border: 2, marginBottom: 2}}>
                <KeyboardArrowLeftRoundedIcon/>
            </IconButton>
                  <IconButton onClick={() => handleCarouselMove()}sx={{border: 2, marginBottom: 2, marginLeft: 1}}>
            <KeyboardArrowRightRoundedIcon/>
                  </IconButton>
        </div>
      <div>
          <Box sx={{display: 'flex'}}>
            
                <div style={{width: 300, marginTop: 408}}>
                {Object.keys(solverResultGroupedGames).length > 0 ? ( 
                    <div>
                        {Object.keys(solverResultGroupedGames).map((tournamentName, index) => (
                            <Accordion
                                elevation={0}
                                expanded={openAccordions.includes(tournamentName)}
                                onChange={() => {
                                    setOpenAccordions(prev =>
                                        prev.includes(tournamentName) ? prev.filter(name => name !== tournamentName) : [...prev, tournamentName]
                                    )
                                }}
                                key={index}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>{tournamentName}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List>
                                        <TableContainer>
                                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                            <TableBody>
                                                {solverResultGroupedGames[tournamentName].map((game, idx) => (
                                                <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell component="th" scope="row" sx={{width: 300, height: 130}}>
                                                    <ListItemText
                                                        primary={
                                                        <>
                                                            <Typography variant="body2" display="block">
                                                            {game.team_home}
                                                            </Typography>
                                                            <Typography variant="body2" display="block">
                                                            vs
                                                            </Typography>
                                                            <Typography variant="body2" display="block">
                                                            {game.team_away}
                                                            </Typography>
                                                        </>
                                                        }
                                                        secondary={`Starts at: ${game.starts_at}`}
                                                    />
                                                    </TableCell>
                                                </TableRow>
                                                ))}
                                            </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </div>
                    ) : (
                        <div style={{width: 300, paddingRight: 5}}>
                            <Skeleton animation="wave" sx={{height: 48}}/>
                        </div>
                    )}
                </div>
            
            <div className={`${isFewCards ? '' : 'carousel-container'}`} ref={containerRef}>
                <div style={{display: 'flex', gap: 10}}>
                    { loading ?
                        Array.from(new Array(3)).map((_, index) => (
                            <div className='carousel-slide' key={index}>
                                <PackageCard
                                    packageName=""
                                    packagePrice={0}
                                    loading={loading}
                                    solverResultGames={[]}
                                    onExpandChange={handleExpandChange}
                                />
                            </div>
                        ))
                    : solverResult.map((item, index) => (
                        <div className='carousel-slide' key={index}>
                                <PackageCard
                                key={index}
                                packageName={item.packageName}
                                packagePrice={item.packagePrice}
                                loading={loading}
                                solverResultGames={solverResultGames}
                                onExpandChange={handleExpandChange}
                                />
                        </div>
                    ))}
                </div>
                { Object.keys(solverResultGroupedGames).length > 0 ? (
                    <div style={{overflowX: 'auto', width: 310 * solverResult.length - 10, marginTop: 10, marginBottom: 2}}>
                        {Object.keys(solverResultGroupedGames).map((tournamentName, index) => (
                        <LazyAccordion key={index} tournamentName={tournamentName} games={solverResultGroupedGames[tournamentName]} solverResult={solverResult} openAccordions={openAccordions} />
                        ))}
                    </div>
                ):(
                    <div style={{ marginTop: 10, paddingLeft: 5}}>
                        <Skeleton animation="wave" sx={{height: 48}} />
                    </div>
                    
                )}
            </div>
          </Box>
      </div>
    </div>
  );
};

export default Carousel;