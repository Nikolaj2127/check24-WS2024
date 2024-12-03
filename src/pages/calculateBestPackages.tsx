import React, { useState, useEffect } from "react";
import { Typography, Box, Button, TextField } from "@mui/material";
import { DataGrid, GridColDef, GridRowId, gridClasses } from "@mui/x-data-grid";
import { FixedSizeList } from "react-window";
import { PageContainer, useNotifications } from "@toolpad/core";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { fetchData } from "../components/dataFetching/fetchData";
import { useNavigate } from "react-router-dom";
import CustomToolbar from "../components/customToolbar";
import "../index.css";
import { DataGridSelect } from "../components/calculateBestPackages/dataGridSelect";
import ShowSelectedItems from "../components/calculateBestPackages/showSelectedItems";
import { error } from "console";

const teamColumns: GridColDef[] = [
  {
    field: "teamName",
    headerName: "Team",
    flex: 1,
    headerClassName: "header-right",
  },
];

const compColumns: GridColDef[] = [
  {
    field: "competition",
    headerName: "Wettbewerbe",
    flex: 1,
    headerClassName: "header-right",
  },
];

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
  const navigate = useNavigate();
  const notifications = useNotifications();
  const [teamRows, setTeamRows] = useState<TeamType[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamType[]>([]);
  const [compRows, setCompRows] = useState<CompType[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowId[]>([]);
  const [selectedCompRowIds, setSelectedCompRowIds] = useState<GridRowId[]>([]);
  const [filteredComps, setFilteredComps] = useState<any[]>(compRows);
  const [isFiltered, setIsFiltered] = useState(true);

  useEffect(() => {
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
          team.compNames.forEach((compName) =>
            selectedTeamCompNames.add(compName)
          );
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

  const handleFiltersToggleClick = () => {
    setIsFiltered(!isFiltered);
  };

  const handleButtonClick = () => {
    if (selectedRowIds.length > 0 || selectedCompRowIds.length > 0) {
      const selectedTeams = selectedRowIds
        .map((id) => teamRows.find((row) => row.id === id)?.teamName)
        .filter(Boolean) as string[];
      const selectedComps = selectedCompRowIds
        .map((id) => compRows.find((row) => row.id === id)?.competition)
        .filter(Boolean) as string[];
      navigate("/calculate_best_packages/result", {
        state: { selectedTeams, selectedComps, selectedRowIds, teamRows },
      });
    } else {
      notifications.show('Please select a team or comptetition!', {
        severity: 'error',
        autoHideDuration: 3000,
      });
    }
  };

  return (
        <Typography component="div">
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ marginRight: 20 }}>
                <DataGridSelect isFiltered={isFiltered} filteredItems={filteredTeams} rows={teamRows} columns={teamColumns} handleSelectionChange={handleTeamSelectionChange} />
            </div>
            <DataGridSelect isFiltered={isFiltered} filteredItems={filteredComps} rows={compRows} columns={compColumns} handleSelectionChange={handleCompSelectionChange} />
            <Box sx={{ width: "20%", maxHeight: 600, maxWidth: 350 }}>
              <Typography variant="h6" component="div" sx={{ padding: "16px" }}>
                Selected Teams:
              </Typography>
              <ShowSelectedItems itemIds={selectedRowIds} rows={teamRows} type={'teams'} />
            </Box>
            <Box sx={{ width: "20%", maxHeight: 600, maxWidth: 350 }}>
              <Typography variant="h6" component="div" sx={{ padding: "16px" }}>
                Selected Competitions:
              </Typography>
              <ShowSelectedItems itemIds={selectedCompRowIds} rows={compRows} type={'comps'} />
            </Box>
          </div>
          <br />
          <Box display="flex" justifyContent="space-between" width="100%">
            {isFiltered ? (
              <Button
                sx={{ backgroundColor: '#284366', border: 2, borderColor: 'white', color: 'white'}}
                type="button"
                variant="contained"
                color="primary"
                onClick={handleFiltersToggleClick}
              >
                Show all options
              </Button>
            ) : (
              <Button
                sx={{ backgroundColor: '#284366', border: 2, borderColor: 'white', color: 'white'}}
                type="button"
                variant="contained"
                color="primary"
                onClick={handleFiltersToggleClick}
              >
                Show filtered options
              </Button>
            )}
            <Button
              sx={{ backgroundColor: '#284366', border: 2, borderColor: 'white', color: 'white'}}
              type="button"
              variant="contained"
              color="primary"
              onClick={handleButtonClick}
            >
              Select Teams
            </Button>
          </Box>
          <br />
        </Typography>
  );
}
