/**
 * Croatian noun agreement for "klijentica".
 *
 * The rule is decided by the last two digits: 2, 3 and 4 take the paucal
 * ("klijentice"), everything else — including the 12/13/14 exception and 1
 * itself — takes "klijentica".
 */
const formatClientNumber = (number) => {
  const n = Number(number);
  if (!Number.isFinite(n)) return "0 klijentica";

  const abs = Math.abs(Math.trunc(n));
  const lastTwo = abs % 100;
  const last = abs % 10;

  const isPaucal = last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14);
  return `${Math.trunc(n)} ${isPaucal ? "klijentice" : "klijentica"}`;
};

export default formatClientNumber;
