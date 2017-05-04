# Recast MS Word HTML export as Markdown

Very basic (dirty regex stuff) CLI conversion tool for longer texts written in node.js. Intended as a first step of a longer cleanup (eg. when editorial process goes on in Word, but it's needed to convert it into plaintext).

- preserves `p`, `h1`, `i`, `b` tags as their markdown equivalents
    - `div` is considered to be same as `p`
- splits text into chapters (delimited by h1 headers)
- preserves footnotes and fixes their links to [Multimarkdown syntax](https://github.com/fletcher/MultiMarkdown/wiki/MultiMarkdown-Syntax-Guide)
    + footnote link: `[^num]`
    + footnote text: `[num]: text`

**Zero % test coverage, hence it's not submitted into npm.**

# Use

    git clone https://github.com/next-book/recast-word-html.git recast-word-html
    cd recast-word-html
    npm install
    npm link
    recast --src=path/to/file.html

Convert MS Word HTML export into UTF-8 before using this tool.
