import { ethers } from "ethers";

export function calculateMonthlyPrice(amount: string): number {
  if (typeof Number(amount) !== "number" || isNaN(Number(amount)) === true) {
    alert("You can only calculate a flowRate based on a number");
    return 0;
  } else if (typeof Number(amount) === "number") {
    if (Number(amount) === 0) {
      return 0;
    }
    const amountInWei = ethers.BigNumber.from(amount);
    const monthlyAmount = ethers.utils.formatEther(amountInWei.toString());
    const calculatedFlowRate = parseFloat(monthlyAmount) * 3600 * 24 * 30;
    return calculatedFlowRate;
  }

  return 0;
}

export function calculateSecondsFromDateToNow(date: Date) {
  const now = new Date();
  console.log(now.getTime());
  console.log(date.getTime());
  const diff = now.getTime() - date.getTime();
  return diff / 1000;
}
