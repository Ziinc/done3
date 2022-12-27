import Navbar from "../components/Navbar";

interface Props {
  children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => (
  <main className="bg-slate-200 min-h-screen flex flex-col">
    <section className="container mx-auto flex-grow flex flex-col">
      <Navbar/>

      {children}
    </section>
  </main>
);

export default MainLayout;
