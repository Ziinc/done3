import { signOut } from "../api/auth";
import { Button, Stack, Typography } from "@mui/material";

interface Props {
  className?: string;
  refresh: () => void;
}
const Navbar: React.FC<Props> = ({ refresh, className = "" }) => (
  <nav
    className={[
      className,
      "flex flex-row w-full justify-between h-12 p-2",
    ].join(" ")}>
    <Typography variant="h5" className="text-2xl">
      Done<sup>3</sup>
    </Typography>
    <Stack direction="row">
      <Button variant="contained" size="small" onClick={refresh}>
        Refresh
      </Button>
      <Button variant="contained" size="small" onClick={signOut}>
        Sign out
      </Button>
    </Stack>
  </nav>
);

export default Navbar;
