import Navbar from "../components/Navbar";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<Props> = ({ children }) => (
  <main className={"bg-violet-50 min-h-screen flex flex-col"}>
    <section className="px-10 flex-grow flex flex-col">
      <Navbar />

      {children}
    </section>
  </main>
);

export default MainLayout;
