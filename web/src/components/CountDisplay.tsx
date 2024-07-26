import { Slide, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const CountDisplay: React.FC<{ value: number }> = ({ value }) => {
  const [prev, setPrev] = useState(value);
  const [showOld, setShowOld] = useState(true);

  useEffect(() => {
    if (prev !== value) {
      // change happened, trigger transition to new value
      setShowOld(false);
      const callback = setTimeout(() => {
        setPrev(value);
        setShowOld(true);
      }, 150);
      return () => clearTimeout(callback);
    }
  }, [value]);
  return (
    <span className="w-8">
      <Slide in={showOld} direction="up" mountOnEnter unmountOnExit>
        <Typography>{prev}</Typography>
      </Slide>
    </span>
  );
};

export default CountDisplay;
