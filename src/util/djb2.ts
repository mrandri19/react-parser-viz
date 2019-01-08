export default function(charsArg: string) {
  const chars = charsArg.split("").map(str => {
    return str.charCodeAt(0)
  })

  if (!Array.isArray(chars)) {
    throw new Error("input must be a string or an array")
  }

  return chars.reduce((prev, curr) => {
    // tslint:disable-next-line:no-bitwise
    return (prev << 5) + prev + curr
  }, 5381)
}
