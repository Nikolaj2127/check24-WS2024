import {
  Skeleton,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import PackageCard from "./packageCard";
import { chosenPackages } from "./fetchSolverResult";
import { useEffect, useState } from "react";

interface ShowResultProps {
  solverResult: chosenPackages[];
  loading: boolean;
  solverResultGames: Game[];
  objectiveValue: number;
}

export interface Game {
    game_id: number
  tournamentName: string;
  starts_at: string;
  team_home: string;
  team_away: string;
  dataPackageName: string;
  name?: string
}

export const ShowResult: React.FC<ShowResultProps> = ({ solverResult, loading, objectiveValue }) => {
  const [isExtended, setIsExtended] = useState(false);
  const [expandedCount, setExpandedCount] = useState(0);
  console.log("test shoResult.tsx")

  const handleExpandChange = (isExpanded: boolean) => {
    setExpandedCount((prevCount) =>
      isExpanded ? prevCount + 1 : prevCount - 1
    );
  };

  useEffect(() => {
    setIsExtended(expandedCount > 0);
  }, [expandedCount]);

  return (
    <Typography component="div">
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
        <div>
          {solverResult.length > 0 || loading ? (
            <div>
              <br/>
              <Typography variant="h5">
                {loading ? (
                  <Skeleton sx={{ width: 200 }}/>
                ) : (
                  `Total Price: ${objectiveValue / 100} €`
                )}
              </Typography>
              <br />
              <div>
                <Grid container spacing={2}>
                  {loading
                    ? Array.from(new Array(8)).map((_, index) => (
                        <Grid sx={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                          <PackageCard
                            packageName=""
                            packagePrice={0}
                            loading={loading}
                            solverResultGames={[]}
                            onExpandChange={handleExpandChange}
                          />
                        </Grid>
                      ))
                    : solverResult.map((item, index) => (
                        <Grid sx={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                          <PackageCard
                            packageName={item.packageName}
                            packagePrice={item.packagePrice}
                            loading={loading}
                            solverResultGames={[]}
                            onExpandChange={handleExpandChange}
                          />
                        </Grid>
                      ))}
                </Grid>
              </div>
            </div>
          ) : (
            <div>
              <br />
              <div> Games cannot be covered by Streaming packages </div>
              <br />
            </div>
          )}
        </div>
      </div>
    </Typography>
  );
};
