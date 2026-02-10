const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";

  let digits = phone.replace(/\D/g, "");

  if (digits.length < 3) return phone;

  let countryCode = "";
  let numberPart = "";

  const possibleCodes = [
    "62",
    "60",
    "65",
    "63",
    "66",
    "84",
    "1",
    "44",
    "81",
    "86",
  ];

  for (const code of possibleCodes) {
    if (digits.startsWith(code)) {
      countryCode = `+${code}`;
      numberPart = digits.slice(code.length);
      break;
    }
  }

  if (!countryCode) {
    countryCode = `+${digits.slice(0, 2)}`;
    numberPart = digits.slice(2);
  }

  let formattedNumber = "";
  let remaining = numberPart;

  if (remaining.length >= 3) {
    formattedNumber += remaining.slice(0, 3);
    remaining = remaining.slice(3);
  }

  if (remaining.length >= 3) {
    formattedNumber += " " + remaining.slice(0, 3);
    remaining = remaining.slice(3);
  }

  if (remaining.length >= 2) {
    formattedNumber += " " + remaining.slice(0, 2);
    remaining = remaining.slice(2);
  }

  if (remaining.length > 0) {
    formattedNumber += " " + remaining;
  }

  return `${countryCode} ${formattedNumber.trim()}`;
};

export default formatPhoneNumber;
