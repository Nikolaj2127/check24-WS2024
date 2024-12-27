import { useEffect, useState } from "react";
import { DataGridSelect } from "../components/calculateBestPackages/dataGridSelect";
import { compColumns, CompType, TeamCompType, TeamType } from "./calculateBestPackages";
import { GridRowId } from "@mui/x-data-grid";
import { fetchData } from "../components/dataFetching/fetchData";
import Grid from '@mui/material/Grid2';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@toolpad/core";

export default function Tournament() {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const [compRows, setCompRows] = useState<CompType[]>([]);
    const [teamRows, setTeamRows] = useState<TeamType[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<TeamType[]>([]);
    const [selectedTeamsCheckbox, setSelectedTeamsCheckbox] = useState<TeamType[]>([]);
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowId[]>([]);
    const [selectedCompRowIds, setSelectedCompRowIds] = useState<GridRowId[]>([]);
    const [dates, setDates] = useState<string[]>([])
    
    useEffect(() => {
        const getData = async () => {
          const [{ teams, comps }] = await fetchData( "comps_teams" ) as TeamCompType[];
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
          setCompRows(transformedCompRows);
        };
        getData();
      }, []);

      const handleCompSelectionChange = (selectionModel: readonly GridRowId[]) => {
        setSelectedCompRowIds([...selectionModel]);

          if (selectionModel.length === 0) {
            // No competitions selected, show all teams
            setFilteredTeams([]);
          } else {
            // Collect all team names from selected competitions
            const selectedCompTeamNames = new Set<string>();
            compRows.forEach((comp) => {
              if (selectionModel.includes(comp.id)) {
                comp.teamNames.forEach((teamName) =>
                  selectedCompTeamNames.add(teamName)
                );
              }
            });
      
            // Filter teams based on collected team names
            const newFilteredTeams = teamRows.filter((team) =>
              selectedCompTeamNames.has(team.teamName)
            );
            setFilteredTeams(newFilteredTeams);
          }
        };

        const handleCheckboxChange = (team: TeamType) => {
            setSelectedTeamsCheckbox((prevSelectedTeamsCheckbox) => {
                if (prevSelectedTeamsCheckbox.includes(team)) {
                    return prevSelectedTeamsCheckbox.filter((t) => t.id !== team.id);
                } else {
                    return [...prevSelectedTeamsCheckbox, team];
                }
            });
            console.log(selectedTeamsCheckbox)
        };

        const handleButtonClick = () => {
            if (selectedCompRowIds.length > 0) {
                const selectedTeams = selectedTeamsCheckbox.map((team) => team.teamName);
                const selectedComps = selectedCompRowIds
                .map((id) => compRows.find((row) => row.id === id)?.competition)
                .filter(Boolean) as string[];
                console.log('slecTeamsss:', selectedTeams)
                console.log('selecCommmps:', selectedComps)
                navigate("/calculate_best_packages/result", {
                    state: { selectedTeams, selectedComps, dates },
                });
            } else {
              notifications.show('Please select a team or comptetition!', {
                severity: 'error',
                autoHideDuration: 3000,
              });
            }
          };

    return (
        <div>
            <Box display="flex" justifyContent="left" width="100%">
                <Button
                sx={{ backgroundColor: '#284366', border: 2, borderColor: 'white', color: 'white', mr: 1}}
                type="button"
                variant="contained"
                color="primary"
                onClick={handleButtonClick}
                >
                Select Teams
                </Button>
            </Box>
            <Typography>
                Select a competition you want to see and then your favourite teams
            </Typography>
            <div style={{display: "flex", marginTop: 10}}>
                <DataGridSelect isFiltered={false} filteredItems={[]} rows={compRows} columns={compColumns} checkboxSelection={false} handleSelectionChange={handleCompSelectionChange}/>
                <div style={{marginLeft: 20, marginTop: 20}}>
                    <Grid container spacing={2}>
                        {filteredTeams.map((team) => (
                            <Grid sx={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={team.id}>
                                <Box sx={{backgroundColor: 'var(--primary)', borderRadius: 1, width: 250, height: 50, display: 'flex', justifyContent: 'left', alignItems: 'center', paddingLeft: 2}}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectedTeamsCheckbox.includes(team)}
                                            onChange={() => handleCheckboxChange(team)}
                                        />
                                    }
                                    label={team.teamName}
                                />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </div>
            </div>
        </div>
    )
}