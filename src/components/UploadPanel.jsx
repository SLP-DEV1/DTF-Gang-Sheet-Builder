export default function UploadPanel({
  onUpload,
  onDropFiles,
  onLoadProject,
  onRestoreAutosave,
  onClearAutosave,
}) {
  const handleDrop = (event) => {
    event.preventDefault();
    onDropFiles(event.dataTransfer.files);
  };

  return (
    <section className="panel">
      <h2>Upload</h2>
      <label
        className="dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input type="file" accept="image/png" multiple onChange={onUpload} />
        <span>PNG-Dateien auswählen oder hier ablegen</span>
      </label>
      <div className="button-row">
        <label className="button file-button">
          Projekt laden
          <input type="file" accept="application/json,.json" onChange={onLoadProject} />
        </label>
        <button className="button secondary" type="button" onClick={onRestoreAutosave}>
          Autosave laden
        </button>
      </div>
      <button className="button secondary full" type="button" onClick={onClearAutosave}>
        Autosave löschen
      </button>
    </section>
  );
}
