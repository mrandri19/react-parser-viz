export function lex(input: string): Lexeme[] {
  const lexemes: Lexeme[] = []

  while (input.length > 0) {
    const digit = input.match(/^\d+/)
    if (digit && digit.length > 0) {
      input = input.slice(digit[0].length)
      lexemes.push({ type: "digit", value: Number(digit[0]) })
      continue
    }

    const op = input.match(/^(\+|\-|\*|\/)/)
    if (op && op.length > 0) {
      input = input.slice(op[0].length)
      lexemes.push({ type: "op", value: op[0] })
      continue
    }
    if (input[0] === " ") {
      input = input.slice(1)
      continue
    }
    throw new Error(`Cannot lex ${input}.`)
  }
  lexemes.push({ type: "eof" })
  return lexemes
}
