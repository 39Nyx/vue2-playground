<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

import { onMounted, ref, useTemplateRef } from 'vue'
import { defaultCode } from '@/utils/defaultCode.ts'
import loader from '@monaco-editor/loader'
import srcdoc from './srcdoc.html?raw'

let editor: any
const editorContainer = ref(null);
const containerRef = useTemplateRef('container')
let sandbox: HTMLIFrameElement

function transformCode(code: string) {
  const templateMatch = code.match(/template>([\s\S]*?)<\/template>/)
  const scriptMatch = code.match(/<script>([\s\S]*?)<\/script>/)
  const styleMatch = code.match(/<style>([\s\S]*?)<\/style>/)

  const template = templateMatch ? templateMatch[1].trim() : ''
  const script = scriptMatch ? scriptMatch[1].trim() : 'export default {}'
  const style = styleMatch ? styleMatch[1].trim() : ''

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

  return {
    template: template || '<div></div>',
    script: processedScript,
    css: style
  }
}

/**
 * 创建沙箱环境函数
 * 该函数负责创建一个安全的iframe沙箱，用于预览和运行Vue代码
 * 沙箱提供了一个隔离的环境，防止代码对主应用产生影响
 */
function createSandbox() {
  // 如果已存在沙箱，则先清理旧的沙箱环境
  if (sandbox) {
    // 从DOM中移除旧的iframe元素
    containerRef.value?.removeChild(sandbox)
  }
  // 创建一个新的iframe元素作为沙箱容器
  sandbox = document.createElement('iframe')
  sandbox.style.width = '100%'
  sandbox.style.height = '100%'
  sandbox.style.border = 'none'
  // 设置sandbox安全属性，控制iframe内容的权限
  sandbox.setAttribute(
    'sandbox',
    [
      'allow-forms',      // 允许表单提交
      'allow-modals',     // 允许模态框
      'allow-pointer-lock', // 允许指针锁定
      'allow-popups',     // 允许弹出窗口
      'allow-scripts',    // 允许执行脚本
      'allow-top-navigation-by-user-activation', // 允许用户激活后的顶级导航
    ].join(' '),
  )
  const codeEditor: string = editor?.getValue() || ''
  const { template, script, css } = transformCode(codeEditor)

  // 设置iframe的HTML内容
  sandbox.srcdoc = srcdoc
    .replace('// preview css', css)
    .replace('// preview js', `new Vue({template: \`${ template }\`, ${ script }}).$mount('#app')`)
  // 将iframe添加到容器中
  containerRef.value?.appendChild(sandbox)
}

async function initMonaco() {
  loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs' } })
  const monaco = await loader.init()

  editor = monaco.editor.create(editorContainer.value, {
    value: defaultCode,
    language: 'vue',
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: {
      enabled: false
    }
  })

  editor.onDidChangeModelContent(() => {
    createSandbox()
  })

  createSandbox()
}

onMounted(() => {
  initMonaco()
})
</script>

<template>
  <div class="playground">
    <Splitpanes class="default-theme">
      <Pane size="30">
        <div class="editor-container" ref="editorContainer"></div>
      </Pane>
      <Pane size="70">
        <div ref="container" class="preview-container"></div>
      </Pane>
    </Splitpanes>
  </div>
</template>

<style scoped>
.playground {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.editor-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.preview-container {
  height: 100%;
  width: 100%;
  background: #fff;
  overflow: hidden;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
