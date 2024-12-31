import { fetchData } from "./fetchData";
import { TeamCompType } from "../../pages/calculateBestPackages";

export const getData = async () => {
  const [{ teams, comps }] = (await fetchData("comps_teams")) as TeamCompType[];
  const transformedTeamRows = teams.map((team, index) => ({
    id: index,
    gameId: team.id,
    teamName: team.teamName,
    compNames: team.compNames,
  }));
  const transformedCompRows = comps.map((comp, index) => ({
    id: index,
    gameId: comp.id,
    tournamentName: comp.competition,
    teamNames: comp.teamNames,
  }));
  return { transformedTeamRows, transformedCompRows };
};