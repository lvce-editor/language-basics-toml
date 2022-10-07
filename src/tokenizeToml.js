/**
 * @enum number
 */
export const State = {
  TopLevelContent: 1,
  AfterPropertyName: 3,
  AfterPropertyNameAfterEqualSign: 4,
  InsideString: 5,
}

export const StateMap = {
  [State.TopLevelContent]: 'TopLevelContent',
}

/**
 * @enum number
 */
export const TokenType = {
  CssSelector: 1,
  Whitespace: 2,
  PunctuationString: 3,
  String: 4,
  None: 57,
  Unknown: 881,
  NewLine: 884,
  Comment: 885,
  Query: 886,
  Text: 887,
  Numeric: 15,
  PropertyName: 12,
  PropertyValueString: 14,
  Punctuation: 13,
  LanguageConstant: 11,
}

export const TokenMap = {
  [TokenType.CssSelector]: 'CssSelector',
  [TokenType.Whitespace]: 'Whitespace',
  [TokenType.None]: 'None',
  [TokenType.Unknown]: 'Unknown',
  [TokenType.NewLine]: 'NewLine',
  [TokenType.Comment]: 'Comment',
  [TokenType.Query]: 'Query',
  [TokenType.Text]: 'Text',
  [TokenType.PropertyName]: 'JsonPropertyName',
  [TokenType.LanguageConstant]: 'LanguageConstant',
  [TokenType.Punctuation]: 'Punctuation',
  [TokenType.PropertyValueString]: 'PropertyValueString',
  [TokenType.Numeric]: 'Numeric',
  [TokenType.PunctuationString]: 'PunctuationString',
  [TokenType.String]: 'String',
}

const RE_LINE_COMMENT = /^#.*/s
const RE_WHITESPACE = /^ +/
const RE_CURLY_OPEN = /^\{/
const RE_CURLY_CLOSE = /^\}/
const RE_PROPERTY_NAME = /^[a-zA-Z\-\_\d]+\b(?=\s*=)/
const RE_COLON = /^:/
const RE_PROPERTY_VALUE = /^[^;\}]+/
const RE_SEMICOLON = /^;/
const RE_COMMA = /^,/
const RE_ANYTHING = /^.*/
const RE_NUMERIC_INTEGER = /^((?:[\+\-]?(0|([1-9](([0-9]|_[0-9])+)?))))/
const RE_NUMERIC_FLOAT = /^([\+\-]?(0|([1-9](([0-9]|_[0-9])+)?))(?:(?:\.(0|([1-9](([0-9]|_[0-9])+)?)))?[eE][\+\-]?[1-9]_?[0-9]*|(?:\.[0-9_]*)))/
const RE_NAN = /^(?:[\+\-]?nan)/
const RE_INF = /^(?:[\+\-]?inf)/
const RE_ANYTHING_UNTIL_CLOSE_BRACE = /^[^\}]+/
const RE_BLOCK_COMMENT_START = /^\/\*/
const RE_BLOCK_COMMENT_END = /^\*\//
const RE_BLOCK_COMMENT_CONTENT = /^.+?(?=\*\/|$)/s
const RE_ROUND_OPEN = /^\(/
const RE_ROUND_CLOSE = /^\)/
const RE_PSEUDO_SELECTOR_CONTENT = /^[^\)]+/
const RE_SQUARE_OPEN = /^\[/
const RE_SQUARE_CLOSE = /^\]/
const RE_ATTRIBUTE_SELECTOR_CONTENT = /^[^\]]+/
const RE_QUERY = /^@[a-z\-]+/
const RE_STAR = /^\*/
const RE_QUERY_NAME = /^[a-z\-]+/
const RE_QUERY_CONTENT = /^[^\)]+/
const RE_COMBINATOR = /^[\+\>\~]/
const RE_LANGUAGE_CONSTANT = /^(?:true|false)\b/
const RE_EQUAL_SIGN = /^=/
const RE_LOCAL_TIME = /\d{2}:\d{2}:\d{2}(?:\.\d+)?/
const RE_QUOTE_DOUBLE = /^"/
const RE_STRING_DOUBLE_QUOTE_CONTENT = /^[^"]+/

export const initialLineState = {
  state: State.TopLevelContent,
  tokens: [],
  stack: [],
}

export const hasArrayReturn = true

/**
 * @param {string} line
 * @param {any} lineState
 */
export const tokenizeLine = (line, lineState) => {
  let next = null
  let index = 0
  let tokens = []
  let token = TokenType.None
  let state = lineState.state
  while (index < line.length) {
    const part = line.slice(index)
    switch (state) {
      case State.TopLevelContent:
        if ((next = part.match(RE_PROPERTY_NAME))) {
          token = TokenType.PropertyName
          state = State.AfterPropertyName
        } else if ((next = part.match(RE_LINE_COMMENT))) {
          token = TokenType.Comment
          state = State.TopLevelContent
        } else if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.TopLevelContent
        } else if ((next = part.match(RE_ANYTHING))) {
          token = TokenType.Text
          state = State.TopLevelContent
        } else {
          part //?
          throw new Error('no')
        }
        break
      case State.AfterPropertyName:
        if ((next = part.match(RE_EQUAL_SIGN))) {
          token = TokenType.Punctuation
          state = State.AfterPropertyNameAfterEqualSign
        } else if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.AfterPropertyName
        } else {
          throw new Error('no')
        }
        break
      case State.AfterPropertyNameAfterEqualSign:
        if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.AfterPropertyNameAfterEqualSign
        } else if ((next = part.match(RE_LANGUAGE_CONSTANT))) {
          token = TokenType.LanguageConstant
          state = State.TopLevelContent
        } else if ((next = part.match(RE_LOCAL_TIME))) {
          token = TokenType.Numeric
          state = State.TopLevelContent
        } else if ((next = part.match(RE_NUMERIC_INTEGER))) {
          token = TokenType.Numeric
          state = State.TopLevelContent
        } else if ((next = part.match(RE_NUMERIC_FLOAT))) {
          token = TokenType.Numeric
          state = State.TopLevelContent
        } else if ((next = part.match(RE_LINE_COMMENT))) {
          token = TokenType.Comment
          state = State.TopLevelContent
        } else if ((next = part.match(RE_NAN))) {
          token = TokenType.Numeric
          state = State.TopLevelContent
        } else if ((next = part.match(RE_INF))) {
          token = TokenType.Numeric
          state = State.TopLevelContent
        } else if ((next = part.match(RE_QUOTE_DOUBLE))) {
          token = TokenType.Punctuation
          state = State.InsideString
        } else if ((next = part.match(RE_ANYTHING))) {
          token = TokenType.PropertyValueString
          state = State.TopLevelContent
        } else {
          throw new Error('no')
        }
        break
      case State.InsideString:
        if ((next = part.match(RE_QUOTE_DOUBLE))) {
          token = TokenType.PunctuationString
          state = State.TopLevelContent
        } else if ((next = part.match(RE_STRING_DOUBLE_QUOTE_CONTENT))) {
          token = TokenType.String
          state = State.InsideString
        } else {
          throw new Error('no')
        }
        break
      default:
        console.log({ state, line })
        throw new Error('no')
    }
    const tokenLength = next[0].length
    index += tokenLength
    tokens.push(token, tokenLength)
  }
  return {
    state,
    tokens,
  }
}
