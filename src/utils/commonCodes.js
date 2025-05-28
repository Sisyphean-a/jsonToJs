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
  },
]

// Request 处理代码片段
const requestCodes = [
  {
    title: '基础 GET 请求',
    code:
      '// 基础的 GET 请求示例\n' +
      '// 你可以修改 URL 和 headers\n' +
      "request.url = 'https://jsonplaceholder.typicode.com/posts/1'\n" +
      "request.method = 'GET'\n" +
      "request.headers['Accept'] = 'application/json'\n\n" +
      'return request',
  },
  {
    title: '添加认证头',
    code:
      '// 添加 Authorization 头部\n' +
      "request.headers['Authorization'] = 'Bearer your-token-here'\n\n" +
      '// 或者使用 API Key\n' +
      "// request.headers['X-API-Key'] = 'your-api-key'\n\n" +
      'return request',
  },
  {
    title: 'POST 请求发送 JSON 数据',
    code:
      '// 设置为 POST 请求并发送 JSON 数据\n' +
      "request.method = 'POST'\n" +
      "request.headers['Content-Type'] = 'application/json'\n\n" +
      '// 设置请求体\n' +
      'request.body = JSON.stringify({\n' +
      "  title: '测试标题',\n" +
      "  body: '测试内容',\n" +
      '  userId: 1\n' +
      '})\n\n' +
      'return request',
  },
  {
    title: '修改请求 URL 参数',
    code:
      '// 解析当前 URL 并添加查询参数\n' +
      'const url = new URL(request.url)\n' +
      "url.searchParams.set('page', '1')\n" +
      "url.searchParams.set('limit', '10')\n" +
      "url.searchParams.set('sort', 'created_at')\n\n" +
      'request.url = url.toString()\n\n' +
      'return request',
  },
  {
    title: '设置自定义 User-Agent',
    code:
      '// 设置自定义 User-Agent\n' +
      "request.headers['User-Agent'] = 'MyApp/1.0 (Custom Bot)'\n\n" +
      '// 添加其他常用头部\n' +
      "request.headers['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8'\n" +
      "request.headers['Cache-Control'] = 'no-cache'\n\n" +
      'return request',
  },
  {
    title: '发送表单数据',
    code:
      '// 设置为 POST 请求并发送表单数据\n' +
      "request.method = 'POST'\n" +
      "request.headers['Content-Type'] = 'application/x-www-form-urlencoded'\n\n" +
      '// 构建表单数据\n' +
      'const formData = new URLSearchParams()\n' +
      "formData.append('username', 'testuser')\n" +
      "formData.append('password', 'testpass')\n" +
      "formData.append('remember', 'true')\n\n" +
      'request.body = formData.toString()\n\n' +
      'return request',
  },
  {
    title: '条件修改请求',
    code:
      '// 根据 URL 条件修改请求\n' +
      "if (request.url.includes('api.github.com')) {\n" +
      '  // GitHub API 需要特殊的 Accept 头\n' +
      "  request.headers['Accept'] = 'application/vnd.github.v3+json'\n" +
      "  request.headers['User-Agent'] = 'MyApp/1.0'\n" +
      "} else if (request.url.includes('jsonplaceholder')) {\n" +
      '  // JSONPlaceholder 测试 API\n' +
      "  request.headers['Accept'] = 'application/json'\n" +
      '}\n\n' +
      '// 为所有请求添加时间戳\n' +
      'const url = new URL(request.url)\n' +
      "url.searchParams.set('_t', Date.now().toString())\n" +
      'request.url = url.toString()\n\n' +
      'return request',
  },
  {
    title: '请求重试逻辑',
    code:
      '// 添加重试标识（这只是示例，实际重试需要在外部实现）\n' +
      "request.headers['X-Retry-Count'] = '3'\n" +
      "request.headers['X-Timeout'] = '5000'\n\n" +
      '// 添加请求ID用于追踪\n' +
      "request.headers['X-Request-ID'] = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)\n\n" +
      'return request',
  },
]

// 根据类型获取代码片段
export const getCodesByType = (type) => {
  switch (type) {
    case 'json':
      return jsonCodes
    case 'html':
      return htmlCodes
    case 'request':
      return requestCodes
    default:
      return jsonCodes
  }
}

// 保持向后兼容
export const commonCodes = jsonCodes
