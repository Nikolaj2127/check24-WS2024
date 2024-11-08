import React, { useState, useEffect } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { DataGrid, GridColDef, GridRowId, GridToolbar } from '@mui/x-data-grid';
import { calcPackages_test } from '../components/calcPackages_test';
import { bc_streaming_package, fetchData } from '../components/fetchData';
import { fetchBackendData } from '../components/fetchBackendData';

const columns: GridColDef[] = [
    { field: 'team', headerName: 'Team', width: 300 }
];

export default function CalculateBestPackagesPage() {
    const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
    const [solverResultsMonthly, setSolverResultsMonthly] = useState<any[]>([]);
    const [solverResultsYearly, setSolverResultsYearly] = useState<any[]>([]);
    const [rows, setRows] = useState<{ id: number, team: string }[]>([]);
    const [teams, setTeams] = useState<string[]>([]);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowId[]>([]);

    const test = async (teams: string[]) => {
        try {
            const testResult = await fetch('http://localhost:4000/test', {
                mode: 'cors',
                method: 'POST',
                body: JSON.stringify({
                    teams: teams
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            // Log the raw response text
            const responseText = await testResult.text();
            console.log("Raw response text:", responseText);

            // Parse the response as JSON
            const data = JSON.parse(responseText);
            console.log("Parsed JSON data:", data);
            return data;
        } catch (error) {
            console.error("Error in test function:", error);
        }
    };

    useEffect(() => {
        const getData = async () => {
            const result = await fetchData('teams');
            const transformedRows = (result as string[]).map((team, index) => ({ id: index, team }));
            setRows(transformedRows);
        };
        getData();
    }, []);

    useEffect(() => {
        fetchData('teams').then((data) => {
            setTeams(data as string[]);
        });
    }, []);

    useEffect(() => {
        if (selectedPackages.length > 0) {
            test(selectedPackages)
            calcPackages_test(selectedPackages, 'yearly').then(resultYearly => {
                const sanitizedResults = resultYearly.map(result => ({
                    ...result,
                    price: result.price ?? 0
                }));
                setSolverResultsYearly(sanitizedResults);
            });
        }
    }, [selectedPackages]);

    const handleSelectionChange = (rowSelectionModel: readonly GridRowId[]) => {
        setSelectedRowIds([...rowSelectionModel]);
    };

    const handleButtonClick = () => {
        const selectedTeams = selectedRowIds.map(id => rows.find(row => row.id === id)?.team).filter(Boolean) as string[];
        setSelectedPackages(selectedTeams);
    };

    const totalPriceMonthly = solverResultsMonthly.reduce((sum, result) => sum + result.price, 0);
    const totalPriceYearly = solverResultsYearly.reduce((sum, result) => sum + result.price, 0);

    return (
        <div>
            <Typography component="div">
                <Box sx={{ width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 10,
                                    },
                                },
                            }}
                            pageSizeOptions={[10]}
                            checkboxSelection
                            keepNonExistentRowsSelected
                            slots={{ toolbar: GridToolbar }}
                            slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                            },
                            }}
                            onRowSelectionModelChange={(rowSelectionModel) => handleSelectionChange(rowSelectionModel)}
                        />
                    </div>
                </Box>
                <br />
                <Button type="button" variant="contained" color="primary" onClick={handleButtonClick}>
                    Select Teams
                </Button>
                <div>
                    {solverResultsYearly.length > 0 && (
                        <div>
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
                    )}
                </div>
            </Typography>
        </div>
    );
}
