export const getAppData = () => {
  const data = localStorage.getItem('appData');
  if (!data) return null;

  const parsed = JSON.parse(data);
  const now = new Date().getTime();

  if (now > parsed.expiry) {
    localStorage.removeItem('appData');
    return null;
  }

  return parsed;
};
