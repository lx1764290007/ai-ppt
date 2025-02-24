export const useRandomLinearBackgroundStyle = (): () => Pick<CSSStyleDeclaration, "background" | "boxShadow"> => {
  const color1 = {
    background: "linear-gradient(170deg, #329F4D, #50D53E)",
    boxShadow: "0px 25px 35px 0px rgba(66,193,60,0.5)"
  };
  const color2 = {
    background: "linear-gradient(170deg, #D7331B, #FF6839)",
    boxShadow: "0px 25px 35px 0px rgba(251,99,55,0.5)"
  };
  const color3 = {
    background: "linear-gradient(170deg, #EC6B1D, #FFB21C)",
    boxShadow: "0px 25px 35px 0px rgba(237,167,56,0.5)"
  };
  const color4 = {
    background: "linear-gradient(170deg, #670440, #A4205E)",
    boxShadow: "0px 25px 35px 0px rgba(142,26,80,0.5)"
  };
  const colors = [color1, color2, color3, color4];
  return function(): { background: string, boxShadow: string } {
    const index = Math.floor(Math.random() * colors.length);
    return colors[index];
  };
};