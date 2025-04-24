<template>
  <v-dialog v-model="dialog" max-width="800px">
    <v-card>
      <v-card-title>常用代码示例</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item v-for="(code, index) in commonCodes" :key="index" @click="selectCode(code)">
            <template v-slot:title>{{ code.title }}</template>
            <template v-slot:subtitle>
              <pre class="code-preview">{{ code.code }}</pre>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="dialog = false">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { commonCodes } from '../utils/commonCodes'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'select'])

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const selectCode = (code) => {
  emit('select', code.code)
  dialog.value = false
}
</script>

<style scoped>
.code-preview {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  margin: 0;
}
</style>
