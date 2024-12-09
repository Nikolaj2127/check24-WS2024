import { Accordion, AccordionDetails, AccordionSummary, Divider, List, ListItem, ListItemText, Skeleton, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PackageCard from './packageCard';
import ResultFiltering from './resultFiltering';
import { chosenPackages } from "./fetchSolverResult"
import { useEffect, useState } from "react";

interface ShowResultProps {
    solverResult: chosenPackages[];
    loading: boolean;
    solverResultGames: any[];
    objectiveValue: number
}

interface Game {
    tournamentName: string;
    startsAt: string;
    teamHome: string;
    teamAway: string;
  }

export const ShowResult: React.FC<ShowResultProps> = ({ solverResult, loading, solverResultGames, objectiveValue }) => {
    const [isExtended, setIsExtended] = useState(false)
    const [expandedCount, setExpandedCount] = useState(0);

    const handleExpandChange = (isExpanded: boolean) => {
        setExpandedCount(prevCount => isExpanded ? prevCount + 1 : prevCount - 1);
    };

    useEffect(() => {
        setIsExtended(expandedCount > 0);
    }, [expandedCount]);
    
    const groupedGames = solverResultGames.reduce((acc: any, game: Game) => {
        if (!acc[game.tournamentName]) {
            acc[game.tournamentName] = [];
        }
        // Use a Set to track unique games
        const uniqueGames = new Set(acc[game.tournamentName].map((g: Game) => JSON.stringify(g)));
        if (!uniqueGames.has(JSON.stringify(game))) {
            acc[game.tournamentName].push(game);
        }
        return acc;
      }, {});

    return (
        <Typography component='div'>
            <div style={{ display: "flex", flexDirection: "row" }}>
                {isExtended ? (
                    <div style={{width: 267, marginTop: 541, marginRight: 5}}>
                        <Typography variant="h6">Games Covered:</Typography>
                        {Object.keys(groupedGames).map((tournamentName, index) => (
                            <Accordion key={index}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>{tournamentName}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List>
                                {groupedGames[tournamentName].map((game: Game, idx: number) => (
                                    <div>
                                        <ListItem key={idx} sx={{ height: 110 }}>
                                        <ListItemText primary={
                                            <>
                                                <Typography variant="body2" display="block">
                                                    {game.teamHome}
                                                </Typography>
                                                <Typography variant="body2" display="block">
                                                    vs
                                                </Typography>
                                                <Typography variant="body2" display="block">
                                                    {game.teamAway}
                                                </Typography>
                                            </>
                                        } secondary={`Starts at: ${game.startsAt}`} />
                                        </ListItem>
                                        {idx < groupedGames[tournamentName].length - 1 && <Divider />}
                                    </div>
                                ))}
                                </List>
                            </AccordionDetails>
                            </Accordion>
                        ))}
                    </div>
                ) : (
                    <div style={{width: 300}}>

                    </div>
                )}
                <div>
                    {solverResult.length > 0 || loading ? (
                        <div>
                            <br/>
                            <Typography variant="h5">
                                {loading ? (
                                    <Skeleton sx={{ width: 200 }} />
                                ) : (
                                    `Total Price: ${(objectiveValue / 100)} €`
                                )}
                            </Typography>
                            <br/>
                            <div>
                                <Grid container spacing={2}>
                                    {loading ? (
                                        Array.from(new Array(8)).map((_, index) => (
                                            <Grid sx={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                                                <PackageCard packageName="" packagePrice={0} loading={loading} solverResultGames={solverResultGames} onExpandChange={handleExpandChange} />
                                            </Grid>
                                        ))
                                    ) : (
                                        solverResult.map((item, index) => (
                                            <Grid sx={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                                                <PackageCard
                                                    packageName={item.packageName}
                                                    packagePrice={item.packagePrice}
                                                    loading={loading}
                                                    solverResultGames={solverResultGames}
                                                    onExpandChange={handleExpandChange}
                                                />
                                            </Grid>
                                        ))
                                    )}
                                </Grid>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <br/>
                            <div> Games cannot be covered by Streaming packages </div>
                            <br/>
                        </div>
                    )}
                </div>
            </div>
        </Typography>
    );
};