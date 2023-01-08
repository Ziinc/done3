import { Transition } from "@headlessui/react";
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
      <Transition
        className="transition duration-75"
        show={showOld}
        enter=""
        enterFrom="opacity-50 translate-y-3"
        enterTo="opacity-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0 -translate-y-3"
      >
        {prev}
      </Transition>
    </span>
  );
};

export default CountDisplay;
