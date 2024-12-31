import React, { useState, useEffect } from "react";
import { Typography, Box, Button } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { GridColDef, GridRowId } from "@mui/x-data-grid";
import { useNotifications } from "@toolpad/core";
import { fetchData } from "../components/dataFetching/fetchData";
import { useNavigate } from "react-router-dom";
import "../index.css";
import { DataGridSelect } from "../components/calculateBestPackages/dataGridSelect";
import ShowSelectedItems from "../components/calculateBestPackages/showSelectedItems";
import ToggleButton from "../components/calculateBestPackages/toggleButton";
import { MyDateRangePicker } from "../components/utils/MyDateRangePicker";

export const teamColumns: GridColDef[] = [
  {
    field: "teamName",
    headerName: "Team",
    flex: 1,
    headerClassName: "header-right",
  },
];

export const compColumns: GridColDef[] = [
  {
    field: "competition",
    headerName: "Wettbewerbe",
    flex: 1,
    headerClassName: "header-right",
  },
];

export interface TeamType {
  id: number;
  gameId: number;
  teamName: string;
  compNames: string[];
}

export interface CompType {
  id: number;
  gameId: number;
  competition: string;
  teamNames: string[];
}

export interface TeamCompType {
  teams: TeamType[];
  comps: CompType[];
}

export default function CalculateBestPackagesPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const [teamRows, setTeamRows] = useState<TeamType[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamType[]>([]);
  const [compRows, setCompRows] = useState<CompType[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowId[]>([]);
  const [selectedCompRowIds, setSelectedCompRowIds] = useState<GridRowId[]>([]);
  const [filteredComps, setFilteredComps] = useState<any[]>(compRows);
  const [isFiltered, setIsFiltered] = useState(true);
  const [dates, setDates] = useState<string[]>([])

  useEffect(() => {
    // Fetch initial data for teams and competitions
    const getData = async () => {
      const [{ teams, comps }] = (await fetchData(
        "comps_teams"
      )) as TeamCompType[];
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
    };
    getData();
  }, []);

  const filterCompsBySelectedTeams = (selection: readonly GridRowId[]) => {
    // Filter competitions based on selected teams
    const selectedTeamCompNames = new Set<string>();
    teamRows.forEach((team) => {
      if (selection.includes(team.id)) {
        team.compNames.forEach((compName) =>
          selectedTeamCompNames.add(compName)
        );
      }
    });

    const newFilteredComps = compRows.filter((comp) =>
      selectedTeamCompNames.has(comp.competition)
    );
    setFilteredComps(newFilteredComps);
  };

  const filterTeamsBySelectedComps = (selection: readonly GridRowId[]) => {
    const selectedCompTeamNames = new Set<string>();
    compRows.forEach((comp) => {
      if (selection.includes(comp.id)) {
        comp.teamNames.forEach((teamName) =>
          selectedCompTeamNames.add(teamName)
        );
      }
    });

    const newFilteredTeams = teamRows.filter((team) =>
      selectedCompTeamNames.has(team.teamName)
    );
    setFilteredTeams(newFilteredTeams);
  };

  const handleTeamSelectionChange = (selectionModel: readonly GridRowId[]) => {
    setSelectedRowIds([...selectionModel]);
    selectionModel.length === 0
      ? setFilteredComps(compRows)
      : filterCompsBySelectedTeams(selectionModel);
  };

  const handleCompSelectionChange = (selectionModel: readonly GridRowId[]) => {
    setSelectedCompRowIds([...selectionModel]);
    selectionModel.length === 0
      ? setFilteredTeams(teamRows)
      : filterTeamsBySelectedComps(selectionModel);
  };

  const handleFiltersToggleClick = () => {
    setIsFiltered(!isFiltered);
  };

  const handleButtonClick = () => {
    // Navigate to the result page if any items are selected
    if (selectedRowIds.length > 0 || selectedCompRowIds.length > 0) {
      const selectedTeams = selectedRowIds
        .map((id) => teamRows.find((row) => row.id === id)?.teamName)
        .filter(Boolean) as string[];
      const selectedComps = selectedCompRowIds
        .map((id) => compRows.find((row) => row.id === id)?.competition)
        .filter(Boolean) as string[];
      navigate("/calculate_best_packages/result", {
        state: { selectedTeams, selectedComps, selectedRowIds, teamRows, dates },
      });
    } else {
      notifications.show('Please select a team or comptetition!', {
        severity: 'error',
        autoHideDuration: 3000,
      });
    }
  };

  return (
    // Render UI components and data grids
        <Typography component="div">
          <Box display="flex" justifyContent="space-between" width="100%">
            <ToggleButton isFiltered={isFiltered} handleFiltersToggleClick={handleFiltersToggleClick}/>
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
          <br />
            <Box sx={{ flexGrow: 1, p: 2 }}>
              <Grid container spacing={3}>
                <Grid>
                    <DataGridSelect isFiltered={isFiltered} filteredItems={filteredTeams} rows={teamRows} columns={teamColumns} checkboxSelection={true} handleSelectionChange={handleTeamSelectionChange} />
                </Grid>
                <Grid>
                  <DataGridSelect isFiltered={isFiltered} filteredItems={filteredComps} rows={compRows} columns={compColumns} checkboxSelection={true} handleSelectionChange={handleCompSelectionChange} />
                </Grid>
                <Grid>
                <Box>
                  <MyDateRangePicker setDates={setDates}/>
                </Box>
                  <Box sx={{display: 'flex', flexWrap: 'wrap' }}>
                    <Box>
                      <ShowSelectedItems itemIds={selectedRowIds} rows={teamRows} type={'teams'} />
                    </Box>
                    <Box>
                      <ShowSelectedItems itemIds={selectedCompRowIds} rows={compRows} type={'comps'} />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          <br />
        </Typography>
  );
}
