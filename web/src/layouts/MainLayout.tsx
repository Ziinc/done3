import Navbar from "../components/Navbar";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<Props> = ({ children, className = "" }) => (
  <main className={"bg-violet-50 min-h-screen flex flex-col"}>
    <section className="container mx-auto flex-grow flex flex-col">
      <Navbar />

      {children}
    </section>
  </main>
);

export default MainLayout;
