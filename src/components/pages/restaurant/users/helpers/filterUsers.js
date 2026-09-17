export const filterUsersList = (userList, { statusFilter = "all", searchQuery = "" } = {}) => {
  if (!Array.isArray(userList)) return [];

  let data = userList;

  if (statusFilter && statusFilter !== "all") {
    data = data.filter((u) => u.status === statusFilter);
  }

  const query = searchQuery?.trim()?.toLowerCase();
  if (query) {
    data = data.filter(
      (u) =>
        u.name?.toLowerCase().includes(query) ||
        u.phone?.includes(query)
    );
  }

  return data;
};
