const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0)); // 0x1F1E6 offset untuk regional indicators
  return String.fromCodePoint(...codePoints);
};

export default getFlagEmoji;
