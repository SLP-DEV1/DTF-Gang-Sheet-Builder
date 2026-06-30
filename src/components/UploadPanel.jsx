export default function UploadPanel({ onUpload, onLoadProject }) {
  return (
    <section className="panel">
      <h2>Upload</h2>
      <label className="dropzone">
        <input type="file" accept="image/png" multiple onChange={onUpload} />
        <span>PNG-Dateien auswählen</span>
      </label>
      <label className="button file-button">
        Projekt laden
        <input type="file" accept="application/json,.json" onChange={onLoadProject} />
      </label>
    </section>
  );
}
