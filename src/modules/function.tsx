export const numerizeValue = (value: string) => {
  return ((Number(value.replace(/\D/g, '')) / 100).toFixed(2))
}