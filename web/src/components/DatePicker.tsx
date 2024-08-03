import React, { useState } from "react";
import ReactDatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

// CSS Modules, react-datepicker-cssmodules.css
// import 'react-datepicker/dist/react-datepicker-cssmodules.css';

interface DatePickerProps {
  defaultValue: string;
  onChange?: (value: Date) => void;
}
const DatePicker = ({ defaultValue, onChange }: DatePickerProps) => {
  const [date, setDate] = useState<Date | null>(new Date(defaultValue));
  return (
    <ReactDatePicker
      selected={date}
      onChange={newDate => {
        setDate(newDate);
        if (onChange && newDate) {
          onChange(newDate);
        }
      }}
    />
  );
};
export default DatePicker;
