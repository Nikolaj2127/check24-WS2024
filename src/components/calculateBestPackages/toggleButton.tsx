import { Button } from '@mui/material';
import React from 'react';

interface ToggleButtonProps {
    isFiltered: boolean;
    handleFiltersToggleClick: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isFiltered, handleFiltersToggleClick }) => {
    return (
        <div>
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
        </div>
    );
};

export default ToggleButton;