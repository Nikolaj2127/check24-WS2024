import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Typography, TextField } from '@mui/material';
import { GridRowId } from '@mui/x-data-grid';
import { chosenPackages, fetchSolverResult } from '../components/result/fetchSolverResult';
import { ShowResult } from '../components/result/showResult';
import ResultFiltering from '../components/result/resultFiltering';
import { PageContainer } from '@toolpad/core';
import Carousel from '../components/streamingPackages/carousel';


export default function Result() {
    const location = useLocation()
    const navigate = useNavigate()
    const [textFieldValue, setTextFieldValue] = useState('')
    const [textFieldError, setTextFieldError] = useState(false)
    const selectedTeams = location.state?.selectedTeams
    const selectedComps= location.state?.selectedComps
    const selectedRowIds = location.state?.selectedRowIds as GridRowId[]
    const teamRows = location.state?.teamRows as { id: number, team: string }[]
    const dates = location.state?.dates
    const [isYearly, setIsYearly] = useState(true)
    const [isLive, setIsLive] = useState(true)
    const [isHighlights, setIsHighlights] = useState(false)
    const [solverResult, setSolverResult] = useState<chosenPackages[]>([]);
    const [objectiveValue, setObjectiveValue] = useState<number>()
    const [solverResultGames, setSolverResultGames] = useState<any[]>([])
    const [loading, setLoading] = useState<'yearly' | 'monthly' | 'live' | 'highlights' | null>('yearly');
    const [isCarousel, setIsCarousel] = useState(true)

    const handleYearlyClick = () => {
      setIsYearly(true)
      setLoading('yearly')
    };

    const handleMonthlyClick = () => {
      setIsYearly(false)
      setLoading('monthly')
    }

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

      console.log(isHighlights)
      
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
      setSolverResult(result.chosenPackages)
      setObjectiveValue(result.objectiveValue)
      setSolverResultGames(result.solverResultGames)
      setLoading(null)
    }

    const handleSaveTeamsButtonClick = async () => {
      if (textFieldValue.trim() === '') {
          setTextFieldError(true);
          return;
      }
      setTextFieldError(false);
      const selectedTeams = selectedRowIds.map(id => teamRows.find(row => row.id === id)?.team).filter(Boolean) as string[];
      console.log("collection Name: ", textFieldValue)
      try {
          const response = await fetch('http://localhost:4000/saveTeams', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ collectionName: textFieldValue, teams: selectedTeams }),
          });
  
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
  
          const result = await response.json();
          console.log('Teams saved successfully:', result);
      } catch (error) {
          console.error('Error saving teams:', error);
      }
  }

  return ( 
    <Typography component="div">
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
        { !isCarousel ? (
          <ShowResult solverResult={solverResult} solverResultGames={solverResultGames} objectiveValue={objectiveValue ?? 0} loading={loading !== null}/>
        ) : (
          <Carousel solverResult={solverResult} solverResultGames={solverResultGames} objectiveValue={objectiveValue ?? 0} loading={loading !== null}/>
        )}
        <br/>
        {isYearly ? (
          <div>
              The prices are monthly prices for a yearly subscription!
          </div>
        ) : null }
        <br/>
        <Button variant='contained' onClick={() => setIsCarousel(!isCarousel)}>Toggle Carousel</Button>
        <br/>
        <br/>
        <Button variant="contained" onClick={() => navigate('/calculate_best_packages')}>Back</Button>
        <br/>
        <h1>Save Selection</h1>
        <TextField
            label="Collection Name"
            value={textFieldValue}
            onChange={(e) => setTextFieldValue(e.target.value)}
            error={textFieldError}
            helperText={textFieldError ? 'This field is required' : ''}
        />
        <br />
        <br />
        <Button type="button" variant="contained" color="primary" onClick={handleSaveTeamsButtonClick}>
            Save Team Selection
        </Button>
    </Typography>
  )
}
