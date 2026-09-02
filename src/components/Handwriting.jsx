import "@fontsource/caveat";

function Handwriting({ children, fontSize = "42px" }) {
  return (
    <span
      style={{
        fontFamily: "Caveat",
        fontSize,
      }}
    >
      {children}
    </span>
  );
}

export default Handwriting;