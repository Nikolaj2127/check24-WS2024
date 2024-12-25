import { useState } from "react";
import { Button, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";

interface ResultFilteringProps {
  loading: "yearly" | "monthly" | "live" | "highlights" | null;
  isYearly: boolean;
  handleYearlyClick: () => void;
  handleMonthlyClick: () => void;
  handleLiveClick: (status: string) => void;
  handleHighlightsClick: (status: string) => void;
}

interface ChipData {
  key: number;
  value: string;
}

export default function ResultFiltering({
  loading,
  isYearly,
  handleMonthlyClick,
  handleYearlyClick,
  handleLiveClick,
  handleHighlightsClick,
}: ResultFilteringProps) {
  const filters: ChipData[] = [
    { key: 0, value: "Live" },
    { key: 1, value: "Highlights" },
  ];
  const [checked, setChecked] = useState<ChipData[]>([
    { key: 0, value: "Live" },
  ]);
  const [open, setOpen] = useState(false);
  const [chipData, setChipData] = useState<ChipData[]>([
    { key: 0, value: "Live" },
  ]);

  const handleDelete = (chipToDelete: ChipData) => () => {
    setChipData((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key)
    );
    setChecked((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key)
    );

    if (chipToDelete.key === 0) {
      handleLiveClick("del");
    } else if (chipToDelete.key === 1) {
      handleHighlightsClick("del");
    }
  };

  const handleClick = () => {
    setOpen(!open);
  };

  // TODO: Make selection also deselect filters

  const handleSetFilter = () => {
    let filterSet = false;

    if (checked.some((chip) => chip.key === 0)) {
      handleLiveClick("set");
      filterSet = true;
    }

    if (checked.some((chip) => chip.key === 1)) {
      handleHighlightsClick("set");
      filterSet = true;
    }

    if (!filterSet) {
      console.log("no filter selected");
    }
    const newChipData = checked.filter(
      (chip) => !chipData.some((existingChip) => existingChip.key === chip.key)
    );
    setChipData((prevChipData) => [...prevChipData, ...newChipData]);
  };

  const handleToggle = (filter: ChipData) => () => {
    const currentIndex = checked.findIndex((c) => c.key === filter.key);
    const newChecked = [...checked];
    if (currentIndex === -1) {
      newChecked.push(filter);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  return (
    <Typography component="div">
      <Stack direction="row" spacing={1}>
        <Typography
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            listStyle: "none",
            p: 0.5,
            m: 0,
          }}
          component="ul"
        >
          <ListItem>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <Chip
                label="Yearly"
                variant="outlined"
                onClick={handleYearlyClick}
                disabled={loading === "yearly" || isYearly}
              />
              {loading === "yearly" && (
                <CircularProgress
                  size={24}
                  sx={{
                    color: "primary.main",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: "-12px",
                    marginLeft: "-12px",
                  }}
                />
              )}
            </Box>
            <Box
              sx={{
                position: "relative",
                display: "inline-flex",
                marginLeft: 1,
              }}
            >
              <Chip
                label="Monthly"
                variant="outlined"
                onClick={handleMonthlyClick}
                disabled={loading === "monthly" || !isYearly}
              />
              {loading === "monthly" && (
                <CircularProgress
                  size={24}
                  sx={{
                    color: "primary.main",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: "-12px",
                    marginLeft: "-12px",
                  }}
                />
              )}
            </Box>
            {chipData.map((data) => {
              return (
                <Box
                  sx={{
                    position: "relative",
                    display: "inline-flex",
                    marginLeft: 1,
                  }}
                  key={data.key}
                >
                  <Chip label={data.value} onDelete={handleDelete(data)} />
                </Box>
              );
            })}
          </ListItem>
        </Typography>
      </Stack>
      <br />
      <Divider />
      <List
        dense
        sx={{ width: "100%", bgcolor: "background.paper", paddingX: 2 }}
      >
        <ListItemButton onClick={handleClick}>
          <ListItemText primary="Filter" />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List
            dense
            sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          >
            {filters.map((filter) => {
              const labelId = `checkbox-list-secondary-label-${filter.key}`;
              return (
                <ListItem
                  key={filter.key}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      onChange={handleToggle(filter)}
                      checked={checked.some((c) => c.key === filter.key)}
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  }
                  disablePadding
                >
                  <ListItemButton>
                    <ListItemText id={labelId} primary={filter.value} />
                  </ListItemButton>
                </ListItem>
              );
            })}
            <ListItem>
              <Button
                sx={{ width: 360 }}
                variant="contained"
                onClick={handleSetFilter}
              >
                Set Filter
              </Button>
            </ListItem>
          </List>
        </Collapse>
      </List>
    </Typography>
  );
}
