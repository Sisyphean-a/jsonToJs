// JSON 处理代码片段
const jsonCodes = [
  {
    title: '转义Json字符串',
    code: 'return JSON.parse(json.data)',
  },
  {
    title: '反转义Json字符串',
    code: 'return {"data" : JSON.stringify(json)}',
  },
  {
    title: '提取对象数组中的ID',
    code: 'const list = json.data\n\n' + 'return list.map(item => item.id)\n',
  },
  {
    title: '递归提取数组中的ID',
    code:
      'const son = "children"\n\n' +
      'return json.map(item => {\n' +
      '  if (item[son] && item[son].length > 0) {\n' +
      '    return transform(item[son])\n' +
      '  }\n' +
      '  return item.id\n' +
      '})',
  },
  {
    title: '提取对象数组中的部分元素',
    code:
      'const list = json.data\n' +
      'const keys = ["id", "name"]\n\n' +
      'return list.map(item => {\n' +
      '  const result = {}\n' +
      '  keys.forEach(key => {\n' +
      '    result[key] = item[key]\n' +
      '  })\n' +
      '  return result\n' +
      '})',
  },
  {
    title: '递归提取数组中的部分元素',
    code:
      '// 提取对象数组中的部分元素\n' +
      "const keys = ['id', 'name']\n" +
      '// 递归对象\n' +
      "const son = 'children'\n" +
      '\n' +
      'return json.map(item => {\n' +
      '  if (item[son] && item[son].length > 0) {\n' +
      '    return transform(item[son])\n' +
      '  }\n' +
      '  const result = {}\n' +
      '  keys.forEach(key => {\n' +
      '    result[key] = item[key]\n' +
      '  })\n' +
      '  return result\n' +
      '})',
  },
  {
    title: '过滤数组中的某些为空元素的对象',
    code:
      '// 获取目标数组\n' +
      'const list = json.data\n' +
      'const keys = ["id", "name"]\n\n' +
      'return list.filter(item => {\n' +
      '  return keys.every(key => item[key] !== null && item[key] !== undefined)\n' +
      '})',
  },
  {
    title: '对象数组去重',
    code:
      '// 获取目标对象数组\n' +
      'const list = json.data\n' +
      'const key = "id"\n\n' +
      'const uniqueArray = [...new Map(list.map(item => [item[key], item])).values()]\n' +
      'return uniqueArray',
  },
  {
    title: '对象数组排序',
    code:
      '// 获取目标对象数组 以及排序的key\n' +
      'const list = json.data\n' +
      'const key = "id"\n\n' +
      'return list.sort((a, b) => a[key] - b[key])',
  },
  {
    title: '对象数组分组',
    code:
      '// 获取目标对象数组 以及分组的key\n' +
      'const list = json.data\n' +
      'const groupKey = "category"\n\n' +
      'const grouped = list.reduce((acc, item) => {\n' +
      '  const key = item[groupKey]\n' +
      '  if (!acc[key]) {\n' +
      '    acc[key] = []\n' +
      '  }\n' +
      '  acc[key].push(item)\n' +
      '  return acc\n' +
      '}, {})\n' +
      'return grouped',
  },
  {
    title: '对象数组统计',
    code:
      '// 获取目标对象数组\n' +
      'const list = json.list\n' +
      'const key = "amount"\n\n' +
      'const stats = list.reduce((acc, item) => {\n' +
      '  const value = Number(item[key])\n' +
      '  acc.num += value\n' +
      '  acc.count++\n' +
      '  if (value > acc.max || acc.count === 1) acc.max = value\n' +
      '  if (value < acc.min || acc.count === 1) acc.min = value\n' +
      '  return acc\n' +
      '}, { num: 0, count: 0, max: 0, min: 0 })\n\n' +
      'return {\n' +
      '  stats: {\n' +
      '    ...stats,\n' +
      '    average: stats.count ? stats.num / stats.count : 0,\n' +
      '  }\n' +
      '}',
  },
]

// HTML 处理代码片段
const htmlCodes = [
  {
    title: '基础DOM操作模板',
    code:
      '// 创建虚拟DOM环境\n' +
      'const parser = new DOMParser()\n' +
      'const doc = parser.parseFromString(html, "text/html")\n\n' +
      '// 在这里进行DOM操作\n' +
      '// 例如：doc.querySelector("div")\n' +
      '// 例如：doc.getElementsByTagName("p")\n\n' +
      '// 返回处理后的HTML字符串\n' +
      'return doc.documentElement.outerHTML',
  },
  {
    title: '提取所有指定标签的内容',
    code:
      '// 创建虚拟DOM环境\n' +
      'const parser = new DOMParser()\n' +
      'const doc = parser.parseFromString(html, "text/html")\n\n' +
      '// 提取所有p标签的文本内容\n' +
      'const elements = doc.getElementsByTagName("p")\n' +
      'const contents = Array.from(elements).map(el => el.textContent)\n\n' +
      '// 创建新的HTML结构\n' +
      'const result = contents.map(content => `<div>${content}</div>`).join("")\n' +
      'return result',
  },
  {
    title: '修改所有元素的class属性',
    code:
      '// 创建虚拟DOM环境\n' +
      'const parser = new DOMParser()\n' +
      'const doc = parser.parseFromString(html, "text/html")\n\n' +
      '// 获取所有有class属性的元素\n' +
      'const elements = doc.querySelectorAll("[class]")\n' +
      'elements.forEach(el => {\n' +
      '  // 添加新的class\n' +
      '  el.className = "new-class " + el.className\n' +
      '  // 或者完全替换class\n' +
      '  // el.className = "new-class"\n' +
      '})\n\n' +
      '// 返回处理后的HTML\n' +
      'return doc.documentElement.outerHTML',
  },
  {
    title: '删除指定标签的所有元素',
    code:
      '// 创建虚拟DOM环境\n' +
      'const parser = new DOMParser()\n' +
      'const doc = parser.parseFromString(html, "text/html")\n\n' +
      '// 删除所有script标签\n' +
      'const elementsToRemove = doc.getElementsByTagName("script")\n' +
      'Array.from(elementsToRemove).forEach(el => el.remove())\n\n' +
      '// 删除所有style标签\n' +
      'const stylesToRemove = doc.getElementsByTagName("style")\n' +
      'Array.from(stylesToRemove).forEach(el => el.remove())\n\n' +
      '// 返回处理后的HTML\n' +
      'return doc.documentElement.outerHTML',
  },
  {
    title: '修改所有链接的href属性',
    code:
      '// 创建虚拟DOM环境\n' +
      'const parser = new DOMParser()\n' +
      'const doc = parser.parseFromString(html, "text/html")\n\n' +
      '// 获取所有a标签\n' +
      'const links = doc.getElementsByTagName("a")\n' +
      'Array.from(links).forEach(link => {\n' +
      '  const currentHref = link.getAttribute("href")\n' +
      '  if (currentHref) {\n' +
      '    // 添加前缀\n' +
      '    link.setAttribute("href", "https://example.com" + currentHref)\n' +
      '    // 添加target="_blank"\n' +
      '    link.setAttribute("target", "_blank")\n' +
      '  }\n' +
      '})\n\n' +
      '// 返回处理后的HTML\n' +
      'return doc.documentElement.outerHTML',
  },
  {
    title: '提取所有图片的src属性',
    code:
      '// 创建虚拟DOM环境\n' +
      'const parser = new DOMParser()\n' +
      'const doc = parser.parseFromString(html, "text/html")\n\n' +
      '// 获取所有img标签的src\n' +
      'const images = doc.getElementsByTagName("img")\n' +
      'const imageSrcs = Array.from(images).map(img => img.getAttribute("src"))\n' +
      '.filter(src => src) // 过滤空值\n\n' +
      '// 创建图片列表HTML\n' +
      'const imageList = imageSrcs.map(src => \n' +
      '  `<div class="image-item"><img src="${src}" alt="image" /></div>`\n' +
      ').join("")\n\n' +
      'return `<div class="image-gallery">${imageList}</div>`',
  },
  {
    title: '清理HTML内容（移除样式和脚本）',
    code:
      '// 创建虚拟DOM环境\n' +
      'const parser = new DOMParser()\n' +
      'const doc = parser.parseFromString(html, "text/html")\n\n' +
      '// 移除所有style属性\n' +
      'const elementsWithStyle = doc.querySelectorAll("[style]")\n' +
      'elementsWithStyle.forEach(el => el.removeAttribute("style"))\n\n' +
      '// 移除所有script标签\n' +
      'const scripts = doc.getElementsByTagName("script")\n' +
      'Array.from(scripts).forEach(el => el.remove())\n\n' +
      '// 移除所有style标签\n' +
      'const styles = doc.getElementsByTagName("style")\n' +
      'Array.from(styles).forEach(el => el.remove())\n\n' +
      '// 移除所有事件属性（onclick等）\n' +
      'const allElements = doc.getElementsByTagName("*")\n' +
      'Array.from(allElements).forEach(el => {\n' +
      '  Array.from(el.attributes).forEach(attr => {\n' +
      '    if (attr.name.startsWith("on")) {\n' +
      '      el.removeAttribute(attr.name)\n' +
      '    }\n' +
      '  })\n' +
      '})\n\n' +
      '// 返回清理后的HTML\n' +
      'return doc.documentElement.outerHTML',
  },
  {
    title: '替换所有文本内容',
    code:
      '// 创建虚拟DOM环境\n' +
      'const parser = new DOMParser()\n' +
      'const doc = parser.parseFromString(html, "text/html")\n\n' +
      '// 定义替换规则\n' +
      'const replaceMap = {\n' +
      '  "旧文本": "新文本",\n' +
      '  "old": "new"\n' +
      '}\n\n' +
      '// 递归遍历所有文本节点\n' +
      'function replaceTextNodes(node) {\n' +
      '  if (node.nodeType === Node.TEXT_NODE) {\n' +
      '    let text = node.textContent\n' +
      '    Object.keys(replaceMap).forEach(oldText => {\n' +
      '      text = text.replace(new RegExp(oldText, "g"), replaceMap[oldText])\n' +
      '    })\n' +
      '    node.textContent = text\n' +
      '  } else {\n' +
      '    Array.from(node.childNodes).forEach(child => {\n' +
      '      replaceTextNodes(child)\n' +
      '    })\n' +
      '  }\n' +
      '}\n\n' +
      'replaceTextNodes(doc.documentElement)\n\n' +
      '// 返回处理后的HTML\n' +
      'return doc.documentElement.outerHTML',
  },
  {
    title: '添加wrapper容器',
    code:
      '// 创建虚拟DOM环境\n' +
      'const parser = new DOMParser()\n' +
      'const doc = parser.parseFromString(html, "text/html")\n\n' +
      '// 获取body内容\n' +
      'const bodyContent = doc.body ? doc.body.innerHTML : html\n\n' +
      '// 创建wrapper\n' +
      'const wrapper = `\n' +
      '<div class="wrapper">\n' +
      '  <div class="container">\n' +
      '    ${bodyContent}\n' +
      '  </div>\n' +
      '</div>`\n\n' +
      'return wrapper',
  }
];

// Request 处理代码片段
const requestCodes = [
  {
    title: 'Basic Fetch GET Request',
    code:
`async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json(); // or response.text(), response.blob() etc.
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}`
  },
  {
    title: 'Fetch POST Request (JSON)',
    code:
`async function postData(url, bodyData) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Add other headers here if needed (e.g., Authorization)
      },
      body: JSON.stringify(bodyData)
    });
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    console.log('Success:', data);
    return data;
  } catch (error) {
    console.error('Error posting data:', error);
  }
}`
  },
  {
    title: 'Fetch with Custom Headers',
    code:
`async function fetchDataWithHeaders(url, customHeaders) {
  try {
    const response = await fetch(url, {
      method: 'GET', // Or any other method
      headers: {
        ...customHeaders, // Spread your custom headers object
        'X-Custom-Header': 'value' // Example of another header
      }
    });
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}`
  },
  {
    title: 'Handling Different Response Types',
    code:
`async function fetchDataAdvanced(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType && contentType.includes('text/html')) {
      data = await response.text();
    } else if (contentType && contentType.includes('image/')) {
      data = await response.blob();
      // Create an object URL to display the image
      // const imageUrl = URL.createObjectURL(data);
      // document.getElementById('myImageElement').src = imageUrl;
    } else {
      data = await response.text(); // Default to text
    }
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}`
  }
];


// 根据类型获取代码片段
export const getCodesByType = (type) => {
  switch (type) {
    case 'json':
      return jsonCodes
    case 'html':
      return htmlCodes
    case 'request': // Added case for request codes
      return requestCodes
    default:
      return jsonCodes // Default to jsonCodes if type is unknown
  }
}

// 保持向后兼容
export const commonCodes = jsonCodes
