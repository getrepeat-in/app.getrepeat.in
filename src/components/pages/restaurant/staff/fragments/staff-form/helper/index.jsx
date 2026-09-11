export const getEmailPrefix = (email) => {
    if (!email) return "";
    return email.split('@')[0];
};
