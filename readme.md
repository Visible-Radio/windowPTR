# Window Pixel Text Renderer

## Because why use the things that already exist when you can build them from scratch yourself?

- It's a canvas based responsive display. Text is reflowed when the container size changes. Overflowing content is handled with scrolling.

## Demo

https://visible-radio.github.io/windowPTR/

## See also

- NodePTR:
  https://github.com/Visible-Radio/NodePTR
- react-pixel-character-editor:
  https://visible-radio.github.io/react-pixel-character-editor/

## Markup Language

- The plan is to implement a minimal markup languag.
- Plain text can be passed in, or segments of text wrapped in `<span></span>`, to which various attributes can be applied.

### Attributes

- `<span highlight=true></span>`

  - The wrapped text will be highlighted by inverting each character cell.

- `<span outline=true></span>`

  - The wrapped text will be outlined.

- `<span color=rgb(200,200,0)></span>`

  - The wrapped text will be rendered in with the specified color instead of the default color.

- Attributes can be combined
  - `<span highlight=true color=rgb(0,200,190)></span>`

## Newlines

- The display respects `\n` characters.

## Word wrap

- The display places words that won't fit on a line in the next line. If the word is wider than the display itself, it breaks the word at the character that would overflow.

## Scrolling

- Content outside of the display is handled with x-axis scrolling.

## Character set

Characters are encoded as a one dimensional array. Custom character definitions can be loaded.
Defs can be built with https://visible-radio.github.io/react-pixel-character-editor/

## Current API

- The project isn't currently packaged for use. This demo can be manipluated using the API temporarily exposed on `window._PTR` via the javascript console.

- Scroll up / down, and home / end functionallity is currently bound to the arrow keys as a development-time stopgap.

## Future features:

- Tree based (as opposed to list based) layout.

- A `<blink></blink>` tag or blink attribute that can be customized by providing a blink function

- Teletype like drawing of characters when a message is rendered for the first time.

- Simple document manipulation - append elements to document.

- Custom animations by passing an `onFirstDraw` animation function to an element.

- Custom looped animations for drawn elements.

- Scroll bar

- Hover styles on elements

- onClick on elements
