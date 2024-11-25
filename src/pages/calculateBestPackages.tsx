import React, { useState, useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
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
    { field: 'team', headerName: 'Team', flex: 1 }
];

const compColumns: GridColDef[] = [
    { field: 'competition', headerName: 'Wettbewerbe', flex: 1 }
]

export default function CalculateBestPackagesPage() {
    const navigate = useNavigate()
    const [teamRows, setTeamRows] = useState<{ id: number, team: string }[]>([]);
    const [compRows, setCompRows] = useState<{ id: number, competition: string}[]>([])
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowId[]>([]);
    const [selectedCompRowIds, setSelectedCompRowIds] = useState<GridRowId[]>([])
    

    useEffect(() => {
        const getData = async () => {
            const teamResult = await fetchData('teams') as string[];
            const transformedTeamRows = teamResult.map((team, index) => ({ id: index, team }));
            setTeamRows(transformedTeamRows);

            const compResult = await fetchData('comps') as string[];
            const transformedCompRows = compResult.map((competition, index) => ({ id: index, competition }));
            setCompRows(transformedCompRows);
        };
        getData();
    }, []);

    const handleSelectionChange = (rowSelectionModel: readonly GridRowId[]) => {
        setSelectedRowIds([...rowSelectionModel]);
    };

    const handleCompSelectionChange = (compRowSelectionModel: readonly GridRowId[]) => {
        setSelectedCompRowIds([...compRowSelectionModel])
    }

    const handleButtonClick = () => {
        const selectedTeams = selectedRowIds.map(id => teamRows.find(row => row.id === id)?.team).filter(Boolean) as string[];
        navigate('/calculate_best_packages/result', { state: { selectedTeams, selectedRowIds, teamRows } })
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
            <PageContainer maxWidth={'xl'} style={{backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: '15px', paddingBottom: 5}}>
                <Typography component="div">
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Box>
                            <div style={{ display: 'flex', flexDirection: 'column', marginRight: 10 }}>
                                <DataGrid
                                    sx={{width: 350, backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: '15px'}}
                                    rows={teamRows}
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
                                    onRowSelectionModelChange={(rowSelectionModel) => handleSelectionChange(rowSelectionModel)}
                                />
                            </div>
                        </Box>
                        <Box>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <DataGrid
                                    sx={{width: 350, backgroundColor: 'rgba(0, 0, 0, 0.8)', borderRadius: '15px'}}
                                    rows={compRows}
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
                                    onRowSelectionModelChange={(compRowSelectionModel) => handleCompSelectionChange(compRowSelectionModel)}
                                />
                            </div>
                        </Box>
                        <Box
                        sx={{ width: '20%', maxHeight: 600, maxWidth: 360 }}
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
                        <Box
                        sx={{ width: '20%', maxHeight: 600, maxWidth: 360 }}
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
