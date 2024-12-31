export interface bc_game {
    id: number;
    team_home: string;
    team_away: string;
    starts_at: string;
    tournament_name: string;
  }

export interface bc_streaming_offer {
    game_id: number
    streaming_package_id: number
    livehighlights: string
}

export interface bc_streaming_package {
    id?: number
    streaming_package_id? : number
    name: string
    monthly_price_cents: number
    monthly_price_yearly_subscription_in_cents: number
}

export interface teams {
    id: number;
    team_home: string;
    team_away: string;
    starts_at: string;
    tournament_name: string;
}

export interface merged_data {
    game_id: number;
    team_home: string;
    team_away: string;
    starts_at: string;
    tournament_name: string;
    streaming_package_name: string;
    monthly_price_cents: number;
    monthly_price_yearly_subscription_in_cents: number;
    livehighlights: string;
}

let bc_game: bc_game[] = [];
let bc_streaming_offer: bc_streaming_offer[] = [];
let bc_streaming_package: bc_streaming_package[] = [];
let merged_data: merged_data[] = [];

export async function fetchData(filename: string) {
    
    if (bc_game.length <= 0 || bc_streaming_offer.length <= 0 || bc_streaming_package.length <= 0) {
        console.log("Fetching Data")
        try {
            const response = await fetch('http://localhost:4000/getData', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            bc_game = data.bc_game;
            bc_streaming_offer = data.bc_streaming_offer;
            bc_streaming_package = data.bc_streaming_package;
            merged_data = data.merged_data
            
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }
        
    if (filename === 'merged_data') {
        return merged_data
    } else if (filename === 'bc_game') {
        return bc_game as bc_game[]
    } else if (filename === 'bc_streaming_offer') {
        return bc_streaming_offer as bc_streaming_offer[]
    } else if (filename === 'bc_streaming_package') {
        return bc_streaming_package as bc_streaming_package[]
    } else if (filename === 'teams') {
        const gameData = bc_game as bc_game[]
        const uniqueTeams = Array.from(new Set(gameData.map(team => team.team_away && team.team_home)))
        return uniqueTeams as string[]
    } else if (filename === 'comps') {
        const gameData = bc_game as bc_game[]
        const uniqueComps = Array.from(new Set(gameData.map(comp => comp.tournament_name)))
        return uniqueComps as string[]
    } else if (filename === 'comps_teams') {
        const gameData = bc_game as any[]

        // Create a map of teams to competitions
        const teamsMap = new Map<string, { id: number, teamName: string, compNames: Set<string> }>();
        const compsMap = new Map<string, { id: number, competition: string, teamNames: Set<string> }>();

        for (const game of gameData) {
            const gameId = game.id
            const competitionName = game.tournament_name;
            const teamHomeName = game.team_home;
            const teamAwayName = game.team_away;

            if (!teamsMap.has(teamHomeName)) {
                teamsMap.set(teamHomeName, { id: gameId , teamName: teamHomeName, compNames: new Set() });
            }
            if (!teamsMap.has(teamAwayName)) {
                teamsMap.set(teamAwayName, { id: gameId, teamName: teamAwayName, compNames: new Set() });
            }
            if (!compsMap.has(competitionName)) {
                compsMap.set(competitionName, { id: gameId, competition: competitionName, teamNames: new Set() });
            }

            teamsMap.get(teamHomeName)!.compNames.add(competitionName);
            teamsMap.get(teamAwayName)!.compNames.add(competitionName);
            compsMap.get(competitionName)!.teamNames.add(teamHomeName);
            compsMap.get(competitionName)!.teamNames.add(teamAwayName);
        }

        // Convert the maps to arrays of objects
        const teams = Array.from(teamsMap.entries()).map(([teamName, { id, compNames }]) => ({
            id,
            teamName,
            compNames: Array.from(compNames),
        }));

        const comps = Array.from(compsMap.entries()).map(([competition, { id, teamNames }]) => ({
            id,
            competition,
            teamNames: Array.from(teamNames),
        }));

        return [{ teams: teams, comps: comps }];
    } else {
        throw new Error('Invalid filename')
    }
}
    