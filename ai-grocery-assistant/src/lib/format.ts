const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

export function money(n: number): string {
  return cad.format(n);
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

export function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}
