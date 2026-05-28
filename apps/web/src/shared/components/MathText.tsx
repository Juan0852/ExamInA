import katex from "katex";
import "katex/dist/katex.min.css";

type MathTextProps = {
  value: string;
  className?: string;
};

type Token =
  | { type: "text"; value: string }
  | { type: "math"; value: string; displayMode: boolean };

const delimiters = [
  { open: "$$", close: "$$", displayMode: true },
  { open: "\\[", close: "\\]", displayMode: true },
  { open: "\\(", close: "\\)", displayMode: false },
  { open: "$", close: "$", displayMode: false }
];

const hasMathDelimiters = (value: string) =>
  delimiters.some((delimiter) => value.includes(delimiter.open));

const normalizeLimitTarget = (target: string) =>
  target.trim().replace(/infinito/gi, "\\infty").replace(/infinity/gi, "\\infty");

const stripWrappingParentheses = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed.startsWith("(") || !trimmed.endsWith(")")) {
    return trimmed;
  }

  let depth = 0;
  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed[index];
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (depth === 0 && index < trimmed.length - 1) {
      return trimmed;
    }
  }

  return trimmed.slice(1, -1).trim();
};

const findTopLevelDivision = (value: string) => {
  let depth = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "/" && depth === 0) {
      return index;
    }
  }
  return -1;
};

const legacyExpressionToLatex = (value: string): string => {
  const trimmed = stripWrappingParentheses(value);
  const divisionIndex = findTopLevelDivision(trimmed);

  if (divisionIndex !== -1) {
    const numerator = legacyExpressionToLatex(trimmed.slice(0, divisionIndex));
    const denominator = legacyExpressionToLatex(trimmed.slice(divisionIndex + 1));
    return `\\frac{${numerator}}{${denominator}}`;
  }

  return trimmed
    .replace(/\bsin\s*\(([^)]+)\)/gi, "\\sin($1)")
    .replace(/\bcos\s*\(?([a-zA-Z][^)]*)\)?/gi, "\\cos $1")
    .replace(/\bsqrt\s*\(([^)]+)\)/gi, "\\sqrt{$1}")
    .replace(/\*/g, "\\cdot ");
};

const addLegacyMathDelimiters = (value: string) => {
  if (hasMathDelimiters(value)) {
    return value;
  }

  return value.replace(
    /lim\(x\s*->\s*([^)]+)\)\s+(.+?)(?=(?:\.| e indica| y justifica| Explica| Muestra|$))/gi,
    (_, target: string, expression: string) =>
      `$$\\lim_{x \\to ${normalizeLimitTarget(target)}}${legacyExpressionToLatex(expression)}$$`
  );
};

const isEscaped = (value: string, index: number) => {
  let slashCount = 0;
  for (let i = index - 1; i >= 0 && value[i] === "\\"; i -= 1) {
    slashCount += 1;
  }
  return slashCount % 2 === 1;
};

const findClosingDelimiter = (value: string, close: string, fromIndex: number) => {
  let index = value.indexOf(close, fromIndex);
  while (index !== -1 && isEscaped(value, index)) {
    index = value.indexOf(close, index + close.length);
  }
  return index;
};

const tokenizeMathText = (value: string): Token[] => {
  const tokens: Token[] = [];
  let cursor = 0;

  while (cursor < value.length) {
    const next = delimiters
      .map((delimiter) => {
        const index = value.indexOf(delimiter.open, cursor);
        return index === -1 || isEscaped(value, index) ? null : { ...delimiter, index };
      })
      .filter((match): match is NonNullable<typeof match> => Boolean(match))
      .sort((a, b) => a.index - b.index || b.open.length - a.open.length)[0];

    if (!next) {
      tokens.push({ type: "text", value: value.slice(cursor) });
      break;
    }

    if (next.index > cursor) {
      tokens.push({ type: "text", value: value.slice(cursor, next.index) });
    }

    const contentStart = next.index + next.open.length;
    const closeIndex = findClosingDelimiter(value, next.close, contentStart);

    if (closeIndex === -1) {
      tokens.push({ type: "text", value: value.slice(next.index) });
      break;
    }

    tokens.push({
      type: "math",
      value: value.slice(contentStart, closeIndex).trim(),
      displayMode: next.displayMode
    });
    cursor = closeIndex + next.close.length;
  }

  return tokens;
};

export function MathText({ value, className }: MathTextProps) {
  const tokens = tokenizeMathText(addLegacyMathDelimiters(value));

  return (
    <div className={className}>
      {tokens.map((token, index) => {
        if (token.type === "text") {
          return (
            <span key={index} className="whitespace-pre-line">
              {token.value}
            </span>
          );
        }

        const html = katex.renderToString(token.value, {
          displayMode: token.displayMode,
          throwOnError: false,
          strict: false,
          trust: false
        });

        const Tag = token.displayMode ? "div" : "span";

        return (
          <Tag
            key={index}
            className={token.displayMode ? "my-3 overflow-x-auto overflow-y-hidden py-1" : "inline-block align-baseline"}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}
