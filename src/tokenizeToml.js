/**
 * @enum number
 */
export const State = {
  TopLevelContent: 1,
  AfterPropertyName: 3,
  AfterPropertyNameAfterEqualSign: 4,
  InsideDoubleQuoteString: 5,
  InsideSingleQuoteString: 6,
  InsideArray: 7,
  InsideObject: 8,
  InsideTripleDoubleQuoteString: 9,
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
const RE_ANYTHING = /^.+/s
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
const RE_QUOTE_SINGLE = /^'/
const RE_STRING_DOUBLE_QUOTE_CONTENT = /^[^"]+/
const RE_STRING_SINGLE_QUOTE_CONTENT = /^[^']+/
const RE_TRIPLE_DOUBLE_QUOTE = /^"{3}/
const RE_TRIPLE_QUOTED_STRING_CONTENT_DOUBLE_QUOTES = /.*(?=""")/s
const RE_TRIPLE_QUOTED_STRING_CONTENT_COMMON = /.*/s

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
  let stack = lineState.stack
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
          part
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
          state = stack.pop() || State.TopLevelContent
        } else if ((next = part.match(RE_LOCAL_TIME))) {
          token = TokenType.Numeric
          state = stack.pop() || State.TopLevelContent
        } else if ((next = part.match(RE_NUMERIC_INTEGER))) {
          token = TokenType.Numeric
          state = stack.pop() || State.TopLevelContent
        } else if ((next = part.match(RE_NUMERIC_FLOAT))) {
          token = TokenType.Numeric
          state = stack.pop() || State.TopLevelContent
        } else if ((next = part.match(RE_LINE_COMMENT))) {
          token = TokenType.Comment
          state = stack.pop() || State.TopLevelContent
        } else if ((next = part.match(RE_NAN))) {
          token = TokenType.Numeric
          state = stack.pop() || State.TopLevelContent
        } else if ((next = part.match(RE_INF))) {
          token = TokenType.Numeric
          state = stack.pop() || State.TopLevelContent
        } else if ((next = part.match(RE_TRIPLE_DOUBLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.InsideTripleDoubleQuoteString
        } else if ((next = part.match(RE_QUOTE_DOUBLE))) {
          token = TokenType.Punctuation
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_QUOTE_SINGLE))) {
          token = TokenType.Punctuation
          state = State.InsideSingleQuoteString
        } else if ((next = part.match(RE_SQUARE_OPEN))) {
          token = TokenType.Punctuation
          state = State.InsideArray
        } else if ((next = part.match(RE_CURLY_OPEN))) {
          token = TokenType.Punctuation
          state = State.InsideObject
        } else if ((next = part.match(RE_ANYTHING))) {
          token = TokenType.PropertyValueString
          state = State.TopLevelContent
        } else {
          throw new Error('no')
        }
        break
      case State.InsideDoubleQuoteString:
        if ((next = part.match(RE_QUOTE_DOUBLE))) {
          token = TokenType.PunctuationString
          state = stack.pop() || State.TopLevelContent
        } else if ((next = part.match(RE_STRING_DOUBLE_QUOTE_CONTENT))) {
          token = TokenType.String
          state = State.InsideDoubleQuoteString
        } else {
          throw new Error('no')
        }
        break
      case State.InsideSingleQuoteString:
        if ((next = part.match(RE_QUOTE_SINGLE))) {
          token = TokenType.PunctuationString
          state = stack.pop() || State.TopLevelContent
        } else if ((next = part.match(RE_STRING_SINGLE_QUOTE_CONTENT))) {
          token = TokenType.String
          state = State.InsideSingleQuoteString
        } else {
          throw new Error('no')
        }
        break
      case State.InsideArray:
        if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.InsideArray
        } else if ((next = part.match(RE_SQUARE_CLOSE))) {
          token = TokenType.Punctuation
          state = stack.pop() || State.TopLevelContent
        } else if ((next = part.match(RE_QUOTE_DOUBLE))) {
          token = TokenType.Punctuation
          state = State.InsideDoubleQuoteString
          stack.push(State.InsideArray)
        } else if ((next = part.match(RE_COMMA))) {
          token = TokenType.Punctuation
          state = State.InsideArray
        } else if ((next = part.match(RE_NUMERIC_INTEGER))) {
          token = TokenType.Numeric
          state = State.InsideArray
        } else {
          part
          throw new Error('no')
        }
        break
      case State.InsideObject:
        if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.InsideObject
        } else if ((next = part.match(RE_PROPERTY_NAME))) {
          token = TokenType.PropertyName
          state = State.InsideObject
        } else if ((next = part.match(RE_EQUAL_SIGN))) {
          token = TokenType.Punctuation
          state = State.AfterPropertyNameAfterEqualSign
          stack.push(State.InsideObject)
        } else if ((next = part.match(RE_CURLY_CLOSE))) {
          token = TokenType.Punctuation
          state = stack.pop() || State.TopLevelContent
        } else if ((next = part.match(RE_SQUARE_OPEN))) {
          token = TokenType.Punctuation
          state = State.InsideArray
          stack.push(State.InsideObject)
        } else if ((next = part.match(RE_COMMA))) {
          token = TokenType.Punctuation
          state = State.InsideObject
        } else {
          throw new Error('no')
        }
        break
      case State.InsideTripleDoubleQuoteString:
        if ((next = part.match(RE_TRIPLE_DOUBLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_TRIPLE_QUOTED_STRING_CONTENT_DOUBLE_QUOTES))) {
          token = TokenType.String
          state = State.InsideTripleDoubleQuoteString
        } else if ((next = part.match(RE_TRIPLE_QUOTED_STRING_CONTENT_COMMON))) {
          token = TokenType.String
          state = State.InsideTripleDoubleQuoteString
        } else {
          throw new Error('no')
        }
        break
      default:
        throw new Error('no')
    }
    const tokenLength = next[0].length
    index += tokenLength
    tokens.push(token, tokenLength)
  }
  return {
    state,
    tokens,
    stack,
  }
}
