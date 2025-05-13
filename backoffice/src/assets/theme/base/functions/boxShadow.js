const boxShadow = (offset = [], radius = [], color, opacity, inset = false) => {
  const [x, y] = offset;
  const [blur, spread] = radius;

  return `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${rgba(color, opacity)}`;
};

export default boxShadow;
