// TODO: finish writing
import * as React from "react"

export default function article(lexemes: JSX.Element | null, parser: JSX.Element | null, highlightedLexemes: JSX.Element | null, sourceCode: JSX.Element | null) {
  return (
    <div className="wrapper">
      <article className="post h-entry">
        <header className="post-header">
          <h1 className="post-title p-name">How does recursive descent work?</h1>
        </header>
        <section className="post-content">
          <h2>What</h2>
          <h3>Recursive Descent</h3>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus
            architecto consectetur sunt similique neque inventore vitae nulla alias ut
            adipisci, quidem, distinctio ex? Et facere dolores quis at excepturi
            assumenda.
          </p>
          <h4>Top down parsing</h4>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus
            architecto consectetur sunt similique neque inventore vitae nulla alias ut
            adipisci, quidem, distinctio ex? Et facere dolores quis at excepturi
            assumenda.
          </p>
          <h4>Grammars</h4>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus
            architecto consectetur sunt similique neque inventore vitae nulla alias ut
            adipisci, quidem, distinctio ex? Et facere dolores quis at excepturi
            assumenda.
          </p>
          <h3>Why not regexes</h3>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus
            architecto consectetur sunt similique neque inventore vitae nulla alias ut
            adipisci, quidem, distinctio ex? Et facere dolores quis at excepturi
            assumenda.
          </p>
        </section>
        <section className="post-content">
          <h2>How</h2>
          <h3>A calculator's grammar</h3>
          <p>
            The grammar is written in{" "}
            <a href="https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form">
              Extended Backus-Naur Form
            </a>
            , it's quite simple but I wont explain it here.
          </p>
          <figure>
            <pre>
              <code>
                {`expr ::= expr op expr
     ::= digit
op ::= '+' | '-' | '*' | '/'
digit ::= /\\d+/
`}
              </code>
            </pre>
          </figure>
          <h4>Eliminating left recursion</h4>
          <p>
            Left recursion aka having{" "}
            <code>{`nonterminal ::= nonterminal <MORE PRODUCTIONS>`}</code> is a problem
            for recursive descent parsers.
          </p>
          <p>
            To see why let's consider a simple grammar
            <code>{`A ::= A B`}</code>. The recursive descent parser's code for this
            grammar is this:
          </p>
          <figure>
            <pre>
              <code>{`function A() {
    if (A()) {
        return B();
    }
    return false;
}`}</code>
            </pre>
          </figure>
          <p>
            As you can see in the if statement there is infinite recursion. To solve this
            we will rewrite the grammar to obtain an equivalent one without left
            recursion. You can see how to do this{" "}
            <a href="https://web.cs.wpi.edu/~kal/PLT/PLT4.1.2.html">here</a>.
          </p>
          <h4>The grammar without left recursion</h4>
          <figure>
            <pre>
              <code>{`expr ::= digit
     ::= digit op expr
op ::= '+' | '-' | '*' | '/'
digit ::= /\\d+/`}</code>
            </pre>
          </figure>
          <p>
            Which can be rewritten more concisely using <code>?</code>
          </p>
          <figure>
            <pre>
              <code>{`expr ::= digit (op expr)?
op ::= '+' | '-' | '*' | '/'
digit ::= /\\d+/`}</code>
            </pre>
          </figure>

          <h4>Adding operator precedence</h4>
          <p>
            Right now this grammar does not support operator precendence meaning that{" "}
            <code>1*2+3</code> will be parsed in this {`order `}
            <code>1*(2+3)</code>.{" "}
          </p>
          <p>
            To fix this we will have to separate the precendeces of summation/subtraction
            and multiplication/division by creating a new production rule for each one.
          </p>
          <p>
            The operations with the highest precedence will be "deeper" in the rule
            definitions than the ones with a lower precedence. You can see a better
            explanation of the method{" "}
            <a href="http://www.craftinginterpreters.com/parsing-expressions.html#ambiguity-and-the-parsing-game">
              here
            </a>
            .
          </p>
          <h3>The final grammar</h3>
          <figure>
            <pre>
              <code>
                {`expr ::= mult ('+' | '-' expr)?
mult ::= digit ('*' | '/' mult)?
digit ::= /\\d+/`}
              </code>
            </pre>
          </figure>

          <h3>The Lexer</h3>
          <div>
            The lexer converts the input string to a list of tokens called{" "}
            <strong>lexemes</strong>. There are three types of lexemes for this
            calculator:
            <div style={{ display: "flex" }}>
              <div style={{ margin: "1em" }}>
                Digits
                <div className="lexeme digit">
                  <span>42</span>
                </div>
              </div>
              <div style={{ margin: "1em" }}>
                Operators
                <div className="lexeme op">
                  <span>*</span>
                </div>
              </div>
              <div style={{ margin: "1em" }}>
                and End Of File
                <div className="lexeme eof">
                  <span>EOF</span>
                </div>
              </div>
            </div>
          </div>
          <p>Try to write something in the text input below and see what comes out.</p>
          {lexemes}
          <h3>The Parser</h3>
          <h4>Explain how to build one with terminal and nonterminals</h4>
          {parser}
          {highlightedLexemes}
          {sourceCode}
        </section>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus
          architecto consectetur sunt similique neque inventore vitae nulla alias ut
          adipisci, quidem, distinctio ex? Et facere dolores quis at excepturi assumenda.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus
          architecto consectetur sunt similique neque inventore vitae nulla alias ut
          adipisci, quidem, distinctio ex? Et facere dolores quis at excepturi assumenda.
        </p>
      </article>
    </div>
  )
}
