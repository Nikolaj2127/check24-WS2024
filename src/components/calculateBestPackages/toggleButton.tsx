import { Button } from '@mui/material';
import React from 'react';

interface ToggleButtonProps {
    isFiltered: boolean;
    handleFiltersToggleClick: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isFiltered, handleFiltersToggleClick }) => {
    // This button toggles between showing all options or filtered options
    return (
        <div>
            <Button
                sx={{ backgroundColor: '#284366', border: 2, borderColor: 'white', color: 'white'}}
                type="button"
                variant="contained"
                color="primary"
                onClick={handleFiltersToggleClick}
            >
                {isFiltered ? 'Show all options' : 'Show filtered options'}
            </Button>
        </div>
    );
};

export default ToggleButton;