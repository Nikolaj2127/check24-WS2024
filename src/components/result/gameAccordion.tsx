import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TableCell from "@mui/material/TableCell";
import { List, ListItemText, Table, TableRow, TableBody, TableContainer, Typography, Skeleton } from "@mui/material";
import { GroupedGame } from "./carousel";

interface GameAccordionProps {
    solverResultGroupedGames: {[key: string]: GroupedGame[];}
    openAccordions: string[]
    setOpenAccordions: (openAccordions: (prev: any[]) => any[]) => void
}

const GameAccordion: React.FC<GameAccordionProps> = ({solverResultGroupedGames, openAccordions, setOpenAccordions}) => {
    return (
        <div>
            {Object.keys(solverResultGroupedGames).length > 0 ? (
                <div>
                {Object.keys(solverResultGroupedGames).map(
                    (tournamentName, index) => (
                    <Accordion
                        sx={{width: 300}}
                        elevation={0}
                        expanded={openAccordions.includes(tournamentName)}
                        onChange={() => {
                        setOpenAccordions((prev) =>
                            prev.includes(tournamentName)
                            ? prev.filter((name) => name !== tournamentName)
                            : [...prev, tournamentName]
                        );
                        }}
                        key={index}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{tournamentName}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <List>
                            <TableContainer>
                            <Table
                                aria-label="groupedGames"
                            >
                                <TableBody>
                                {solverResultGroupedGames[tournamentName].map(
                                    (game, idx) => (
                                    <TableRow
                                        key={idx}
                                        sx={{
                                        "&:last-child td, &:last-child th": {
                                            border: 0,
                                        },
                                        }}
                                    >
                                        <TableCell
                                        component="th"
                                        scope="row"
                                        sx={{ width: 300, height: 130 }}
                                        >
                                        <ListItemText
                                            primary={
                                            <>
                                                <Typography
                                                variant="body2"
                                                display="block"
                                                >
                                                {game.team_home}
                                                </Typography>
                                                <Typography
                                                variant="body2"
                                                display="block"
                                                >
                                                vs
                                                </Typography>
                                                <Typography
                                                variant="body2"
                                                display="block"
                                                >
                                                {game.team_away}
                                                </Typography>
                                            </>
                                            }
                                            secondary={`Starts at: ${game.starts_at}`}
                                        />
                                        </TableCell>
                                    </TableRow>
                                    )
                                )}
                                </TableBody>
                            </Table>
                            </TableContainer>
                        </List>
                        </AccordionDetails>
                    </Accordion>
                    )
                )}
              </div>
            ) : (
              <div style={{ width: 300, paddingRight: 5 }}>
                <Skeleton animation="wave" sx={{ height: 48 }} />
              </div>
            )}
        </div>
    );
};

export default GameAccordion;