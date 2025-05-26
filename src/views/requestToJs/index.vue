<template>
  <resizable-layout :column-count="2">
    <template #column1>
      <div>
        <div class="pane-header">
          <span>cURL Command Input</span>
          <v-spacer></v-spacer> <!-- Added spacer -->
          <v-btn
            density="compact"
            variant="text"
            @click="clearAllInputs"
            class="mr-2"
          >
            Clear cURL
          </v-btn>
          <v-btn
            density="compact"
            variant="tonal"
            :disabled="!activeRequestForEditing"
            @click="showEditDialog = true"
          >
            Edit Request
          </v-btn>
        </div>
        <CodeEditor
          v-model="curlCommand"
          placeholder="Paste your cURL (bash) command here. Then click 'Process cURL' or 'Send Processed Request'."
          :line-numbers="true"
        />
        <button @click="processRequest" class="action-button">
          {{ activeRequestForEditing ? 'Send Processed Request' : 'Process cURL & Prepare Request' }}
        </button>
      </div>
    </template>

    <template #column2>
      <div>
        <div class="pane-header">
          <span>Request Details & Output</span>
          <v-spacer></v-spacer> <!-- Added spacer -->
          <v-btn
            density="compact"
            variant="text"
            @click="copyOutputToClipboard"
            :disabled="isOutputEmpty"
          >
            {{ copyButtonText }}
          </v-btn>
        </div>
        <CodeEditor
          v-model="outputJson"
          placeholder="Parsed request details and response data will appear here."
          :line-numbers="true"
          :read-only="true"
        />
      </div>
    </template>
  </resizable-layout>

  <request-editor-dialog
    v-model="showEditDialog"
    :request-data="activeRequestForEditing"
    @update-request="handleUpdateRequestFromDialog"
  ></request-editor-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ResizableLayout from '@/components/ResizableLayout.vue';
import CodeEditor from '@/components/CodeEditor.vue';
import RequestEditorDialog from './components/RequestEditorDialog.vue'; // Import dialog
import { parseCurlCommand } from '@/utils/curlParser.js';
import { getCodesByType } from '@/utils/commonCodes.js';
import { usePageStateStore } from '@/stores/pageState.js';

// Store setup
const pageStateStore = usePageStateStore();
const pageState = pageStateStore.getRequestToJsPageState;

// Initialize store state on component mount
onMounted(() => {
  pageStateStore.initRequestToJsPage();
});

// State for dialog and editable request data
const showEditDialog = ref(false);
const activeRequestForEditing = ref(null); // Stores { url, method, headersString, bodyString }
const copyButtonText = ref('Copy JSON Output'); // For copy button text

const isOutputEmpty = computed(() => !outputJson.value || outputJson.value.length === 0);

const curlCommand = computed({
  get: () => pageState.value.curlCommandInput,
  set: (value) => {
    pageStateStore.updateCurlCommandInput(value);
    // activeRequestForEditing.value = null; // Optionally reset if cURL changes, forcing re-parse
  }
});
const outputJson = computed({
  get: () => pageState.value.requestOutputJson,
  set: (value) => pageStateStore.updateRequestOutputJson(value)
});

function updateOutputWithActiveRequest(messagePrefix = "Request ready to be sent:") {
  if (activeRequestForEditing.value) {
    const snippets = getCodesByType('request');
    outputJson.value = JSON.stringify({
      message: messagePrefix,
      currentRequestDetails: activeRequestForEditing.value,
      commonCodeSnippets: snippets
    }, null, 2);
  }
}

const processRequest = async () => {
  const snippets = getCodesByType('request');

  // Phase 1: Parsing cURL or using existing activeRequestForEditing
  if (curlCommand.value.trim() && !activeRequestForEditing.value) { // Only parse if cURL is present and no active request
    const parsedCurl = parseCurlCommand(curlCommand.value);
    if (!parsedCurl) {
      outputJson.value = JSON.stringify({ error: "Failed to parse cURL command. Please check the format." }, null, 2);
      activeRequestForEditing.value = null;
      return;
    }
    console.log('Parsed cURL command:', parsedCurl);
    activeRequestForEditing.value = {
      url: parsedCurl.url,
      method: parsedCurl.method,
      headersString: JSON.stringify(parsedCurl.headers || {}, null, 2),
      bodyString: parsedCurl.body || ''
    };
    updateOutputWithActiveRequest("cURL parsed. Request is ready to be edited or sent.");
    return; // Stop here, user can now edit or click "Send Processed Request"
  }

  // Phase 2: "Sending" the request (using data from activeRequestForEditing)
  if (!activeRequestForEditing.value) {
    outputJson.value = JSON.stringify({ error: "No request details to send. Paste a cURL command and process it first." }, null, 2);
    return;
  }

  try {
    let headersObject;
    try {
      headersObject = JSON.parse(activeRequestForEditing.value.headersString || '{}');
    } catch (e) {
      outputJson.value = JSON.stringify({
        error: "Invalid Headers JSON format in the edited request. Please correct it.",
        details: e.message
      }, null, 2);
      return; // Stop processing
    }

    // Actual fetch call to the proxy
    try {
      const proxyEndpoint = '/api/proxy-request';
      const response = await fetch(proxyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: activeRequestForEditing.value.url,
          method: activeRequestForEditing.value.method,
          headers: headersObject, // The parsed headers object
          body: activeRequestForEditing.value.bodyString,
        }),
      });

      if (!response.ok) {
        throw new Error(`Proxy request failed with status: ${response.status}`);
      }

      const proxyResponseData = await response.json();
      // proxyResponseData is expected to be:
      // { originalRequest: {...}, proxyResponse: { status, headers, body }, error: null/message }

      const finalOutput = {
        requestSentToProxy: proxyResponseData.originalRequest || {
            url: activeRequestForEditing.value.url,
            method: activeRequestForEditing.value.method,
            headers: headersObject,
            body: activeRequestForEditing.value.bodyString
        },
        responseFromTarget: proxyResponseData.proxyResponse,
        proxyError: proxyResponseData.error,
        commonCodeSnippets: snippets,
      };
      outputJson.value = JSON.stringify(finalOutput, null, 2);

    } catch (error) {
      console.error('Error during proxy request:', error);
      const finalOutput = {
        requestSentToProxy: {
            url: activeRequestForEditing.value.url,
            method: activeRequestForEditing.value.method,
            headers: headersObject, // Use headersObject here
            body: activeRequestForEditing.value.bodyString
        },
        responseFromTarget: null,
        proxyError: `Failed to fetch from proxy: ${error.message}`,
        commonCodeSnippets: snippets, // snippets was defined at the start of processRequest
      };
      outputJson.value = JSON.stringify(finalOutput, null, 2);
    }
  } // This closing brace was missing in my mental model of the original try block. The overall structure is try { parse headers } catch { handle parse error }, try { fetch } catch { handle fetch error }.
  // The prompt's structure was slightly different: try { overall } catch { overall error }, implying the headers parsing was outside the main try for fetch.
  // My new structure: 
  //   if (!activeRequestForEditing.value) { ... return; }
  //   let headersObject; try {parse} catch {set outputJson; return;}
  //   try {fetch and process} catch {set outputJson;}
  // This seems correct.
};

const handleUpdateRequestFromDialog = (updatedData) => {
  activeRequestForEditing.value = updatedData;
  showEditDialog.value = false; // Close dialog
  updateOutputWithActiveRequest("Request details updated. Ready to be sent.");
};

const clearAllInputs = () => {
  curlCommand.value = ''; // Uses computed setter, updates store
  activeRequestForEditing.value = null;
  outputJson.value = ''; // Uses computed setter, updates store
  copyButtonText.value = 'Copy JSON Output'; // Reset copy button text
};

const copyOutputToClipboard = async () => {
  if (isOutputEmpty.value) return;
  try {
    await navigator.clipboard.writeText(outputJson.value);
    copyButtonText.value = 'Copied!';
    console.log('Output copied to clipboard');
    setTimeout(() => {
      copyButtonText.value = 'Copy JSON Output';
    }, 2000);
  } catch (err) {
    console.error('Failed to copy output: ', err);
    copyButtonText.value = 'Copy Failed';
     setTimeout(() => {
      copyButtonText.value = 'Copy JSON Output';
    }, 2000);
  }
};

</script>

<style scoped>
.pane-header {
  display: flex; /* Added for button alignment */
  align-items: center; /* Added for button alignment */
  padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
  font-weight: bold;
  background-color: var(--bg-tertiary, #f0f0f0);
  border-bottom: 1px solid var(--border-light, #ccc);
}

.action-button {
  margin-top: var(--spacing-md, 10px);
  padding: var(--spacing-sm, 8px) var(--spacing-md, 15px); /* Adjusted to use CSS variables */
  cursor: pointer;
  background-color: var(--btn-primary-bg, #007bff); /* Adjusted to use CSS variables */
  color: var(--btn-primary-text, white); /* Adjusted to use CSS variables */
  border: none;
  border-radius: var(--radius-sm, 4px); /* Adjusted to use CSS variables */
}

.action-button:hover {
  background-color: var(--btn-primary-hover-bg, #0056b3); /* Adjusted to use CSS variables */
}

/* Ensure CodeEditor takes up available space if needed */
/* You might need to inspect how CodeEditor is styled in other components */
</style>
