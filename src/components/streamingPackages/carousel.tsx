import React, { useState, useEffect, useRef, Suspense } from "react";
import PackageCard from "../result/packageCard";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Skeleton,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { chosenPackages } from "../result/fetchSolverResult";
import { Game } from "../result/showResult";
import _ from "lodash";
import useLazyLoad from "../../hooks/useLazyLoad";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TableCell from "@mui/material/TableCell";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import "./carousel.css";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";

//TODO: Make Package Name sticky

const LazyAccordion = React.lazy(() => import("./LazyAccordion"));

interface CarouselProps {
  solverResult: chosenPackages[];
  loading: boolean;
  solverResultGames: Game[];
  objectiveValue: number;
  isLiveAndHighlights: boolean;
}

export interface GroupedGame {
  game_id: number;
  highlights: number;
  live: number;
  packages: { name: string; live: number; highlights: number }[];
  tournamentName: string;
  starts_at: string;
  team_home: string;
  team_away: string;
}

const Carousel: React.FC<CarouselProps> = ({
  solverResult,
  loading,
  solverResultGames,
  objectiveValue,
  isLiveAndHighlights,
}) => {
  const [solverResultGroupedGames, setSolverResultGroupedGames] = useState<{[key: string]: GroupedGame[];}>({});
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [listItems, setListItems] = useState<chosenPackages[]>([]);
  const [filteredSolverResult, setFilteredSolverResult] = useState<chosenPackages[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const carousel = document.querySelector(".carousel-container");
  const slide = document.querySelector(".carousel-slide");

  function handleCarouselMove(positive = true) {
    if (slide) {
      const slideWidth = slide.clientWidth;
      if (carousel instanceof HTMLElement) {
        carousel.scrollLeft = positive
          ? carousel.scrollLeft + slideWidth
          : carousel.scrollLeft - slideWidth;
      }
    }
  }

  // Group Games by Competition
  useEffect(() => {
    const group = (array: any) => {
      const gameMap = new Map();
      array.forEach((game: Game) => {
        if (!gameMap.has(game.game_id)) {
          gameMap.set(game.game_id, {
            ...game,
            packages: [
              { name: game.name, live: game.live, highlights: game.highlights },
            ],
          });
        } else {
          gameMap
            .get(game.game_id)
            .packages.push({
              name: game.name,
              live: game.live,
              highlights: game.highlights,
            });
        }
      });
      let uniqueGames = Array.from(gameMap.values());
      uniqueGames = uniqueGames.map(
        ({
          name,
          streaming_package_id,
          id,
          monthly_price_cents,
          monthly_price_yearly_subscription_in_cents,
          live,
          highlights,
          ...rest
        }) => rest
      );
      const grouped = _.groupBy(
        uniqueGames,
        (game: any) => game.tournament_name
      );
      return grouped;
    };
    console.log("solResGamlen", solverResultGames.length);
    setSolverResultGroupedGames(group(solverResultGames));
  }, [solverResultGames]);

  // Initialize filteredSolverResult with solverResult
  useEffect(() => {
    setFilteredSolverResult(solverResult);
  }, [solverResult]);

  const handlePackageFilterClick = (solverResultItem: any, index: number) => {
    if (index !== -1) {
      const updatedFilteredSolverResult = filteredSolverResult.filter(
        (_, i) => i !== index
      );
      setFilteredSolverResult(updatedFilteredSolverResult);
      setListItems([...listItems, solverResultItem]);
    }
  };

  const handleListClick = (listItem: any, index: number) => {
    if (index !== -1) {
      const updatedListItems = listItems.filter((_, i) => i !== index);
      setFilteredSolverResult([...filteredSolverResult, listItem]);
      setListItems(updatedListItems);
    }
  };

  const handleAllListClick = () => {
    const updatedFilteredSolverResult = [...filteredSolverResult, ...listItems];
    setFilteredSolverResult(updatedFilteredSolverResult);
    setListItems([]);
  };

  // In carousel.tsx
  useEffect(() => {
    console.log(
      "Filtered Grouped Solver Result:",
      Object.keys(solverResultGroupedGames).length
    );
  }, [solverResultGroupedGames]);

  return (
    <div style={{ width: "90vw" }}>
      <div style={{ marginLeft: 300 }}>
        <IconButton
          onClick={() => handleCarouselMove(false)}
          sx={{ border: 2, marginBottom: 2 }}
        >
          <KeyboardArrowLeftRoundedIcon />
        </IconButton>
        <IconButton
          onClick={() => handleCarouselMove()}
          sx={{ border: 2, marginBottom: 2, marginLeft: 1 }}
        >
          <KeyboardArrowRightRoundedIcon />
        </IconButton>
      </div>
      <div>
        <Box sx={{ display: "flex" }}>
          <div style={{ width: 300 }}>
            <Button onClick={() => handleAllListClick()}>Add all Back</Button>
            <div style={{ height: 408, paddingRight: 5 }}>
              <List
                dense
                sx={{ backgroundColor: "var(--primary)", borderRadius: 1 }}
              >
                {listItems.length > 0 ? (
                  <div>
                    {listItems.map((item, index) => (
                      <ListItemButton
                        key={index}
                        onClick={() => handleListClick(item, index)}
                      >
                        <ListItemText
                          primary={item.packageName}
                          secondary={null}
                        />
                      </ListItemButton>
                    ))}
                  </div>
                ) : (
                  <ListItem>
                    <ListItemText>
                      Removed packages will appear here
                    </ListItemText>
                  </ListItem>
                )}
              </List>
            </div>
            {Object.keys(solverResultGroupedGames).length > 0 ? (
              <div>
                {Object.keys(solverResultGroupedGames).map(
                  (tournamentName, index) => (
                    <Accordion
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
                              sx={{ minWidth: 650 }}
                              aria-label="simple table"
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

          <div className={"carousel-container"} ref={containerRef}>
            <div style={{ display: "flex", gap: 10 }}>
              {loading
                ? Array.from(new Array(3)).map((_, index) => (
                    <div className="carousel-slide" key={index}>
                      <PackageCard
                        packageName=""
                        packagePrice={0}
                        loading={loading}
                        solverResultGames={[]}
                      />
                    </div>
                  ))
                : filteredSolverResult.map((item, index) => (
                    <div className="carousel-slide" key={index}>
                      <div>
                        <Button
                          onClick={() => handlePackageFilterClick(item, index)}
                          disabled={filteredSolverResult.length <= 1}
                        >
                          Remove
                        </Button>
                        <PackageCard
                          key={index}
                          packageName={item.packageName}
                          packagePrice={item.packagePrice}
                          loading={loading}
                          solverResultGames={solverResultGames}
                        />
                      </div>
                    </div>
                  ))}
            </div>
            {Object.keys(solverResultGroupedGames).length > 0 ? (
              <div
                style={{
                  overflowX: "auto",
                  width: 310 * filteredSolverResult.length - 10,
                  marginTop: 10,
                  marginBottom: 2,
                }}
              >
                {Object.keys(solverResultGroupedGames).map(
                  (tournamentName, index) => (
                    <LazyAccordion
                      isLiveAndHighlights={isLiveAndHighlights}
                      key={index}
                      tournamentName={tournamentName}
                      games={solverResultGroupedGames[tournamentName]}
                      solverResult={filteredSolverResult}
                      openAccordions={openAccordions}
                    />
                  )
                )}
              </div>
            ) : (
              <div style={{ marginTop: 10, paddingLeft: 5 }}>
                <Skeleton animation="wave" sx={{ height: 48 }} />
              </div>
            )}
          </div>
        </Box>
      </div>
    </div>
  );
};

export default Carousel;
