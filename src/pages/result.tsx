import * as React from 'react';
import { useState, useEffect } from 'react';
import { calcPackages_test } from '../components/calcPackages_test';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import PackageCard from '../components/result/packageCard';
import { chosenPackages } from '../components/fetchBackendData';

export default function Result() {
    const location = useLocation()
    const navigate = useNavigate()
    const selectedPackages = location.state?.selectedTeams
    const [solverResultsMonthly, setSolverResultsMonthly] = useState<chosenPackages[]>([]);
    const [solverResultsYearly, setSolverResultsYearly] = useState<chosenPackages[]>([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (selectedPackages.length > 0) {
          calcPackages();
        }
      }, [selectedPackages]);

    async function calcPackages() {
      const resultYearly = await calcPackages_test(selectedPackages, 'yearly') as chosenPackages[]
      const resultMonthly = await calcPackages_test(selectedPackages, 'monthly') as chosenPackages[]

      setSolverResultsYearly(resultYearly);
      setSolverResultsMonthly(resultMonthly);
      
      setLoading(false);
    }

    const totalPriceMonthly = solverResultsMonthly.reduce((sum, result) => sum + result.packagePrice, 0);
    const totalPriceYearly = solverResultsYearly.reduce((sum, result) => sum + result.packagePrice, 0);

  return ( 
    <Typography component="div">
        {loading? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress />
            </Box>
        ) : (
        <div>
            { solverResultsYearly.length > 0 && (
                <div>
                    <Typography variant="h6">Solver Results Yearly:</Typography>
                    {solverResultsYearly.length > 0 ? (
                      <div>
                        <div>
                        <Grid container spacing={2}>
                        {solverResultsYearly.map((item, index) => (
                          <Grid sx={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                            <PackageCard
                              packageId={item.packageId}
                              packageName={item.packageName}
                              packagePrice={item.packagePrice}
                            />
                          </Grid>
                        ))}
                        </Grid>
                        </div>
                      <ul>
                          {solverResultsYearly.map((resultYearly, index) => (
                              <li key={index}>
                                  Package Name: {resultYearly.packageName}, Package ID: {resultYearly.packageId}, Price: {resultYearly.packagePrice / 100 + " €"}
                              </li>
                          ))}
                      </ul>
                      <Typography variant="h6">Total Price: {totalPriceYearly / 100 + " €"}</Typography>
                    </div>
                    ) : (
                      <div>
                        <br/>
                        <div> Games cannot be covered by Streaming packages </div>
                        <br/>
                      </div>
                    )
                    }
                    <br/>
                    <Typography variant="h6">Solver Results Monthly:</Typography>
                    <div>
                      {solverResultsMonthly.length > 0 ? (
                      <div>
                        <ul>
                            {solverResultsMonthly.map((resultMonthly, index) => (
                                <li key={index}>
                                    Package Name: {resultMonthly.packageName}, Package ID: {resultMonthly.packageId}, Price: {resultMonthly.packagePrice / 100 + " €"}
                                </li>
                            ))}
                        </ul>
                        <Typography variant="h6">Total Price: {totalPriceMonthly / 100 + " €"}</Typography>
                      </div>
                      ) : (
                        <div>
                          <br/>
                          <div> Games cannot be covered by Streaming packages </div>
                          <br/>
                        </div>
                      )
                      }
                    </div>
                </div>
            )}
            <Button variant="contained" onClick={() => navigate('/calculate_best_packages')}>Back</Button>
        </div>
        )}
    </Typography>
  )
}
