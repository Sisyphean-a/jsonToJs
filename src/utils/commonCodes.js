export const commonCodes = [
  {
    title: '提取对象数组中的ID',
    code:
      'const obj = json.data\n' +
      'return obj.map(item => {\n' +
      '  return { id: item.id }\n' +
      '})',
  },
  {
    title: '过滤数组中的空值',
    code: 'return json.data.filter(item => item !== null && item !== undefined)',
  },
  {
    title: '对象数组去重',
    code:
      'const uniqueArray = [...new Map(json.data.map(item => [item.id, item])).values()]' +
      '\n' +
      'return uniqueArray',
  },
  {
    title: '对象数组排序',
    code: 'return json.data.sort((a, b) => a.id - b.id)',
  },
  {
    title: '对象数组分组',
    code:
      'const grouped = json.data.reduce((acc, item) => {\n' +
      '  const key = item.category\n' +
      '  if (!acc[key]) {\n' +
      '    acc[key] = []\n' +
      '  acc[key].push(item)\n' +
      '  return acc\n' +
      '}, {})\n' +
      'return grouped',
  },
  {
    title: '对象数组统计',
    code:
      'const stats = json.data.reduce((acc, item) => {\n' +
      '  acc.total += item.value\n' +
      '  acc.count++\n' +
      '  return acc\n' +
      '}, { total: 0, count: 0 })\n' +
      'return {\n' +
      '  ...json,\n' +
      '  stats: {\n' +
      '    ...stats,\n' +
      '    average: stats.total / stats.count\n' +
      '  }\n' +
      '}',
  },
  {
    title: '对象数组计算指定值总和',
    code:
      'const stats = json.list.reduce((acc, item) => {\n' +
      '  const amount = Number(item.amount);\n' +
      '  acc.num += amount;\n' +
      '  acc.count++;\n' +
      '  if (amount > acc.max || acc.count === 1) acc.max = amount;\n' +
      '  if (amount < acc.min || acc.count === 1) acc.min = amount;\n' +
      '  return acc;\n' +
      '}, { num: 0, count: 0, max: 0, min: 0 });\n' +
      '\n' +
      'return {\n' +
      '  stats: {\n' +
      '    total: stats.num,\n' +
      '    count: stats.count,\n' +
      '    average: stats.count ? stats.num / stats.count : 0,\n' +
      '    max: stats.max,\n' +
      '    min: stats.min\n' +
      '  }\n' +
      '}',
  },
]
