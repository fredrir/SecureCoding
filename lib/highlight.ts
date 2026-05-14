import type { CodeLanguage } from "@/domain/language";

/**
 * Tiny per-language tokenizer. Renders syntax colours that are good enough for
 * teaching purposes without pulling in Shiki / highlight.js. Each rule emits
 * HTML-escaped output wrapped in a `<span class="tok-*">`.
 *
 * The rules below are deliberately generic: keywords, strings, numbers,
 * comments, function names. They produce an attractive monochrome-with-accents
 * look that reads better than a dimly-lit raw <pre>.
 */

export interface TokenRule {
  pattern: RegExp;
  cls: string;
}

const COMMON_OPS = /([+\-*/%=<>!&|^~?:]+)/;
const COMMON_PUNCT = /([{}()[\];,.])/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildRules(language: CodeLanguage): TokenRule[] {
  const stringRule: TokenRule = {
    pattern: /(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/,
    cls: "tok-str",
  };
  const numberRule: TokenRule = {
    pattern: /\b(0x[0-9a-fA-F]+|\d+(?:\.\d+)?)\b/,
    cls: "tok-num",
  };
  const fnRule: TokenRule = {
    pattern: /\b([A-Za-z_][\w]*)(?=\s*\()/,
    cls: "tok-fn",
  };
  const commentSlashSlash: TokenRule = {
    pattern: /(\/\/[^\n]*)/,
    cls: "tok-com",
  };
  const commentBlock: TokenRule = {
    pattern: /(\/\*[\s\S]*?\*\/)/,
    cls: "tok-com",
  };
  const commentHash: TokenRule = {
    pattern: /(#[^\n]*)/,
    cls: "tok-com",
  };
  const commentDashDash: TokenRule = {
    pattern: /(--[^\n]*)/,
    cls: "tok-com",
  };

  const kw = (words: string[]): TokenRule => ({
    pattern: new RegExp(`\\b(${words.join("|")})\\b`),
    cls: "tok-key",
  });

  switch (language) {
    case "javascript":
    case "typescript":
      return [
        commentBlock,
        commentSlashSlash,
        stringRule,
        kw([
          "const","let","var","function","return","if","else","for","while","do",
          "switch","case","default","break","continue","new","typeof","instanceof",
          "true","false","null","undefined","async","await","try","catch","finally",
          "throw","import","export","from","as","class","extends","this","super",
          "interface","type","enum","public","private","protected","readonly",
        ]),
        fnRule,
        numberRule,
        { pattern: COMMON_OPS, cls: "tok-op" },
        { pattern: COMMON_PUNCT, cls: "tok-pun" },
      ];
    case "python":
      return [
        commentHash,
        stringRule,
        kw([
          "def","return","if","elif","else","for","while","import","from","as",
          "class","try","except","finally","raise","with","pass","lambda","yield",
          "in","is","not","and","or","True","False","None","async","await","global",
          "nonlocal","self",
        ]),
        fnRule,
        numberRule,
        { pattern: COMMON_OPS, cls: "tok-op" },
        { pattern: COMMON_PUNCT, cls: "tok-pun" },
      ];
    case "java":
    case "csharp":
      return [
        commentBlock,
        commentSlashSlash,
        stringRule,
        kw([
          "public","private","protected","static","final","void","new","class","interface",
          "extends","implements","return","if","else","for","while","do","switch","case",
          "break","continue","try","catch","finally","throw","throws","import","package",
          "true","false","null","this","super","abstract","var","using","namespace",
          "string","int","long","short","byte","boolean","double","float","char",
        ]),
        fnRule,
        numberRule,
        { pattern: COMMON_OPS, cls: "tok-op" },
        { pattern: COMMON_PUNCT, cls: "tok-pun" },
      ];
    case "go":
      return [
        commentSlashSlash,
        commentBlock,
        stringRule,
        kw([
          "package","import","func","return","var","const","type","struct","interface",
          "map","chan","go","defer","if","else","for","range","switch","case","default",
          "break","continue","fallthrough","select","true","false","nil",
        ]),
        fnRule,
        numberRule,
        { pattern: COMMON_OPS, cls: "tok-op" },
        { pattern: COMMON_PUNCT, cls: "tok-pun" },
      ];
    case "php":
      return [
        commentSlashSlash,
        commentBlock,
        commentHash,
        stringRule,
        kw([
          "function","return","if","else","elseif","for","foreach","while","do",
          "switch","case","break","continue","new","class","extends","implements",
          "public","private","protected","static","const","echo","print","require",
          "require_once","include","include_once","true","false","null","use","namespace",
          "try","catch","finally","throw","as",
        ]),
        fnRule,
        numberRule,
        { pattern: COMMON_OPS, cls: "tok-op" },
        { pattern: COMMON_PUNCT, cls: "tok-pun" },
      ];
    case "ruby":
      return [
        commentHash,
        stringRule,
        kw([
          "def","end","return","if","elsif","else","unless","while","until","for",
          "begin","rescue","ensure","raise","class","module","do","yield","require",
          "true","false","nil","self","include","extend","attr_accessor","attr_reader",
          "attr_writer",
        ]),
        fnRule,
        numberRule,
        { pattern: COMMON_OPS, cls: "tok-op" },
        { pattern: COMMON_PUNCT, cls: "tok-pun" },
      ];
    case "sql":
      return [
        commentDashDash,
        commentBlock,
        stringRule,
        kw([
          "SELECT","INSERT","UPDATE","DELETE","FROM","WHERE","JOIN","INNER","LEFT",
          "RIGHT","OUTER","ON","AS","AND","OR","NOT","NULL","IS","IN","LIKE","BETWEEN",
          "GROUP","BY","ORDER","HAVING","LIMIT","OFFSET","CREATE","TABLE","DROP",
          "ALTER","INDEX","VIEW","UNION","ALL","DISTINCT","INTO","VALUES","SET",
          "select","insert","update","delete","from","where","join","inner","left",
          "right","outer","on","as","and","or","not","null","is","in","like","between",
        ]),
        fnRule,
        numberRule,
        { pattern: COMMON_OPS, cls: "tok-op" },
        { pattern: COMMON_PUNCT, cls: "tok-pun" },
      ];
    case "html":
      return [
        { pattern: /(<!--[\s\S]*?-->)/, cls: "tok-com" },
        { pattern: /(&lt;\/?[\w-]+|\/?&gt;)/, cls: "tok-key" },
        stringRule,
      ];
    case "bash":
      return [
        commentHash,
        stringRule,
        kw([
          "if","then","else","fi","for","do","done","while","case","esac","in",
          "function","return","exit","echo","export","read","cd","pwd","ls","cp","mv","rm",
        ]),
        numberRule,
        { pattern: COMMON_OPS, cls: "tok-op" },
        { pattern: COMMON_PUNCT, cls: "tok-pun" },
      ];
    case "yaml":
      return [
        commentHash,
        stringRule,
        { pattern: /^(\s*[\w.-]+)(?=:)/m, cls: "tok-key" },
        numberRule,
      ];
    case "json":
      return [
        stringRule,
        kw(["true", "false", "null"]),
        numberRule,
        { pattern: COMMON_PUNCT, cls: "tok-pun" },
      ];
    default:
      return [];
  }
}

/**
 * Highlight a single line of code. We escape first, then run rules in order,
 * splicing matched ranges into a tokens list and tagging untouched ranges as
 * plain text. Ranges never overlap because each match consumes the substring.
 */
export function highlightLine(line: string, language: CodeLanguage): string {
  if (language === "plaintext" || line === "") return escapeHtml(line);

  const rules = buildRules(language);
  // Each entry: [start, end, html]
  const marks: Array<[number, number, string]> = [];
  const taken = new Array(line.length).fill(false) as boolean[];

  for (const rule of rules) {
    const re = new RegExp(rule.pattern.source, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      let collide = false;
      for (let i = start; i < end; i += 1) {
        if (taken[i]) {
          collide = true;
          break;
        }
      }
      if (collide) continue;
      for (let i = start; i < end; i += 1) taken[i] = true;
      marks.push([
        start,
        end,
        `<span class="${rule.cls}">${escapeHtml(m[0])}</span>`,
      ]);
      // Avoid zero-width infinite loops
      if (m[0].length === 0) re.lastIndex += 1;
    }
  }

  marks.sort((a, b) => a[0] - b[0]);
  let out = "";
  let cursor = 0;
  for (const [start, end, html] of marks) {
    if (start > cursor) out += escapeHtml(line.slice(cursor, start));
    out += html;
    cursor = end;
  }
  if (cursor < line.length) out += escapeHtml(line.slice(cursor));
  return out;
}
