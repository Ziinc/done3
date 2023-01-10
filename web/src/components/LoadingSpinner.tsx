import { Loader2 } from "lucide-react";

interface Props {
  className?: string;
}
const LoadingSpinner: React.FC<Props> = ({ className="" }) => {
  return (
    <div className={["animate-pulse w-fit", className].join(" ")}>
      <Loader2
        size={55}
        className="text-sky-400 animate-[spin_0.9s_ease-in-out_infinite]"
        strokeWidth={4}
      />
    </div>
  );
};
export default LoadingSpinner;
