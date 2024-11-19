import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, TextField } from '@mui/material';
import { DataGrid, GridColDef, GridRowId, GridToolbar } from '@mui/x-data-grid';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { fetchData } from '../components/fetchData';
import { useNavigate } from 'react-router-dom';

const columns: GridColDef[] = [
    { field: 'team', headerName: 'Team', width: 300 }
];

export default function CalculateBestPackagesPage() {
    const navigate = useNavigate()
    const [rows, setRows] = useState<{ id: number, team: string }[]>([]);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowId[]>([]);
    const [textFieldValue, setTextFieldValue] = useState('')
    const [textFieldError, setTextFieldError] = useState(false)

    useEffect(() => {
        const getData = async () => {
            const result = await fetchData('teams');
            const transformedRows = (result as string[]).map((team, index) => ({ id: index, team }));
            setRows(transformedRows);
        };
        getData();
    }, []);

    const handleSelectionChange = (rowSelectionModel: readonly GridRowId[]) => {
        setSelectedRowIds([...rowSelectionModel]);
    };

    const handleButtonClick = () => {
        const selectedTeams = selectedRowIds.map(id => rows.find(row => row.id === id)?.team).filter(Boolean) as string[];
        navigate('/calculate_best_packages/result', { state: { selectedTeams } })
    };

    const handleSaveTeamsButtonClick = async () => {
        if (textFieldValue.trim() === '') {
            setTextFieldError(true);
            return;
        }
        setTextFieldError(false);
        const selectedTeams = selectedRowIds.map(id => rows.find(row => row.id === id)?.team).filter(Boolean) as string[];
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
        <div>
            <Typography component="div">
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Box sx={{ width: '80%' }}>
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
                    <Box
                    sx={{ width: '20%', maxHeight: 600, maxWidth: 360, bgcolor: 'background.paper' }}
                    >
                        <Typography variant="h6" component="div" sx={{ padding: '16px' }}>
                            Selected Teams:
                        </Typography>
                        <FixedSizeList
                            height={600}
                            width={360}
                            itemSize={46}
                            itemCount={selectedRowIds.length}
                            overscanCount={5}
                        >
                            {({ index, style }) => {
                                const id = selectedRowIds[index];
                                const row = rows.find(row => row.id === id);
                                const teamName = row ? row.team : 'Unknown';
                                return(
                                    <div>
                                        <ListItem style={style} key={id} component="div" disablePadding>
                                            <ListItemButton>
                                                <ListItemText primary={teamName} />
                                            </ListItemButton>
                                        </ListItem>
                                    </div>
                                )
                            }}
                        </FixedSizeList>
                    </Box>
                </div>
                <br />
                <Button type="button" variant="contained" color="primary" onClick={handleButtonClick}>
                    Select Teams
                </Button>
                <br />
                <br />
                <h1>Set Collection Name</h1>
                <br />
                <TextField
                    label="Team Name"
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
        </div>
    );
}
