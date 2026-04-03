const launchProject = (path) => {
  // Open the project in a new tab (or same tab if you prefer)
  window.open(path, '_blank');
  // Optionally update status to "done" instantly
  setStatuses((prev) => ({ ...prev, [path]: "done" }));
};