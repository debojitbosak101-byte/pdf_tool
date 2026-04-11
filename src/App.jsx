import { useState } from 'react';
import { addLetterheadToInvoice } from './pdfGenerator';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a valid PDF file.');
      setFile(null);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;

          const pdfBytes = await addLetterheadToInvoice(arrayBuffer);

          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = `Final_Invoice.pdf`;
          link.click();

          window.URL.revokeObjectURL(url);
        } catch (err) {
          console.error(err);
          setError('Error processing PDF.');
        } finally {
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError('Error reading file.');
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel">
      <h1>Tally Invoice Letterhead Tool</h1>

      <p style={{ color: '#ccc' }}>
        Upload your Tally PDF and add company letterhead automatically.
      </p>

      <div className="upload-area">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload"
        />

        <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
          {file ? (
            <div style={{ color: '#4ade80' }}>
              📄 {file.name} ready
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '40px' }}>📥</div>
              Click to upload PDF
            </div>
          )}
        </label>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleGenerate} disabled={!file || loading}>
        {loading ? 'Processing...' : 'Generate Invoice'}
      </button>
    </div>
  );
}

export default App;