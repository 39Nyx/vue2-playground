function processVueCode(code: string, frame: HTMLIFrameElement): string {
  const templateMatch = code.match(/template>([\s\S]*?)<\/template>/)
  const scriptMatch = code.match(/<script>([\s\S]*?)<\/script>/)

  const template = templateMatch ? templateMatch[1].trim() : ''
  const script = scriptMatch ? scriptMatch[1].trim() : 'export default {}'

  let processedScript = script
    .replace('export default', '')
    .replace(/`/g, '\\`')
    .trim()
  // 开头一个{或者结尾以}的字符串，直接去掉
  if (processedScript.startsWith('{')) {
    processedScript = processedScript.slice(1)
  }
  if (processedScript.endsWith('}')) {
    processedScript = processedScript.slice(0, -1)
  }
  return `{
        template: \`<div>${ template }</div>\`,
        ${ processedScript },
    }`
}

function getStyle(code: string): string {
  const styleMatch = code.match(/<style>([\s\S]*?)<\/style>/)
  return styleMatch ? styleMatch[1].trim() : ''

}

export function generatorHtml(code: string, frame: HTMLIFrameElement): string {
  return `<!DOCTYPE html>
        <html>
          <head>
            <script src="https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js"></script>
            <style>${getStyle(code)}</style>
          </head>
          <body>
            <div id="app"></div>
            <script>
              new Vue(${ processVueCode(code, frame) }).$mount('#app')
            </script>
          </body>
        </html>
`;
}
