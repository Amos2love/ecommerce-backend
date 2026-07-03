

export const generate6DigitToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};