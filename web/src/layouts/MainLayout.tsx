import Navbar from "../components/Navbar";

interface Props {
  children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => (
  <main className="bg-slate-200 min-h-screen">
    <section className="container mx-auto">
      <Navbar/>

      {children}
    </section>
  </main>
);

export default MainLayout;
