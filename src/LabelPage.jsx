import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateLabelPDF } from './pdfGenerator';

const quotes = [
  "Music is the universal language of mankind. - Henry Wadsworth Longfellow",
  "Without music, life would be a mistake. - Friedrich Nietzsche",
  "Music expresses that which cannot be put into words. - Victor Hugo",
  "The only truth is music. - Jack Kerouac",
  "Music is the art of thinking with sounds. - Jules Combarieu",
  "Philosophy is the highest music. - Plato",
  "Music is the movement of sound to reach the soul for the education of its virtue. - Plato",
  "The aim and final end of all music should be none other than the glory of God. - J.S. Bach",
  "Music is the poetry of the air. - Jean Paul Richter",
  "To live is to be musical, starting with the blood dancing in your veins. - Joseph Campbell",
  "An artist never really finishes his work; he merely abandons it. - Satyajit Ray",
  "Cinema is a mirror by which we often see ourselves. - Satyajit Ray",
  "A story should have a beginning, a middle and an end, but not necessarily in that order. - Satyajit Ray",
  "An artist’s only concern is to shoot for some kind of perfection, and on his own terms, not anyone else’s. - J.D. Salinger",
  "The purpose of art is washing the dust of daily life off our souls. - Pablo Picasso",
  "Art enables us to find ourselves and lose ourselves at the same time. - Thomas Merton",
  "Music is the shorthand of emotion. - Leo Tolstoy",
  "The piano keys are black and white but they sound like a million colors in your mind. - Maria Cristina Mena",
  "The guitar is a small orchestra. It is polyphonic. Every string is a different color, a different voice. - Andrés Segovia",
  "To play a wrong note is insignificant; to play without passion is inexcusable. - Ludwig van Beethoven",
  "Music can change the world because it can change people. - Bono",
  "In order to be irreplaceable one must always be different. - Coco Chanel",
  "Great art picks up where nature ends. - Marc Chagall",
  "Art should comfort the disturbed and disturb the comfortable. - Cesar A. Cruz",
  "The job of the artist is always to deepen the mystery. - Francis Bacon",
  "There is no greater agony than bearing an untold story inside you. - Maya Angelou",
  "Art is the only way to run away without leaving home. - Twyla Tharp",
  "When words fail, music speaks. - Hans Christian Andersen",
  "Music is the divine way to tell beautiful, poetic things to the heart. - Pablo Casals",
  "The artist must train not only his eye but also his soul. - Wassily Kandinsky",
  "Creativity takes courage. - Henri Matisse",
  "The world always seems brighter when you’ve just made something that wasn’t there before. - Neil Gaiman",
  "You can’t use up creativity. The more you use, the more you have. - Maya Angelou",
  "Art is the lie that enables us to realize the truth. - Pablo Picasso",
  "A painter should begin every canvas with a wash of black, because all things in nature are dark except where exposed by the light. - Leonardo da Vinci",
  "Music is a moral law. It gives soul to the universe, wings to the mind, flight to the imagination. - Plato",
  "Music produces a kind of pleasure which human nature cannot do without. - Confucius",
  "To practice any art, no matter how well or badly, is a way to make your soul grow. - Kurt Vonnegut",
  "An artist is not paid for his labor but for his vision. - James Whistler",
  "The essence of all beautiful art, all great art, is gratitude. - Friedrich Nietzsche",
  "Without art, the crudeness of reality would make the world unbearable. - George Bernard Shaw",
  "Art is the most intense mode of individualism that the world has known. - Oscar Wilde",
  "Music is the literature of the heart; it commences where speech ends. - Alphonse de Lamartine",
  "Music is the universal solvent of the soul. - Henry Wadsworth Longfellow",
  "The object of art is not to reproduce reality, but to create a reality of the same intensity. - Alberto Giacometti",
  "In art, the hand can never execute anything higher than the heart can imagine. - Ralph Waldo Emerson",
  "The only thing better than singing is more singing. - Ella Fitzgerald",
  "The artist sees what others only catch a glimpse of. - Leonardo da Vinci",
  "Art is not what you see, but what you make others see. - Edgar Degas",
  "Music is my refuge. I can crawl into the space between the notes and curl my back to loneliness. - Maya Angelou",
  "A painter must be before he can do much. - Henry Moore",
  "Art speaks where words are unable to explain. - Unknown",
  "The beauty of art is that it captures the soul’s expression beyond language. - Unknown",
  "Music is the key to the soul of a people. - Unknown"
];

function LabelPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    toAddress: '',
    fromAddress: '',
    documentNo: '',
    date: new Date().toISOString().split('T')[0],
    weight: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateLabel = async () => {
    if (!formData.toAddress || !formData.fromAddress || !formData.documentNo) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      const pdfBytes = await generateLabelPDF(formData, randomQuote);

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Shipping_Label_${formData.documentNo}.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Error generating label PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '900px',
        margin: '0 auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: '0', color: '#1a365d', fontSize: '28px', fontWeight: 'bold' }}>
              Professional Shipping Label
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
              Create professional shipping labels with style
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '8px',
              color: '#4a5568',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#cbd5e0'}
            onMouseOut={(e) => e.target.style.background = '#e2e8f0'}
          >
            ← Back to Home
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2d3748',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Ship To Address *
            </label>
            <textarea
              name="toAddress"
              value={formData.toAddress}
              onChange={handleInputChange}
              placeholder="Customer Name
Company Name
Address Line 1
Address Line 2
City, State, ZIP"
              style={{
                width: '100%',
                height: '120px',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                background: '#fff',
                color: '#2d3748',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2d3748',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Ship From Address *
            </label>
            <textarea
              name="fromAddress"
              value={formData.fromAddress}
              onChange={handleInputChange}
              placeholder="Company Name
Contact Person
Address Line 1
Address Line 2
City, State, ZIP"
              style={{
                width: '100%',
                height: '120px',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                background: '#fff',
                color: '#2d3748',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2d3748',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Document Number *
            </label>
            <input
              type="text"
              name="documentNo"
              value={formData.documentNo}
              onChange={handleInputChange}
              placeholder="e.g., INV-2024-001"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                background: '#fff',
                color: '#2d3748',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2d3748',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Shipping Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                background: '#fff',
                color: '#2d3748',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2d3748',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Weight (optional)
            </label>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder="e.g., 5.2 kg"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                background: '#fff',
                color: '#2d3748',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fed7d7',
            color: '#c53030',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #feb2b2'
          }}>
            {error}
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleGenerateLabel}
            disabled={loading}
            style={{
              padding: '15px 40px',
              background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
              minWidth: '200px'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {loading ? 'Generating Label...' : 'Generate Professional Label'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LabelPage;