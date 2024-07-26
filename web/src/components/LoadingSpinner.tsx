import { Loop } from "@mui/icons-material";

interface Props {
  className?: string;
}
const LoadingSpinner: React.FC<Props> = ({ className = "" }) => {
  return (
    <div className={["animate-pulse w-fit", className].join(" ")}>
      <Loop className="text-sky-400 animate-[spin_0.9s_ease-in-out_infinite]" />
    </div>
  );
};
export default LoadingSpinner;
