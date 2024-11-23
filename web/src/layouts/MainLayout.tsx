import Navbar from "../components/Navbar";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<Props> = ({ children }) => (
  <main className={"bg-violet-50 min-h-screen flex flex-col overflow-y-hidden"}>
    <section className="mx-5 flex-grow flex flex-col">{children}</section>
  </main>
);

export default MainLayout;
