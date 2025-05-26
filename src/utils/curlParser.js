/**
 * Parses a cURL command string (typically from "Copy as cURL") into an object
 * containing the URL, method, headers, and body.
 *
 * @param {string} curlCommandString The cURL command string.
 * @returns {{url: string, method: string, headers: Record<string, string>, body: string|null}|null}
 *          An object with parsed request details, or null if parsing fails or command is not a cURL command.
 */
export function parseCurlCommand(curlCommandString) {
  if (!curlCommandString || typeof curlCommandString !== 'string') {
    console.error('Invalid curl command string provided.');
    return null;
  }

  // Normalize the command: remove escaped newlines and actual newlines, then trim
  let command = curlCommandString.replace(/\\\r?\n/g, ' ').replace(/\r?\n/g, ' ').trim();

  if (!command.startsWith('curl ')) {
    console.error('Not a valid cURL command.');
    return null;
  }

  // Remove 'curl ' from the beginning
  command = command.substring(5).trim();

  let url = '';
  let method = 'GET'; // Default method
  const headers = {};
  let bodyParts = []; // Use array to collect data parts

  // --- URL Extraction ---
  // The URL is usually the first argument that doesn't start with '-' and is not an option's value.
  // It might be quoted.
  // Simplified: find the first argument that is a valid URL.
  // This regex looks for a quoted string or an unquoted string starting with http/https
  // It tries to be careful not to grab options like -L http://... as the URL itself but its argument.
  const urlRegex = /(?:^|\s)(['"]?)(https?:\/\/[^\s'"<>]+)\1(?=\s|$)/;
  const urlMatch = command.match(urlRegex);
  if (urlMatch && urlMatch[2]) {
    url = urlMatch[2];
    // Remove the URL from the command string to simplify further parsing
    command = command.replace(urlMatch[0], ' ').trim();
  } else {
    // Fallback: Look for the first non-option argument that looks like a URL
    const parts = command.split(/\s+/);
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('http://') || part.startsWith('https://')) {
        // Ensure it's not an argument to an option like -o, -L, etc.
        if (i === 0 || !parts[i-1].startsWith('-')) {
          url = part;
          // Remove URL from command (less precise than regex match, but works for simple cases)
          const tempParts = command.split(url);
          command = tempParts.length > 1 ? tempParts.slice(1).join(url).trim() : tempParts[0].trim();
          break;
        }
      } else if (part.startsWith("'") && part.endsWith("'") || part.startsWith('"') && part.endsWith('"')) {
        const potentialUrl = part.slice(1, -1);
        if (potentialUrl.startsWith('http://') || potentialUrl.startsWith('https://')) {
           if (i === 0 || !parts[i-1].startsWith('-')) {
            url = potentialUrl;
            const tempParts = command.split(part);
            command = tempParts.length > 1 ? tempParts.slice(1).join(part).trim() : tempParts[0].trim();
            break;
           }
        }
      }
    }
  }

  if (!url) {
    console.error('Could not parse URL from cURL command.');
    return null;
  }

  // --- Method Extraction ---
  // Regex: \s-(X|request)\s+(['"]?)(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\2
  // The \2 ensures matching quotes if any.
  const methodRegex = /\s-(?:X|request)\s+(['"]?)(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\1/i;
  const methodMatchResult = command.match(methodRegex);
  if (methodMatchResult) {
    method = methodMatchResult[2].toUpperCase();
    command = command.replace(methodMatchResult[0], ' ').trim(); // Remove to avoid re-parsing
  }

  // --- Headers Extraction ---
  // Regex: \s-(H|header)\s+(['"])(.*?(:.*?))\2
  // (['"]) captures the quote, (.*?) captures content, \2 matches the opening quote.
  // (.*?(:.*?)) ensures there's a colon in the header value.
  const headerRegex = /\s-(?:H|header)\s+(['"])([^'"]+)\1/g;
  let headerMatch;
  while ((headerMatch = headerRegex.exec(command)) !== null) {
    const headerLine = headerMatch[2];
    const colonIndex = headerLine.indexOf(':');
    if (colonIndex > 0) {
      const name = headerLine.substring(0, colonIndex).trim();
      const value = headerLine.substring(colonIndex + 1).trim();
      if (name && value) { // Ensure both name and value are non-empty
        headers[name] = value;
      }
    }
  }
  // Remove header options from command string to simplify body parsing
  command = command.replace(headerRegex, ' ').trim();


  // --- Body Extraction ---
  // Prioritize --data-raw. If present, other --data or -d are typically ignored by curl or have special meaning.
  // For browser "Copy as cURL", multiple data fields for typical POST (like form data) are usually combined
  // into one --data-raw (for JSON) or multiple --data-urlencode fields (for x-www-form-urlencoded).
  // This parser will focus on --data-raw, then --data/--data-binary/-d.
  // It will concatenate multiple occurrences of --data / -d.

  const dataRawRegex = /\s--data-raw\s+(['"])(.*?)\1/;
  const dataRawMatchResult = command.match(dataRawRegex);
  if (dataRawMatchResult) {
    bodyParts.push(dataRawMatchResult[2]);
    command = command.replace(dataRawMatchResult[0], ' ').trim();
  } else {
    const dataRegex = /\s-(?:d|data|data-binary)\s+(['"])(.*?)\1/g;
    let dataMatch;
    while ((dataMatch = dataRegex.exec(command)) !== null) {
      bodyParts.push(dataMatch[2]);
    }
    // Remove all data options from command
    command = command.replace(dataRegex, ' ').trim();
  }
  
  const body = bodyParts.length > 0 ? bodyParts.join('&') : null; // Simple join with '&', common for x-www-form-urlencoded

  // If method was not explicitly set to something other than GET, infer from body presence
  if (method === 'GET' && body !== null) {
    method = 'POST';
  }
  
  // Ignore other options like --compressed, -i, -s, -L etc. by not parsing them.
  // The remaining `command` string would contain these if they weren't processed.

  return {
    url,
    method,
    headers,
    body,
  };
}
