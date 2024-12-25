import * as React from 'react';
import { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateRange } from '@mui/x-date-pickers-pro/models';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';

interface DateRangePickerProps {
  setDates: (dates: any[]) => void;
}

export const MyDateRangePicker: React.FC<DateRangePickerProps> = ({ setDates }) => {
    const [value, setValue] = useState<DateRange<Dayjs>>()

    useEffect (() => {
      const [start, end] = value || [null, null];
      if (start && end) {
        setDates([start.toISOString(), end.toISOString()]);
      }
    }, [value])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateRangePicker
        value={value}
        onChange={(newValue) => setValue(newValue)}
        />
    </LocalizationProvider>
  );
}