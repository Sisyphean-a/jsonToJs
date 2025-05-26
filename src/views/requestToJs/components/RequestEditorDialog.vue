<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent max-width="700px">
    <v-card>
      <v-card-title>Edit Request Details</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="editableUrl"
          label="URL"
          variant="outlined"
          density="compact"
        ></v-text-field>

        <v-select
          v-model="editableMethod"
          :items="httpMethods"
          label="Method"
          variant="outlined"
          density="compact"
        ></v-select>

        <v-textarea
          v-model="editableHeadersString"
          label="Headers (JSON format)"
          rows="5"
          hint="Enter headers as a JSON object string"
          persistent-hint
          variant="outlined"
          :error-messages="headerError"
        ></v-textarea>

        <v-textarea
          v-model="editableBodyString"
          label="Body"
          rows="5"
          variant="outlined"
          density="compact"
        ></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" @click="onUpdateRequest">Update Request</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  requestData: Object // { url, method, headersString, bodyString }
});

const emit = defineEmits(['update:modelValue', 'update-request']);

// Refs for editable fields
const editableUrl = ref('');
const editableMethod = ref('GET');
const editableHeadersString = ref('{}');
const editableBodyString = ref('');
const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
const headerError = ref(''); // To store validation error for headers


function resetFormFromProps() {
  if (props.requestData) {
    editableUrl.value = props.requestData.url || '';
    editableMethod.value = props.requestData.method || 'GET';
    // Ensure headersString is always a string, default to empty JSON object string
    editableHeadersString.value = typeof props.requestData.headersString === 'string' ? props.requestData.headersString : '{}';
    editableBodyString.value = props.requestData.bodyString || '';
    headerError.value = ''; // Reset error on form reset
  } else {
    // Default values if requestData is initially null or undefined
    editableUrl.value = '';
    editableMethod.value = 'GET';
    editableHeadersString.value = '{}';
    editableBodyString.value = '';
    headerError.value = '';
  }
}

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    resetFormFromProps();
  }
}, { immediate: true }); // Use immediate: true to run on initial props binding if modelValue is true


function onUpdateRequest() {
  try {
    JSON.parse(editableHeadersString.value); // Validate JSON format
    headerError.value = ''; // Clear any previous error
  } catch (e) {
    headerError.value = 'Headers must be a valid JSON string.';
    console.error("Invalid headers JSON:", e.message);
    return; // Stop processing if headers are invalid
  }

  emit('update-request', {
    url: editableUrl.value,
    method: editableMethod.value,
    headersString: editableHeadersString.value, // Emit string back
    bodyString: editableBodyString.value
  });
  emit('update:modelValue', false); // Close dialog
}

function closeDialog() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
/* Add any component-specific styles here if needed */
.v-textarea, .v-text-field, .v-select {
  margin-bottom: 16px; /* Add some spacing between fields */
}
</style>
