export const groupItemsByCategory = (items) => {
  return items.reduce((acc, item) => {
    const catId = item.category || 'uncategorized';
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(item);
    return acc;
  }, {});
};

export const getCategoryName = (catId, categories) => {
  if (catId === 'uncategorized') return 'Uncategorized';
  const cat = categories.find(c => c._id === catId || c.id === catId);
  return cat ? cat.name : 'Unknown Category';
};
