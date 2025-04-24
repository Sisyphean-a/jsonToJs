export const commonCodes = [
  {
    title: '提取对象数组中的ID',
    code: `const obj = json.data\n\nreturn obj.map(item => {\n  return { id: item.id }\n})`,
  },
  {
    title: '过滤数组中的空值',
    code: `return json.data.filter(item => item !== null && item !== undefined)`,
  },
  {
    title: '对象数组去重',
    code: `const uniqueArray = [...new Map(json.data.map(item => [item.id, item])).values()]\nreturn uniqueArray`,
  },
  {
    title: '对象数组排序',
    code: `return json.data.sort((a, b) => a.id - b.id)`,
  },
  {
    title: '对象数组分组',
    code: `const grouped = json.data.reduce((acc, item) => {\n  const key = item.category\n  if (!acc[key]) {\n    acc[key] = []\n  }\n  acc[key].push(item)\n  return acc\n}, {})\nreturn grouped`,
  },
  {
    title: '对象数组统计',
    code: `const stats = json.data.reduce((acc, item) => {\n  acc.total += item.value\n  acc.count++\n  return acc\n}, { total: 0, count: 0 })\nreturn {\n  ...json,\n  stats: {\n    ...stats,\n    average: stats.total / stats.count\n  }\n}`,
  },
]
