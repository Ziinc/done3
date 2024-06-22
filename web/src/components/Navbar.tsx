import { signOut } from "../api/auth";
import { Button, Typography } from "@mui/material";

interface Props {
  className?: string;
}
const Navbar: React.FC<Props> = ({ className = "" }) => (
  <nav
    className={[
      className,
      "flex flex-row w-full justify-between h-12 p-2",
    ].join(" ")}
  >
    <Typography variant="h5" className="text-2xl">
      Done<sup>3</sup>
    </Typography>
    <Button variant="contained" size="small" onClick={signOut}>
      Sign out
    </Button>
  </nav>
);

export default Navbar;
