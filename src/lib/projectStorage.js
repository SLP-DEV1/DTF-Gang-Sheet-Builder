export function createProjectPayload(sheetSettings, items, extras = {}) {
  return {
    version: 2,
    savedAt: new Date().toISOString(),
    sheetSettings,
    ...extras,
    items: items.map((item) => ({
      id: item.id,
      groupKey: item.groupKey,
      name: item.name,
      src: item.src,
      originalWidth: item.originalWidth,
      originalHeight: item.originalHeight,
      width: item.width,
      height: item.height,
      x: item.x,
      y: item.y,
      scaleX: item.scaleX,
      scaleY: item.scaleY,
      rotation: item.rotation,
    })),
  };
}

export function downloadProjectJson(project) {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'dtf-gang-sheet-project.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function readProjectFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const project = JSON.parse(reader.result);
        if (!project || ![1, 2].includes(project.version) || !Array.isArray(project.items)) {
          reject(new Error('Die Projektdatei ist nicht kompatibel.'));
          return;
        }
        resolve(project);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
