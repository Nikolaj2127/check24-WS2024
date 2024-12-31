import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Typography, TextField } from '@mui/material';
import { GridRowId } from '@mui/x-data-grid';
import { chosenPackages, fetchSolverResult } from '../components/result/fetchSolverResult';
import ResultFiltering from '../components/result/resultFiltering';
import Carousel from '../components/result/carousel';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(minMax);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);


export default function Result() {
    const location = useLocation()
    const navigate = useNavigate()
    const selectedTeams = location.state?.selectedTeams
    const selectedComps= location.state?.selectedComps
    const dates = location.state?.dates
    const [isYearly, setIsYearly] = useState(true)
    const [isLive, setIsLive] = useState(true)
    const [isHighlights, setIsHighlights] = useState(false)
    const [solverResult, setSolverResult] = useState<chosenPackages[]>([]);
    const [objectiveValue, setObjectiveValue] = useState<number>()
    const [solverResultGames, setSolverResultGames] = useState<any[]>([])
    const [loading, setLoading] = useState<'yearly' | 'monthly' | 'live' | 'highlights' | null>('yearly');
    const [monthsSpan, setMonthsSpan] = useState(0)

    console.log('selecTeams', selectedTeams)

    function handleSubscription(type: 'yearly' | 'monthly') {
      setIsYearly(type === 'yearly');
      setLoading(type);
    }

    const handleYearlyClick = () => handleSubscription('yearly');

    const handleMonthlyClick = () => handleSubscription('monthly');

    const handleLiveClick = (status: string) => {
      if(status === 'set') {
        if(!isLive) {
          setIsLive(true)
          setLoading('live')
        }
      } else if (status === 'del') {
        if(isLive) {
          setIsLive(false)
          setLoading('live')
        }
      }
    }

    const handleHighlightsClick = (status: string) => {
      if(status === 'set') {
        if(isHighlights === false) {
          setIsHighlights(true)
          setLoading('highlights')
        }
      } else if (status === 'del') {
        if(isHighlights === true) {
          setIsHighlights(false)
          setLoading('highlights')
        }
      }
    }

    useEffect(() => {
        if (selectedTeams.length > 0 || selectedComps.length > 0) {
          if (isYearly) {
            calcPackages('yearly', isLive, isHighlights)
          } else {
            calcPackages('monthly', isLive, isHighlights)
          }
        } else {
          throw new Error
        }
      }, [selectedTeams, isYearly, isLive, isHighlights]);

    async function calcPackages(subscriptionPayment: string, isLive: boolean, isHighlights: boolean) {
      const result = await fetchSolverResult(selectedTeams, selectedComps ,subscriptionPayment, isLive, isHighlights, dates)
      console.log('solResGamlen', result.solverResultGames.length)
      setSolverResult(result.chosenPackages)
      setObjectiveValue(result.objectiveValue)
      setSolverResultGames(result.solverResultGames)
      setMonthsSpan(calculateMonthsSpan(result.solverResultGames))
      setLoading(null)
    }

    function calculateMonthsSpan(games: any[]) {
      console.log('gamLens',games.length)
      if (games.length === 0) return 0;
    
      const dates = games.map(game => dayjs(game.starts_at));
      const minDate = dayjs.min(dates);
      const maxDate = dayjs.max(dates);
      
      console.log('minDate', minDate)
      console.log('maxDate', maxDate)

      if (maxDate) {
        return maxDate.diff(minDate, 'month') + 1;
      }
      return 0;
    }

  return ( 
    <Typography component="div">
      { solverResult.length > 0 || loading ? (
          <div>
            <Typography variant="h4">
              Best Package Combination:
            </Typography>
            <br/>
            <ResultFiltering 
              loading={loading} 
              isYearly={isYearly}
              handleYearlyClick={handleYearlyClick}
              handleMonthlyClick={handleMonthlyClick}
              handleLiveClick={handleLiveClick}
              handleHighlightsClick={handleHighlightsClick}
            />
            <br/>  
            <Carousel solverResult={solverResult} solverResultGames={solverResultGames} objectiveValue={objectiveValue ?? 0} loading={loading !== null} isLiveAndHighlights={isLive && isHighlights}/>
            <br/>
            {isYearly ? (
              <div>
                  The prices are monthly prices for a yearly subscription!
              </div>
            ) : null }
            <br/>
            <br/>
            <Button variant="contained" onClick={() => navigate('/calculate_best_packages')}>Back</Button>
            <br/>
          </div>
        ) : (
          <div>
            <br />
              <div> Games cannot be covered by Streaming packages </div>
            <br />
          </div>
        )
      }
        
    </Typography>
  )
}
