const formatClientNumber = (number) => {
  const numStr = number.toString();

  if (
    !numStr.endsWith("12") &&
    !numStr.endsWith("13") &&
    !numStr.endsWith("14") &&
    (numStr.endsWith("2") || numStr.endsWith("3") || numStr.endsWith("4"))
  ) {
    return `${number} klijentice`;
  } else {
    return `${number} klijentica`;
  }
};

export default formatClientNumber;
