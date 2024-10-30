import * as React from 'react';
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { FormControl, FormGroup, FormControlLabel, Checkbox, Button } from '@mui/material';
import { calcPackages_test } from '../components/calcPackages_test';

interface SolverResult {
    packageName: string;
    packageId: string;
    price: number;
}

export default function CalculateBestPackagesPage() {
    const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
    const [solverResultsMonthly, setSolverResultsMonthly] = useState<SolverResult[]>([]);
    const [solverResultsYearly, setSolverResultsYearly] = useState<SolverResult[]>([]);

    useEffect(() => {
        if (selectedPackages.length > 0) {
            calcPackages_test(selectedPackages, 'monthly').then(resultMonthly => {
                const sanitizedResults = resultMonthly.map(result => ({
                    ...result,
                    price: result.price ?? 0 // Default to 0 if price is undefined
                }));
                setSolverResultsMonthly(sanitizedResults); 
            });
            calcPackages_test(selectedPackages, 'yearly').then(resultYearly => {
                const sanitizedResults = resultYearly.map(result => ({
                    ...result,
                    price: result.price ?? 0 // Default to 0 if price is undefined
                }));
                setSolverResultsYearly(sanitizedResults); 
            });
        }
    }, [selectedPackages]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const selectedTeams = [];
        if (formData.get('bayern')) selectedTeams.push('Bayern München');
        if (formData.get('barcelona')) selectedTeams.push('FC Barcelona');
        setSelectedPackages(selectedTeams);

        const resultMonthly = calcPackages_test(selectedPackages, 'monthly')
        console.log(resultMonthly)
        const resultYearly = calcPackages_test(selectedPackages, 'yearly')
        console.log(resultYearly)
    };

    const totalPriceMonthly = solverResultsMonthly.reduce((sum, resultYearly) => sum + resultYearly.price, 0);
    const totalPriceYearly = solverResultsYearly.reduce((sum, resultMonthly) => sum + resultMonthly.price, 0);

    return (
        <div>
            <Typography component="div">
                <form onSubmit={handleSubmit}>
                    <FormControl component="fieldset">
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox name="bayern" />}
                                label="Bayern München"
                            />
                            <FormControlLabel
                                control={<Checkbox name="barcelona" />}
                                label="FC Barcelona"
                            />
                        </FormGroup>
                        <Button type="submit" variant="contained" color="primary">
                            Submit
                        </Button>
                    </FormControl>
                </form>
                <div>
                {solverResultsYearly.length > 0 && (
                    <div>
                        <div>
                            <br/>
                            <Typography variant="h6">Solver Results Monthly:</Typography>
                            <ul>
                                {solverResultsMonthly.map((resultMonthly, index) => (
                                    <li key={index}>
                                        Package Name: {resultMonthly.packageName}, Package ID: {resultMonthly.packageId}, Price: {resultMonthly.price / 100 + " €"}
                                    </li>
                                ))}
                            </ul>
                            <Typography variant="h6">Total Price: {totalPriceMonthly / 100 + " €"}</Typography>
                        </div>
                        <div>
                            <br/>
                            <Typography variant="h6">Solver Results Yearly:</Typography>
                            <ul>
                                {solverResultsYearly.map((resultYearly, index) => (
                                    <li key={index}>
                                        Package Name: {resultYearly.packageName}, Package ID: {resultYearly.packageId}, Price: {resultYearly.price / 100 + " €"}
                                    </li>
                                ))}
                            </ul>
                            <Typography variant="h6">Total Price: {totalPriceYearly / 100 + " €"}</Typography>
                        </div>
                    </div>
                )}
                </div>
            </Typography>
        </div>
    );
}