export const commonCodes = [
  {
    title: '提取对象数组中的ID',
    code: `const obj = json.data
return obj.map(item => {
  return { id: item.id }
})`,
  },
  {
    title: '过滤数组中的空值',
    code: `return json.data.filter(item => item !== null && item !== undefined)`,
  },
  {
    title: '对象数组去重',
    code: `const uniqueArray = [...new Map(json.data.map(item => [item.id, item])).values()]
return uniqueArray`,
  },
  {
    title: '对象数组排序',
    code: `return json.data.sort((a, b) => a.id - b.id)`,
  },
  {
    title: '对象数组分组',
    code: `const grouped = json.data.reduce((acc, item) => {
  const key = item.category
  if (!acc[key]) {
    acc[key] = []
  }
  acc[key].push(item)
  return acc
}, {})
return grouped`,
  },
  {
    title: '对象数组统计',
    code: `const stats = json.data.reduce((acc, item) => {
  acc.total += item.value
  acc.count++
  return acc
}, { total: 0, count: 0 })
return {
  ...json,
  stats: {
    ...stats,
    average: stats.total / stats.count
  }
}`,
  },
  {
    title: '对象数组计算指定值总和',
    code: `const stats = json.list.reduce((acc, item) => {
  const amount = Number(item.amount);
  acc.num += amount;
  acc.count++;
  if (amount > acc.max || acc.count === 1) acc.max = amount;
  if (amount < acc.min || acc.count === 1) acc.min = amount;
  return acc;
}, { num: 0, count: 0, max: 0, min: 0 });

return {
  stats: {
    total: stats.num,
    count: stats.count,
    average: stats.count ? stats.num / stats.count : 0,
    max: stats.max,
    min: stats.min
  }
};`,
  },
]
