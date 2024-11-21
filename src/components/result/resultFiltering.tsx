import { Typography } from "@mui/material";
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

export default function resultFiltering() {

    const handleClick = () => {
        console.info('You clicked the Chip.');
      };

    return (
    <Typography component='div'>
        <Stack direction="row" spacing={1}>
            <Chip label="Clickable" onClick={handleClick} />
            <Chip label="Clickable" variant="outlined" onClick={handleClick} />
        </Stack>
    </Typography>
    )
}