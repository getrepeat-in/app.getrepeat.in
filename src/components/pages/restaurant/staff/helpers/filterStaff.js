export const filterStaffList = (staffList, { statusFilter = "all", searchQuery = "" } = {}) => {
  if (!Array.isArray(staffList)) return [];

  let data = staffList;

  if (statusFilter && statusFilter !== "all") {
    data = data.filter((s) => s.status === statusFilter);
  }

  const query = searchQuery?.trim()?.toLowerCase();
  if (query) {
    data = data.filter(
      (s) =>
        s.name?.toLowerCase().includes(query) ||
        s.email?.toLowerCase().includes(query) ||
        s.phone?.includes(query) ||
        s.role?.name?.toLowerCase().includes(query)
    );
  }

  return data;
};
