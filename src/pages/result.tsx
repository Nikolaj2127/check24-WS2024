import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Typography, TextField } from '@mui/material';
import { GridRowId } from '@mui/x-data-grid';
import { chosenPackages, fetchBackendData } from '../components/result/fetchBackendData';
import { ShowResult } from '../components/result/showResult';
import ResultFiltering from '../components/result/resultFiltering';
import { PageContainer } from '@toolpad/core';


export default function Result() {
    const location = useLocation()
    const navigate = useNavigate()
    const [textFieldValue, setTextFieldValue] = useState('')
    const [textFieldError, setTextFieldError] = useState(false)
    const selectedPackages = location.state?.selectedTeams
    const selectedRowIds = location.state?.selectedRosIds as GridRowId[]
    const teamRows = location.state?.teamRows as { id: number, team: string }[]
    const [isYearly, setIsYearly] = useState(true)
    const [isLive, setIsLive] = useState(true)
    const [isHighlights, setIsHighlights] = useState(false)
    const [solverResult, setSolverResult] = useState<chosenPackages[]>([]);
    const [solverResultGames, setSolverResultGames] = useState<any[]>([])
    const [loading, setLoading] = useState<'yearly' | 'monthly' | 'live' | 'highlights' | null>('yearly');

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
        if(!isHighlights) {
          setIsHighlights(true)
          setLoading('highlights')
        }
      } else if (status === 'del') {
        if(isHighlights) {
          setIsHighlights(false)
          setLoading('highlights')
        }
      }
      
    }

    useEffect(() => {
        if (selectedPackages.length > 0) {
          if (isYearly) {
            calcPackages('yearly', isLive, isHighlights)
          } else {
            calcPackages('monthly', isLive, isHighlights)
          }
        }
      }, [selectedPackages, isYearly, isLive, isHighlights]);

    async function calcPackages(subscriptionPayment: string, isLive: boolean, isHighlights: boolean) {
      const result = await fetchBackendData(selectedPackages, subscriptionPayment, isLive, isHighlights)
      setSolverResult(result.chosenPackages)
      setSolverResultGames(result.mergedData)
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
      <PageContainer maxWidth={'xl'} style={{backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: '15px', paddingBottom: 5}}>
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
        <ShowResult solverResult={solverResult} games={solverResultGames} loading={loading !== null}/>
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
      </PageContainer>
    </Typography>
  )
}
