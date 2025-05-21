import React, { useState, useEffect } from 'react';
import './index.css';

const PRELOADED_RAMAYAN_PICS = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Ramayan_Painting_-_Rama_And_Sita_in_Forest.jpg/320px-Ramayan_Painting_-_Rama_And_Sita_in_Forest.jpg',
    caption: 'Rama and Sita in forest',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Lord_Rama_with_Sita.jpg/320px-Lord_Rama_with_Sita.jpg',
    caption: 'Lord Rama with Sita',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Illustration_of_Ramayana_-_Rama_and_Sugriva.jpg/320px-Illustration_of_Ramayana_-_Rama_and_Sugriva.jpg',
    caption: 'Rama and Sugriva',
  },
];

function App() {
  const [section, setSection] = useState('home');

  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(null);
  const [galleryPassword, setGalleryPassword] = useState('');
  const [galleryLoggedIn, setGalleryLoggedIn] = useState(false);
  const [friends, setFriends] = useState(() => JSON.parse(localStorage.getItem('friendsData')) || []);
  const [gallery, setGallery] = useState(() => JSON.parse(localStorage.getItem('galleryData')) || PRELOADED_RAMAYAN_PICS);
  const [form, setForm] = useState({ name: '', contact: '', met: '', photo: null });
  const [editingIndex, setEditingIndex] = useState(null);

  const [contactForOTP, setContactForOTP] = useState('');
  const [showOTPBox, setShowOTPBox] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [enteredOTP, setEnteredOTP] = useState('');
  const [isOTPLoggedIn, setIsOTPLoggedIn] = useState(false);

 const [morePhilos, setMorePhilos] = useState(() => {
  const saved = localStorage.getItem('reflections');
  return saved ? JSON.parse(saved) : [];
});
  const [newPhilo, setNewPhilo] = useState('');
 

  useEffect(() => {
    localStorage.setItem('friendsData', JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem('galleryData', JSON.stringify(gallery));
  }, [gallery]);

  function getBase64(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
  }
  useEffect(() => {
  localStorage.setItem('reflections', JSON.stringify(morePhilos));
}, [morePhilos]);

  function handleFriendSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.contact) return alert('Name and contact required!');
    const updated = editingIndex !== null
      ? friends.map((f, i) => (i === editingIndex ? { ...form } : f))
      : [...friends, form];
    setFriends(updated);
    setForm({ name: '', contact: '', met: '', photo: null });
    setEditingIndex(null);
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) getBase64(file, (result) => setForm({ ...form, photo: result }));
  }

  function editFriend(i) {
    setForm(friends[i]);
    setEditingIndex(i);
  }

  function deleteFriend(i) {
    if (window.confirm('Delete this friend?')) {
      setFriends(friends.filter((_, idx) => idx !== i));
    }
  }

  function handleGalleryUpload(e) {
    const files = Array.from(e.target.files);
    files.forEach((file) =>
      getBase64(file, (result) => {
        const caption = prompt("Enter caption:");
        setGallery((g) => [...g, { url: result, caption }]);
      })
    );
  }

  function updateCaption(index) {
    const newCaption = prompt("Edit caption:", gallery[index].caption);
    if (newCaption !== null) {
      const updated = [...gallery];
      updated[index].caption = newCaption;
      setGallery(updated);
    }
  }

  function deleteGalleryImg(i) {
    if (window.confirm('Delete this photo?')) {
      setGallery(gallery.filter((_, idx) => idx !== i));
    }
  }

  function generateOTP() {
    const match = friends.find(f => f.contact === contactForOTP);
    if (!match) return alert("No friend found with that contact.");
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOTP(otp);
    setShowOTPBox(true);
    alert(`Your OTP is: ${otp}`);
  }

  function verifyOTP() {
    if (enteredOTP === generatedOTP) {
      setIsOTPLoggedIn(true);
      setLoggedIn('friends');
    } else {
      alert('Incorrect OTP.');
    }
  }

  function logout() {
    setLoggedIn(null);
    setGalleryLoggedIn(false);
    setPassword('');
    setGalleryPassword('');
    setForm({ name: '', contact: '', met: '', photo: null });
    setEditingIndex(null);
    setIsOTPLoggedIn(false);
    setShowOTPBox(false);
    setSection('home');
  }

  // Home Screen
  if (section === 'home') {
    return (
      <div className="container">
        <div className="left-panel">
          <h1 className="brand-title">SARVA</h1>
          <p className="subtitle">Perennialist • Developer • Thinker</p>
        </div>

        <div className="center-panel">
          
          <div className="text-block">
            <h2>REFLECTIONS </h2>
            <p>
              In the age of Kali Yuga, scriptures foretell moral decay, disconnection, and spiritual blindness.
              Yet this era also holds the mirror to our soul, showing both the shadows and the seeds of awakening.
              Human nature, while vulnerable to greed and illusion, still yearns for truth, balance, and unity.
              The destruction is not just physical—it's a crumbling of inner values. But within that collapse lies
              a deeper call to reclaim integrity, compassion, and consciousness.
            </p>

            <div className="quote-container">
              <p>
                In the throes of Kali Yuga, desire masquerades as need, and noise drowns the still voice within.
                The ego, unchecked, builds kingdoms of illusion, while empathy becomes a forgotten art.
                Relationships turn transactional, and truth is diluted into convenience.
                But beneath the chaos, the soul remembers — faintly — a time of dharma, where action aligned with spirit.
                This inner memory, though buried, is the ember of return.
              </p>
            </div>

           {morePhilos.map((para, idx) => (
  <div
    key={idx}
    className="reflection-card"
    style={{
      backgroundImage: `url(https://source.unsplash.com/800x400/?philosophy,nature,abstract&sig=${idx})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: '12px',
      marginBottom: '20px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 6px 15px rgba(0,0,0,0.25)',
    }}
  >
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        padding: '20px',
        borderRadius: '8px',
        width: '100%',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '16px', fontFamily: 'Georgia, serif', margin: 0 }}>{para}</p>
      <button
        onClick={() => {
          if (window.confirm('Delete this reflection?')) {
            setMorePhilos(morePhilos.filter((_, i) => i !== idx));
          }
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: '#ff5c5c',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 10px',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        ×
      </button>
    </div>
  </div>
))}



            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newPhilo.trim()) {
                  setMorePhilos([newPhilo.trim(), ...morePhilos]);
                  setNewPhilo('');
                }
              }}
              style={{ marginTop: '20px' }}
            >
              <textarea
                placeholder="Add your own philosophical reflection..."
                value={newPhilo}
                onChange={(e) => setNewPhilo(e.target.value)}
                className="philo-input"
                rows={3}
              />
              <button type="submit">Add Reflection</button>
            </form>
          </div>
        </div>

        <div className="right-panel">
          <div className="nav-menu">
            <div className="nav-item" onClick={() => setSection('MAIN DATA')}>
              <span className="nav-letter">A</span>
              <span className="nav-text">MAIN DATABASE !</span>
            </div>
            <div className="nav-item" onClick={() => setSection('gallery')}>
              <span className="nav-letter">B</span>
              <span className="nav-text">Enlargements</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login (People Tracker)
  if (section === 'MAIN DATA' && !loggedIn && !isOTPLoggedIn) {
    return (
      <div className="app-container login-section">
        <h2>The Concept of Death ACCORDING TO SARVA</h2>
        <p style={{ maxWidth: 600, margin: '10px auto 20px' }}>
          In the Ramayan, death is not merely the end of life but a significant transition in the cosmic order...
        </p>

        <input type="password" placeholder="Enter main password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br />
        <button onClick={() => {
          if (password === '12') setLoggedIn('friends');
          else if (password === 'gallery123') setLoggedIn('gallery');
          else alert('Wrong password!');
          setPassword('');
        }}>Login</button>

        <div style={{ marginTop: 10 }}>
          <input type="text" placeholder="Enter your contact number" value={contactForOTP} onChange={(e) => setContactForOTP(e.target.value)} />
          <button onClick={generateOTP} style={{ marginLeft: 10 }}>Get OTP</button>
        </div>

        {showOTPBox && (
          <>
            <br />
            <input type="text" placeholder="Enter OTP" value={enteredOTP} onChange={(e) => setEnteredOTP(e.target.value)} />
            <br />
            <button onClick={verifyOTP}>Verify OTP</button>
          </>
        )}
      </div>
    );
  }

  if (loggedIn === 'friends') {
    return (
      <div className="app-container">
        <div style={{ marginBottom: 20 }}>
          <button onClick={logout}>Logout</button>
          <button onClick={() => { setLoggedIn('gallery'); setGalleryLoggedIn(false); }} style={{ marginLeft: 10 }}>Switch to Gallery</button>
        </div>

        <h2>INTROSPECTIVES</h2>
        <form onSubmit={handleFriendSubmit}>
          <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="text" placeholder="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required />
          <input type="text" placeholder="How I met them" value={form.met} onChange={(e) => setForm({ ...form, met: e.target.value })} />
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
          <button type="submit">{editingIndex !== null ? 'Update' : 'Add'}</button>
        </form>

        <ul className="friends-list">
          {friends.map((friend, i) => (
            <li key={i} className="friend-item">
              {friend.photo ? <img src={friend.photo} alt={friend.name} className="friend-photo" /> : <div className="friend-photo">?</div>}
              <div className="friend-info">
                <p>{friend.name}</p>
                <p>Contact: {friend.contact}</p>
                <p>Met: {friend.met}</p>
              </div>
              <div>
                <button onClick={() => editFriend(i)}>Edit</button>
                <button onClick={() => deleteFriend(i)} style={{ marginLeft: 5 }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (section === 'gallery' && !galleryLoggedIn) {
    return (
      <div className="app-container login-section">
        <h2>Enter Gallery Password</h2>
        <input type="password" placeholder="Gallery Password" value={galleryPassword} onChange={(e) => setGalleryPassword(e.target.value)} />
        <br />
        <button onClick={() => {
         if (galleryPassword === '122') {
  setGalleryLoggedIn(true);
  setLoggedIn('gallery');
}
          else alert('Wrong gallery password!');
          setGalleryPassword('');
        }}>Enter Gallery</button>
        <button onClick={logout} style={{ marginLeft: 10 }}>Back</button>
      </div>
    );
  }

  if (loggedIn === 'gallery' && galleryLoggedIn) {
    return (
      <div className="app-container">
        <div style={{ marginBottom: 20 }}>
          <button onClick={logout}>Logout</button>
          <button onClick={() => { setLoggedIn('friends'); setGalleryLoggedIn(false); }} style={{ marginLeft: 10 }}>Switch to Friends</button>
        </div>

        <h2>Ramayan Gallery</h2>
        <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} />
        <div className="gallery-grid">
          {gallery.map((img, idx) => (
            <div key={idx} className="gallery-post">
              <img src={img.url} alt={`Gallery ${idx}`} className="gallery-image" />
              <p>{img.caption}</p>
              <div style={{ marginTop: 5 }}>
                <button onClick={() => updateCaption(idx)}>Edit Caption</button>
                <button onClick={() => deleteGalleryImg(idx)} style={{ marginLeft: 5 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default App;
