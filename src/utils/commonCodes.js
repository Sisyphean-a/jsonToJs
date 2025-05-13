export const commonCodes = [
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
