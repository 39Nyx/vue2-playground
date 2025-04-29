<script setup lang="ts">
import {Splitpanes, Pane} from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

import {onMounted, type Ref, ref} from 'vue'
import {defaultCode} from '@/utils/defaultCode.ts'
import loader from '@monaco-editor/loader'
import {generatorHtml} from "@/utils/generatorHtml.ts";

let editor: any
const editorContainer = ref(null);
const previewFrame: Ref<HTMLIFrameElement | null> = ref(null)

function updatePreview() {
  const codeEditor = editor.getValue()
  if (previewFrame.value && editor) {
    previewFrame.value.srcdoc = generatorHtml(codeEditor, previewFrame.value)
  }
}

async function initMonaco() {
  loader.config({paths: {vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs'}})
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
    updatePreview()
  })

  updatePreview()
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
        <div class="preview-container">
          <iframe ref="previewFrame" class="preview-frame"></iframe>
        </div>
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
