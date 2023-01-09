import { Menu, Plus, PlusSquare } from "lucide-react";

const CounterOnboardingPrompt = () => (
  <div className="flex flex-col items-center my-auto">
    <div className="relative w-20 h-20">
      <Menu
        size={64}
        strokeWidth={3}
        className="text-sky-800 absolute top-0 left-0"
      />
      <Plus
        size={32}
        strokeWidth={3}
        className="text-sky-800 absolute bottom-0 right-0"
      />
    </div>

    <div className="flex flex-col items-center">
      <span className="font-bold text-lg">Getting Started</span>
      <p>
        Create a new counter by clicking the "New counter" button or the{" "}
        <span className="kbd kbd-light kbd-sm   ">n</span> key.
      </p>
    </div>
  </div>
);

export default CounterOnboardingPrompt;
