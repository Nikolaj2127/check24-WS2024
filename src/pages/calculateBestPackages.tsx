import React, { useState, useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import { DataGrid, GridColDef, GridRowId, gridClasses } from '@mui/x-data-grid';
import { FixedSizeList } from 'react-window';
import { PageContainer } from '@toolpad/core';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { fetchData } from '../components/dataFetching/fetchData';
import { useNavigate } from 'react-router-dom';
import CustomToolbar from '../components/customToolbar';
import '../index.css'

const teamColumns: GridColDef[] = [
    { field: 'teamName', headerName: 'Team', flex: 1, headerClassName: 'header-right' }
];

const compColumns: GridColDef[] = [
    { field: 'competition', headerName: 'Wettbewerbe', flex: 1, headerClassName: 'header-right' }
]

interface TeamType {
    id: number;
    gameId: number;
    teamName: string;
    compNames: string[];
}
  
interface CompType {
    id: number;
    gameId: number;
    competition: string;
    teamNames: string[];
}

interface TeamCompType {
    teams: TeamType[];
    comps: CompType[];
}

export default function CalculateBestPackagesPage() {
    const navigate = useNavigate()
    const [teamRows, setTeamRows] = useState<TeamType[]>([]);
    const [compRows, setCompRows] = useState<CompType[]>([])
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowId[]>([]);
    const [selectedCompRowIds, setSelectedCompRowIds] = useState<GridRowId[]>([])
    const [selectedTeams, setSelectedTeams] = useState<GridRowId[]>([]);
    const [selectedComps, setSelectedComps] = useState<GridRowId[]>([]);
    const [filteredComps, setFilteredComps] = useState<any[]>(compRows);
    const [filteredTeams, setFilteredTeams] = useState<any[]>(teamRows);
    

    useEffect(() => {
        const getData = async () => {
            const [{ teams, comps }] = await fetchData('comps_teams') as TeamCompType[];
            const transformedTeamRows = teams.map((team, index) => ({
                id: index,
                gameId: team.id,
                teamName: team.teamName,
                compNames: team.compNames,
            }));
            const transformedCompRows = comps.map((comp, index) => ({
                id: index,
                gameId: comp.id,
                competition: comp.competition,
                teamNames: comp.teamNames,
            }));
            setTeamRows(transformedTeamRows);
            setFilteredTeams(transformedTeamRows);
            setCompRows(transformedCompRows);
            setFilteredComps(transformedCompRows);
            console.log(transformedTeamRows)
        };
        getData();
    }, []);

    const handleTeamSelectionChange = (selectionModel: readonly GridRowId[]) => {
        setSelectedRowIds([...selectionModel]);
    
        if (selectionModel.length === 0) {
            // No teams selected, show all competitions
            setFilteredComps(compRows);
        } else {
            // Collect all competition names from selected teams
            const selectedTeamCompNames = new Set<string>();
            teamRows.forEach((team) => {
                if (selectionModel.includes(team.id)) {
                    team.compNames.forEach((compName) => selectedTeamCompNames.add(compName));
                }
            });
    
            // Filter competitions based on collected competition names
            const newFilteredComps = compRows.filter((comp) =>
                selectedTeamCompNames.has(comp.competition)
            );
            setFilteredComps(newFilteredComps);
        }
    };

    const handleCompSelectionChange = (selectionModel: readonly GridRowId[]) => {
        setSelectedCompRowIds([...selectionModel]);
    
        if (selectionModel.length === 0) {
            // No competitions selected, show all teams
            setFilteredTeams(teamRows);
        } else {
            // Collect all team names from selected competitions
            const selectedCompTeamNames = new Set<string>();
            compRows.forEach((comp) => {
                if (selectionModel.includes(comp.id)) {
                    comp.teamNames.forEach((teamName) => selectedCompTeamNames.add(teamName));
                }
            });
    
            // Filter teams based on collected team names
            const newFilteredTeams = teamRows.filter((team) =>
                selectedCompTeamNames.has(team.teamName)
            );
            setFilteredTeams(newFilteredTeams);
        }
    };

    const handleButtonClick = () => {
        const selectedTeams = selectedRowIds.map(id => teamRows.find(row => row.id === id)?.teamName).filter(Boolean) as string[];
        const selectedComps = selectedCompRowIds.map(id => compRows.find(row => row.id === id)?.competition).filter(Boolean) as string[];
        navigate('/calculate_best_packages/result', { state: { selectedTeams, selectedComps, selectedRowIds, teamRows } })
    };

    return (
        <div style={{
            position: 'relative',
            height: '100vh',
            width: '100vw'
        }}>
            <div style={{
                position: 'absolute',
                height: '100%',
                width: '100vw',
                backgroundImage: `url('/images/allianz_arena.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: -1
            }}></div>
            <PageContainer style={{backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: '15px', paddingBottom: 5}}>
                <Typography component="div">
                    <div style={{ display: 'flex', flexDirection: 'row', height: '671.5px'}}>
                            <div style={{ marginRight: 10 }}>
                                <DataGrid
                                    sx={{
                                        width: 350,
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        borderRadius: '15px',
                                        '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
                                            backgroundColor: 'rgb(6, 55, 115)',
                                        },
                                        '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
                                            backgroundColor: 'transparent',
                                        },
                                        '& .header-right': {
                                            [`& .${gridClasses.columnSeparator}`]: {
                                                display: 'none',
                                            },
                                        },
                                    }}
                                    rows={filteredTeams}
                                    columns={teamColumns}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 10,
                                            },
                                        },
                                    }}
                                    disableColumnResize={true}
                                    pageSizeOptions={[10]}
                                    checkboxSelection
                                    keepNonExistentRowsSelected
                                    disableColumnFilter
                                    disableColumnSelector
                                    disableDensitySelector
                                    slots={{ toolbar: CustomToolbar }}
                                    onRowSelectionModelChange={handleTeamSelectionChange}
                                />
                            </div>
                            <div>
                                <DataGrid
                                    sx={{
                                        width: 350,
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        borderRadius: '15px',
                                        '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
                                            backgroundColor: 'rgb(6, 55, 115)',
                                        },
                                        '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
                                            backgroundColor: 'transparent',
                                        },
                                        '& .header-right': {
                                            [`& .${gridClasses.columnSeparator}`]: {
                                                display: 'none',
                                            },
                                        },
                                    }}
                                    rows={filteredComps}
                                    columns={compColumns}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 10,
                                            },
                                        },
                                    }}
                                    disableColumnResize={true}
                                    pageSizeOptions={[10]}
                                    checkboxSelection
                                    keepNonExistentRowsSelected
                                    slots={{ toolbar: CustomToolbar }}
                                    onRowSelectionModelChange={handleCompSelectionChange}
                                />
                            </div>
                        <Box
                        sx={{ width: '20%', maxHeight: 600, maxWidth: 350 }}
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
                                    const row = teamRows.find(row => row.id === id);
                                    const teamName = row ? row.teamName : 'Unknown';
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
                        <Box
                        sx={{ width: '20%', maxHeight: 600, maxWidth: 350 }}
                        >
                            <Typography variant="h6" component="div" sx={{ padding: '16px' }}>
                                Selected Competitions:
                            </Typography>
                            <FixedSizeList
                                height={600}
                                width={360}
                                itemSize={46}
                                itemCount={selectedCompRowIds.length}
                                overscanCount={5}
                            >
                                {({ index, style }) => {
                                    const id = selectedCompRowIds[index];
                                    const row = compRows.find(row => row.id === id);
                                    const compName = row ? row.competition : 'Unknown';
                                    return(
                                        <div>
                                            <ListItem style={style} key={id} component="div" disablePadding>
                                                <ListItemButton>
                                                    <ListItemText primary={compName} />
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
                    <br/>
                </Typography>
            </PageContainer>
        </div>
    );
}
