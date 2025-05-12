const rgba = (color, opacity) => {
  if (color.startsWith("#")) {
    let hex = color.replace("#", "");
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return `rgba(${color}, ${opacity})`;
};

export default rgba;
