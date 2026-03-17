import { formatDistanceToNow } from "date-fns";
import { hr } from "date-fns/locale";

const formatDate = (timestamp) => {
  if (!timestamp) return "";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  let distance = formatDistanceToNow(date, { addSuffix: true, locale: hr });

  distance = distance.replace("oko ", "").replace("manje od ", "");
  distance = distance.replace(/(\d*[02-9]1|(?<!\d)1) minuta/, "$1 minutu");

  return distance;
};

export default formatDate;
