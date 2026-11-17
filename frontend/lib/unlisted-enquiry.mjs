/** Build the existing leads API payload for an indicative share enquiry. */
export function buildUnlistedEnquiry({
  name,
  email,
  phone,
  company,
  units,
  intent,
  hasQuote,
  total,
}) {
  return {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    interest:
      intent === "sell"
        ? "Unlisted shares - Sell enquiry"
        : "Unlisted shares - Buy enquiry",
    budget:
      intent === "sell" || !hasQuote
        ? "Quote requested"
        : `INR ${total.toFixed(2)} indicative`,
    message: `${intent === "sell" ? "Sell" : "Buy"} enquiry: ${company}, ${units} units. ${intent === "sell" || !hasQuote ? "Executable price and charges to be confirmed." : "Indicative value only; availability, charges and settlement require desk confirmation."}`,
  };
}
