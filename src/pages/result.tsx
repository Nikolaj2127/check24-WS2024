import * as React from 'react';
import { useState, useEffect } from 'react';
import { calcPackages_test } from '../components/calcPackages_test';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import { chosenPackages } from '../components/fetchBackendData';
import { ShowResult } from '../components/result/showResult';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { Skeleton } from '@mui/material';


export default function Result() {
    const location = useLocation()
    const navigate = useNavigate()
    const selectedPackages = location.state?.selectedTeams
    const [isYearly, setIsYearly] = useState(true)
    const [solverResult, setSolverResult] = useState<chosenPackages[]>([]);
    const [loading, setLoading] = useState<'yearly' | 'monthly' | null>('yearly');
    const [firstLoading, setFirstLoading] = useState(true)

    const handleYearlyClick = () => {
      setIsYearly(true)
      setLoading('yearly')
    };

    const handleMonthlyClick = () => {
      setIsYearly(false)
      setLoading('monthly')
    }

    useEffect(() => {
        if (selectedPackages.length > 0) {
          if (isYearly) {
            calcPackages('yearly');
          } else {
            calcPackages('monthly')
          }
        }
      }, [selectedPackages, isYearly]);

    async function calcPackages(subscriptionPayment: string) {
      const result = await calcPackages_test(selectedPackages, subscriptionPayment) as chosenPackages[]
      setSolverResult(result);
      setLoading(null)
      setFirstLoading(false);
    }

  return ( 
    <Typography component="div">
        <div>
            <Typography variant="h4">
              Best Package Combination:
            </Typography>
            <br/>
            <Stack direction="row" spacing={1}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Chip 
                label="Yearly" 
                variant="outlined" 
                onClick={handleYearlyClick} 
                disabled={loading === 'yearly' || isYearly} 
              />
              {loading === 'yearly' && (
                <CircularProgress
                  size={24}
                  sx={{
                    color: 'primary.main',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Chip 
                label="Monthly" 
                variant="outlined" 
                onClick={handleMonthlyClick} 
                disabled={loading === 'monthly' || !isYearly}
              />
              {loading === 'monthly' && (
                <CircularProgress
                  size={24}
                  sx={{
                    color: 'primary.main',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>
          </Stack>
            <br/>
            <ShowResult solverResult={solverResult} loading={loading === 'monthly' || loading === 'yearly'}/>
            <br/>
            <Button variant="contained" onClick={() => navigate('/calculate_best_packages')}>Back</Button>
        </div>
        
    </Typography>
  )
}
