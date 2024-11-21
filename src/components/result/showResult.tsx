import { Skeleton, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import PackageCard from './packageCard';
import ResultFiltering from './resultFiltering';
import { chosenPackages } from "../fetchBackendData";

interface ShowResultProps {
    solverResult: chosenPackages[];
    loading: boolean;
}

export const ShowResult: React.FC<ShowResultProps> = ({ solverResult, loading }) => {
    const totalPrice = solverResult.reduce((sum, result) => sum + result.packagePrice, 0);

    return (
        <Typography component='div'>
            <div>
                {solverResult.length > 0 || loading ? (
                    <div>
                        <br/>
                        <Typography variant="h5">
                            {loading ? (
                                <Skeleton sx={{ width: 200 }} />
                            ) : (
                                `Total Price: ${(totalPrice / 100)} €`
                            )}
                        </Typography>
                        <br/>
                        <div>
                            <Grid container spacing={2}>
                                {loading ? (
                                    Array.from(new Array(8)).map((_, index) => (
                                        <Grid sx={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                                            <PackageCard packageName="" packagePrice={0} loading={loading} />
                                        </Grid>
                                    ))
                                ) : (
                                    solverResult.map((item, index) => (
                                        <Grid sx={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                                            <PackageCard
                                                packageName={item.packageName}
                                                packagePrice={item.packagePrice}
                                                loading={loading}
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
        </Typography>
    );
};