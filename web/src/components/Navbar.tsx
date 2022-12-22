import { Button } from "antd";
import { signOut } from "../api/auth";

interface Props {
  className?: string;
}
const Navbar: React.FC<Props> = ({ className = "" }) => (
  <nav
    className={[
      className,
      "flex flex-row w-full justify-between h-16 p-2",
    ].join(" ")}
  >
    <span className="text-2xl">Counters</span>

    <Button onClick={signOut}>Sign out</Button>
  </nav>
);

export default Navbar;
