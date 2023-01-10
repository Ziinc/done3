interface Props {
  children: React.ReactNode;
  className?: string;
}
const CenteredLayout: React.FC<Props> = ({ children, className = "" }) => (
  <>
    <main
      className={[
        "h-screen w-screen flex flex-col justfiy-center",
        className,
      ].join(" ")}
    >
      <section className="mx-auto my-auto">{children}</section>
    </main>
  </>
);

export default CenteredLayout;
