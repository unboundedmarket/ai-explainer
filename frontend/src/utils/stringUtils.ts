export function removeLineNumbers(text: string): string {
  return text.replace(/^[0-9]+/gm, "");
}

export function formatString(instruction: string, inputStr: string): string {
  return `### Instruction:\n${instruction}\n\n### Input:\n${inputStr}\n\n### Response:\n`;
}
