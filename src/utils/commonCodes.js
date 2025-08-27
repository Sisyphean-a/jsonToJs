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
  // {
  //   title: '递归提取数组中的ID',
  //   code:
  //     'const son = "children"\n\n' +
  //     'return json.map(item => {\n' +
  //     '  if (item[son] && item[son].length > 0) {\n' +
  //     '    return transform(item[son])\n' +
  //     '  }\n' +
  //     '  return item.id\n' +
  //     '})',
  // },
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
  // {
  //   title: '递归提取数组中的部分元素',
  //   code:
  //     '// 提取对象数组中的部分元素\n' +
  //     "const keys = ['id', 'name']\n" +
  //     '// 递归对象\n' +
  //     "const son = 'children'\n" +
  //     '\n' +
  //     'return json.map(item => {\n' +
  //     '  if (item[son] && item[son].length > 0) {\n' +
  //     '    return transform(item[son])\n' +
  //     '  }\n' +
  //     '  const result = {}\n' +
  //     '  keys.forEach(key => {\n' +
  //     '    result[key] = item[key]\n' +
  //     '  })\n' +
  //     '  return result\n' +
  //     '})',
  // },
  {
    title: '无视层级获取对象中指定元素的值',
    code:
      '// 要获取的目标元素\n' +
      'const objList = ["_tag", "_text"]\n\n' +
      'const getValues = (obj, key) => {\n' +
      '  return Object.entries(obj).flatMap(([k, v]) =>\n' +
      '    k === key\n' +
      '      ? [v]\n' +
      '      : Array.isArray(v)\n' +
      '        ? v.flatMap(o => getValues(o, key))\n' +
      '        : typeof v === "object" && v !== null\n' +
      '          ? getValues(v, key)\n' +
      '          : []\n' +
      '  )\n' +
      '}\n\n' +
      'return objList.reduce((acc, current) => {\n' +
      '  acc[current] = getValues(json, current)\n' +
      '  return acc\n' +
      '}, {})',
  },
  // {
  //   title: '过滤数组中的某些为空元素的对象',
  //   code:
  //     '// 获取目标数组\n' +
  //     'const list = json.data\n' +
  //     'const keys = ["id", "name"]\n\n' +
  //     'return list.filter(item => {\n' +
  //     '  return keys.every(key => item[key] !== null && item[key] !== undefined)\n' +
  //     '})',
  // },
  // {
  //   title: '对象数组去重',
  //   code:
  //     '// 获取目标对象数组\n' +
  //     'const list = json.data\n' +
  //     'const key = "id"\n\n' +
  //     'const uniqueArray = [...new Map(list.map(item => [item[key], item])).values()]\n' +
  //     'return uniqueArray',
  // },
  // {
  //   title: '对象数组排序',
  //   code:
  //     '// 获取目标对象数组 以及排序的key\n' +
  //     'const list = json.data\n' +
  //     'const key = "id"\n\n' +
  //     'return list.sort((a, b) => a[key] - b[key])',
  // },
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
  {
    title: '常用jsonpath功能（jsonpath已导入）',
    code:
      '// $      - 根对象/元素 (查询起点)\n' +
      '// @      - 当前处理的对象 (常用于过滤条件中)\n' +
      '// .      - 直接子元素 (等价于 obj.key)\n' +
      "// []     - 子元素访问 (支持数组索引/key名称，如 [0] 或 ['name'])\n" +
      '// ..     - 递归查找所有层级 (深度搜索)\n' +
      '// *      - 通配符 (匹配任意属性/数组元素)\n' +
      "// [,]    - 多选操作符 (如 ['name','age'] 选择多个字段)\n" +
      '// [start:end:step] - 数组切片 (类似Python切片语法)\n' +
      '// ?()    - 过滤表达式 (如 [?(@.price > 10)])\n' +
      '// ()     - 脚本表达式 (支持JavaScript表达式)\n\n' +
      '// 示例：\n' +
      '// $..price          - 查找所有层级的price字段\n' +
      '// $.store.book[0]   - 获取store下book数组的第一个元素\n' +
      '// $..book[?(@.isbn)] - 查找所有包含isbn字段的book对象\n\n' +
      "const idList = jsonpath.query(json, '$..id')\n\n" +
      'return idList',
  },
]

// 根据类型获取代码片段
export const getCodesByType = (type) => {
  switch (type) {
    case 'json':
      return jsonCodes
    default:
      return jsonCodes
  }
}

// 保持向后兼容
export const commonCodes = jsonCodes
