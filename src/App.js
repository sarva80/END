"use client"

import { useState, useEffect, useRef } from "react"
import "./index.css"

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oohgpvwfyvyqtfuvossu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaGdwdndmeXZ5cXRmdXZvc3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTcxMDAsImV4cCI6MjA2MzQ5MzEwMH0.LfqrA-VFwSdzdzVT0Fe9shQSE54hdDyIG6SiYtq200M';

const supabase = createClient(supabaseUrl, supabaseKey);


// =============================================
// PRELOADED DATA
// =============================================
const PRELOADED_RAMAYAN_PICS = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Ramayan_Painting_-_Rama_And_Sita_in_Forest.jpg/320px-Ramayan_Painting_-_Rama_And_Sita_in_Forest.jpg",
    caption: "Rama and Sita in forest",
    type: "image",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Lord_Rama_with_Sita.jpg/320px-Lord_Rama_with_Sita.jpg",
    caption: "Lord Rama with Sita",
    type: "image",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Illustration_of_Ramayana_-_Rama_and_Sugriva.jpg/320px-Illustration_of_Ramayana_-_Rama_and_Sugriva.jpg",
    caption: "Rama and Sugriva",
    type: "image",
  },
]

// =============================================
// UTILITY FUNCTIONS
// =============================================

// Function to get base64 from file
function getBase64(file, callback) {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => callback(reader.result)
}

// Format date string for calendar
function formatDateString(date) {
  return date.toISOString().split("T")[0]
}

// Format time for voice notes
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
}

// =============================================
// CUSTOM HOOKS
// =============================================

// Custom hook for localStorage
function useLocalStorage(key, initialValue) {
  // Get from local storage then parse stored json or return initialValue
  const readValue = () => {
    // Prevent build error "window is undefined" but keep working
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }

  // State to store our value
  const [storedValue, setStoredValue] = useState(readValue)

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save to state
      setStoredValue(valueToStore)

      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  useEffect(() => {
    setStoredValue(readValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [storedValue, setValue]
}

// =============================================
// REUSABLE COMPONENTS
// =============================================

// Toast Component
function Toast({ message, type, onClose }) {
  return (
    <div className={`toast-notification ${type}`}>
      <span className="toast-icon">{type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  )
}

// Calendar Component
function Calendar({ selectedDate, onDateChange, events }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState([])

  useEffect(() => {
    generateCalendarDays(currentMonth)
  }, [currentMonth])

  const generateCalendarDays = (month) => {
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
    const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    const firstDayOfWeek = firstDayOfMonth.getDay()

    const days = []

    // Add days from previous month
    const prevMonth = new Date(month)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    const daysInPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate()

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      days.push({
        date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day),
        isCurrentMonth: false,
      })
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(month.getFullYear(), month.getMonth(), day),
        isCurrentMonth: true,
      })
    }

    // Add days from next month
    const remainingDays = 42 - days.length
    const nextMonth = new Date(month)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day),
        isCurrentMonth: false,
      })
    }

    setCalendarDays(days)
  }

  const prevMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
  }

  const nextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
  }

  const handleDateClick = (date) => {
    onDateChange(formatDateString(date))
  }

  const hasEvent = (date) => {
    const dateStr = formatDateString(date)
    return !!events[dateStr]
  }

  const isSelectedDate = (date) => {
    return formatDateString(date) === selectedDate
  }

  const isToday = (date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <button onClick={prevMonth}>&lt;</button>
        <h3>
          {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
        </h3>
        <button onClick={nextMonth}>&gt;</button>
      </div>

      <div className="calendar-weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="calendar-days">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${!day.isCurrentMonth ? "other-month" : ""} 
                       ${day.date && isToday(day.date) ? "today" : ""} 
                       ${day.date && isSelectedDate(day.date) ? "selected" : ""} 
                       ${day.date && hasEvent(day.date) ? "has-event" : ""}`}
            onClick={() => day.date && handleDateClick(day.date)}
          >
            {day.date ? day.date.getDate() : ""}
            {day.date && hasEvent(day.date) && <span className="event-dot"></span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// Audio Recorder Component
function AudioRecorder({ onSave }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        chunksRef.current = []
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Could not access microphone. Please check your permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      clearInterval(timerRef.current)
      setIsRecording(false)

      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
  }

  const handleSave = () => {
    if (audioBlob) {
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
      reader.onloadend = () => {
        const base64Audio = reader.result
        onSave(base64Audio)
        setAudioBlob(null)
        setAudioUrl(null)
      }
    }
  }

  const cancelRecording = () => {
    if (isRecording) {
      stopRecording()
    }
    setAudioBlob(null)
    setAudioUrl(null)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="audio-recorder">
      <div className="recorder-controls">
        {!isRecording && !audioBlob ? (
          <button onClick={startRecording} className="record-btn">
            🎙️ Start Recording
          </button>
        ) : isRecording ? (
          <div className="recording-status">
            <span className="recording-indicator">●</span>
            <span className="recording-time">{formatTime(recordingTime)}</span>
            <button onClick={stopRecording} className="stop-btn">
              ⏹️ Stop
            </button>
          </div>
        ) : (
          <div className="playback-controls">
            <audio src={audioUrl} controls className="audio-player" />
            <div className="audio-actions">
              <button onClick={handleSave} className="save-btn">
                💾 Save
              </button>
              <button onClick={cancelRecording} className="cancel-btn">
                ❌ Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Audio Player Component
function AudioPlayer({ audioSrc }) {
  return (
    <div className="audio-player-container">
      <audio src={audioSrc} controls className="audio-player" />
    </div>
  )
}

// Video Player Component
function VideoPlayer({ videoSrc }) {
  return (
    <div className="video-player-container">
      <video src={videoSrc} controls className="video-player" />
    </div>
  )
}

// Login Section Component
function LoginSection({ title, hint, password, setPassword, onLogin, onBack, darkMode, showHint = false }) {
  return (
    <div className={`app-container login-section ${darkMode ? "dark-mode" : ""}`}>
      <h2>{title}</h2>
      {showHint && (
        <div className="password-hint">
          <p>{hint}</p>
        </div>
      )}
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={onLogin}>Enter</button>
      <button onClick={onBack} className="back-btn">
        Back to Home
      </button>
    </div>
  )
}

// =============================================
// MAIN APP COMPONENT
// =============================================
function App() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchFriends(session.user.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchFriends(session.user.id);
      }
    });

    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line
  }, []);

  const fetchFriends = async (userId) => {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      showToast("Failed to fetch friends", "error");
    } else {
      setFriends(data);
    }
  };

  // =============================================
  // STATE MANAGEMENT
  // =============================================

  // Theme state
  // eslint-disable-next-line
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", false)

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" })

  // Navigation state
  const [section, setSection] = useState("home")

  // Authentication states
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [loggedIn, setLoggedIn] = useState(null)
  const [galleryPassword, setGalleryPassword] = useState("")
  const [galleryLoggedIn, setGalleryLoggedIn] = useState(false)
  const [showOTPBox, setShowOTPBox] = useState(false)
  const [generatedOTP, setGeneratedOTP] = useState("")
  const [enteredOTP, setEnteredOTP] = useState("")
  const [isOTPLoggedIn, setIsOTPLoggedIn] = useState(false)
  const [voicePassword, setVoicePassword] = useState("")
  const [voiceMissionsLoggedIn, setVoiceMissionsLoggedIn] = useState(false)
  const [herPassword, setHerPassword] = useState("")
  const [herLoggedIn, setHerLoggedIn] = useState(false)

  const [showPasswordList, setShowPasswordList] = useState(false)

  // Data states
  const [friends, setFriends] = useLocalStorage("friendsData", [])
  const [gallery, setGallery] = useLocalStorage("galleryData", PRELOADED_RAMAYAN_PICS)
  const [morePhilos, setMorePhilos] = useLocalStorage("reflections", [])
  const [events, setEvents] = useLocalStorage("dailyEvents", {})
  const [voiceNotes, setVoiceNotes] = useLocalStorage("voiceNotes", [])
  const [herMedia, setHerMedia] = useLocalStorage("herMedia", [])

  // Form states
  const [form, setForm] = useState({ name: "", contact: "", met: "", photo: null })
  const [editingIndex, setEditingIndex] = useState(null)
  const [newPhilo, setNewPhilo] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [eventText, setEventText] = useState("")
  const [missionText, setMissionText] = useState("")
  const [missionTitle, setMissionTitle] = useState("")
  // eslint-disable-next-line
  const [herCaption, setHerCaption] = useState("")

  // =============================================
  // EFFECTS
  // =============================================

  // Apply dark mode to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode")
    } else {
      document.body.classList.remove("dark-mode")
    }
  }, [darkMode])


  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  // Toast notification function
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: "", type: "info" })
    }, 3000)
  }

  // Export data function
  // eslint-disable-next-line
  const exportData = () => {
    try {
      const data = {
        friends,
        gallery,
        reflections: morePhilos,
        events,
        voiceNotes,
        herMedia,
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `sarva_backup_${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      showToast("Data exported successfully!", "success")
    } catch (error) {
      showToast("Failed to export data. " + error.message, "error")
    }
  }

  // Import data function
  // eslint-disable-next-line
  const importData = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)

        // Validate data structure
        if (!data.friends || !data.gallery || !data.reflections || !data.events) {
          throw new Error("Invalid backup file format")
        }

        // Update state with imported data
        setFriends(data.friends)
        setGallery(data.gallery)
        setMorePhilos(data.reflections)
        setEvents(data.events)
        if (data.voiceNotes) {
          setVoiceNotes(data.voiceNotes)
        }
        if (data.herMedia) {
          setHerMedia(data.herMedia)
        }

        showToast("Data imported successfully!", "success")
      } catch (error) {
        showToast("Failed to import data. " + error.message, "error")
      }
    }
    reader.readAsText(file)
  }

  // Toggle password list
  const togglePasswordList = () => {
    setShowPasswordList(!showPasswordList)
  }

  // =============================================
  // FRIEND MANAGEMENT FUNCTIONS
  // =============================================

  function handleFriendSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.contact) {
      showToast("Name and contact required!", "error")
      return
    }

    const updated =
      editingIndex !== null ? friends.map((f, i) => (i === editingIndex ? { ...form } : f)) : [...friends, form]
    setFriends(updated)
    setForm({ name: "", contact: "", met: "", photo: null })
    setEditingIndex(null)
    showToast(editingIndex !== null ? "Friend updated!" : "Friend added!", "success")
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (file) getBase64(file, (result) => setForm({ ...form, photo: result }))
  }

  function editFriend(i) {
    setForm(friends[i])
    setEditingIndex(i)
  }

  function deleteFriend(i) {
    if (window.confirm("Delete this friend?")) {
      setFriends(friends.filter((_, idx) => idx !== i))
      showToast("Friend deleted", "info")
    }
  }

  // =============================================
  // GALLERY MANAGEMENT FUNCTIONS
  // =============================================

  function handleGalleryUpload(e) {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      files.forEach((file) =>
        getBase64(file, (result) => {
          const caption = prompt("Enter caption:")
          if (caption !== null) {
            setGallery((g) => [...g, { url: result, caption, type: "image" }])
            showToast("Image uploaded!", "success")
          }
        }),
      )
    }
  }

  function updateCaption(index) {
    const newCaption = prompt("Edit caption:", gallery[index].caption)
    if (newCaption !== null) {
      const updated = [...gallery]
      updated[index].caption = newCaption
      setGallery(updated)
      showToast("Caption updated!", "success")
    }
  }

  function deleteGalleryImg(i) {
    if (window.confirm("Delete this photo?")) {
      setGallery(gallery.filter((_, idx) => idx !== i))
      showToast("Image deleted", "info")
    }
  }

  // =============================================
  // HER MEDIA MANAGEMENT FUNCTIONS
  // =============================================

  function handleHerMediaUpload(e) {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      files.forEach((file) => {
        const fileType = file.type.startsWith("video/") ? "video" : "image"
        getBase64(file, (result) => {
          const caption = prompt("Enter caption:")
          if (caption !== null) {
            setHerMedia((media) => [
              ...media,
              {
                url: result,
                caption,
                type: fileType,
                date: new Date().toISOString(),
              },
            ])
            showToast(`${fileType === "video" ? "Video" : "Image"} uploaded!`, "success")
          }
        })
      })
    }
  }

  function updateHerCaption(index) {
    const newCaption = prompt("Edit caption:", herMedia[index].caption)
    if (newCaption !== null) {
      const updated = [...herMedia]
      updated[index].caption = newCaption
      setHerMedia(updated)
      showToast("Caption updated!", "success")
    }
  }

  function deleteHerMedia(i) {
    if (window.confirm("Delete this media?")) {
      setHerMedia(herMedia.filter((_, idx) => idx !== i))
      showToast("Media deleted", "info")
    }
  }

  // =============================================
  // VOICE NOTES FUNCTIONS
  // =============================================

  function handleSaveVoiceNote(audioData) {
    if (!missionTitle.trim()) {
      showToast("Please enter a title for your mission", "error")
      return
    }

    const newVoiceNote = {
      id: Date.now(),
      title: missionTitle,
      description: missionText,
      audio: audioData,
      date: new Date().toISOString(),
    }

    setVoiceNotes([newVoiceNote, ...voiceNotes])
    setMissionTitle("")
    setMissionText("")
    showToast("Voice note saved successfully!", "success")
  }

  function deleteVoiceNote(id) {
    if (window.confirm("Delete this voice note?")) {
      setVoiceNotes(voiceNotes.filter((note) => note.id !== id))
      showToast("Voice note deleted", "info")
    }
  }

  // =============================================
  // AUTHENTICATION FUNCTIONS
  // =============================================

  function checkUserAndGenerateOTP() {
    const match = friends.find((f) => f.name.toLowerCase() === userName.toLowerCase())
    if (!match) {
      showToast("No user found with that name.", "error")
      return
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    setGeneratedOTP(otp)
    setShowOTPBox(true)
    showToast(`Your OTP is: ${otp}`, "info")
  }

  function verifyOTP() {
    if (enteredOTP === generatedOTP) {
      setIsOTPLoggedIn(true)
      setLoggedIn("friends")
      showToast("Login successful!", "success")
    } else {
      showToast("Incorrect OTP.", "error")
    }
  }

  function passwordLogin() {
    if (password === "12") {
      setLoggedIn("friends")
      showToast("Login successful!", "success")
    } else {
      showToast("Wrong password!", "error")
    }
    setPassword("")
  }

  function logout() {
    setLoggedIn(null)
    setGalleryLoggedIn(false)
    setVoiceMissionsLoggedIn(false)
    setHerLoggedIn(false)
    setPassword("")
    setGalleryPassword("")
    setVoicePassword("")
    setHerPassword("")
    setUserName("")
    setForm({ name: "", contact: "", met: "", photo: null })
    setEditingIndex(null)
    setIsOTPLoggedIn(false)
    setShowOTPBox(false)
    setSection("home")
    showToast("Logged out successfully", "info")
  }

  // =============================================
  // CALENDAR FUNCTIONS
  // =============================================

  function handleSaveEvent() {
    if (selectedDate && eventText) {
      setEvents((prev) => ({ ...prev, [selectedDate]: eventText }))
      setEventText("")
      showToast("Event saved!", "success")
    } else {
      showToast("Please select a date and enter event details", "error")
    }
  }

  // =============================================
  // RENDER SECTIONS
  // =============================================

  // Common toast component for all sections
  const renderToast = () => (
    <>
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
    </>
  )

  // Home Section
  if (section === "home") {
    return (
      <div className={`container ${darkMode ? "dark-mode" : ""}`}>
        {renderToast()}
        <div className="left-panel">
  {/* Curved arc above the title */}
  <div className="glowing-arc-container">
    <svg className="glowing-arc" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <path 
        className="arc-path"
        d="M20,30 Q50,10 80,30" 
      />
      <circle cx="20" cy="30" r="3" className="arc-endpoint" />
      <circle cx="80" cy="30" r="3" className="arc-endpoint" />
    </svg>
  </div>
  
  <h1 className="brand-title">SARVA</h1>
  <p className="subtitle">Perennialist • Developer • Thinker</p>
</div>

        <div className="center-panel">
          <div className="text-block">
            <h2>REFLECTIONS</h2>
            <p>
              In the age of Kali Yuga, scriptures foretell moral decay, disconnection, and spiritual blindness. Yet this
              era also holds the mirror to our soul, showing both the shadows and the seeds of awakening. Human nature,
              while vulnerable to greed and illusion, still yearns for truth, balance, and unity. The destruction is not
              just physical—it's a crumbling of inner values. But within that collapse lies a deeper call to reclaim
              integrity, compassion, and consciousness.
            </p>
            <div className="quote-container">
              <p>
                In the throes of Kali Yuga, desire masquerades as need, and noise drowns the still voice within. The
                ego, unchecked, builds kingdoms of illusion, while empathy becomes a forgotten art. Relationships turn
                transactional, and truth is diluted into convenience. But beneath the chaos, the soul remembers —
                faintly — a time of dharma, where action aligned with spirit. This inner memory, though buried, is the
                ember of return.
              </p>
            </div>
            {morePhilos.map((para, idx) => (
              <div key={idx} className="quote-container user-reflection">
                <p>{para}</p>
                <button
                  className="delete-btn"
                  onClick={() => {
                    if (window.confirm("Delete this reflection?")) {
                      setMorePhilos(morePhilos.filter((_, i) => i !== idx))
                      showToast("Reflection deleted", "info")
                    }
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (newPhilo.trim()) {
                  setMorePhilos([newPhilo.trim(), ...morePhilos])
                  setNewPhilo("")
                  showToast("Reflection added!", "success")
                } else {
                  showToast("Please enter a reflection", "error")
                }
              }}
            >
              <textarea
                placeholder="Add your own philosophical reflection..."
                value={newPhilo}
                onChange={(e) => setNewPhilo(e.target.value)}
                className="philo-input"
              />
              <button type="submit">Add Reflection</button>
            </form>
          </div>
        </div>
        <div className="right-panel">
        <div className="nav-menu">
  <div className="nav-item" onClick={() => setSection("MAIN DATA")}>
    <span className="nav-letter">I</span>
    <span className="nav-text">MAIN DATABASE</span>
  </div>
  <div className="nav-item" onClick={() => setSection("gallery")}>
    <span className="nav-letter">II</span>
    <span className="nav-text">ENLARGEMENTS</span>
  </div>
  <div className="nav-item" onClick={() => setSection("calendar")}>
    <span className="nav-letter">III</span>
    <span className="nav-text">CALENDAR NOTES</span>
  </div>
  <div className="nav-item" onClick={() => setSection("voice-notes")}>
    <span className="nav-letter">IV</span>
    <span className="nav-text">VOICE MISSIONS</span>
  </div>
  <div className="nav-item" onClick={() => setSection("her")}>
    <span className="nav-letter">V</span>
    <span className="nav-text">HER</span>
  </div>
</div>
          <div className="password-list-toggle">
            <button onClick={togglePasswordList} className="password-list-btn">
              {showPasswordList ? "Hide Passwords" : "Show Passwords"}
            </button>
          </div>
        </div>
        {showPasswordList && (
          <div className="password-list-overlay">
            <div className="password-list-container">
              <div className="password-list-header">
                <h2>Application Passwords</h2>
                <button onClick={togglePasswordList} className="close-btn">
                  ×
                </button>
              </div>
              <p className="warning">⚠️ For security reasons, most hints are hidden</p>

              <table className="password-table">
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Password</th>
                    <th>Hint</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Main Database</td>
                    <td className="password-value">null</td>
                    <td>Hidden for security</td>
                  </tr>
                  <tr>
                    <td>Gallery</td>
                    <td className="password-value">null</td>
                    <td>Hidden for security</td>
                  </tr>
                  <tr>
                    <td>Voice Missions</td>
                    <td className="password-value">null</td>
                    <td>The sacred sound that connects all consciousness</td>
                  </tr>
                  <tr>
                    <td>HER</td>
                    <td className="password-value">null</td>
                    <td>Hidden for security</td>
                  </tr>
                </tbody>
              </table>

              <div className="security-tips">
                <h3>Security Tips</h3>
                <ul>
                  <li>Consider changing passwords periodically</li>
                  <li>Use different passwords for different sections</li>
                  <li>Add more complex passwords for sensitive sections</li>
                  <li>Keep your backup files secure</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Login Section for Main Data
  if (section === "MAIN DATA" && !loggedIn && !isOTPLoggedIn) {
    return (
      <div className={`app-container login-section ${darkMode ? "dark-mode" : ""}`}>
        {renderToast()}

        <h2>The Concept of Death ACCORDING TO SARVA</h2>

        <div className="login-tabs">
          <button className={`tab-btn ${!showOTPBox ? "active" : ""}`} onClick={() => setShowOTPBox(false)}>
            Password Login
          </button>
          <button className={`tab-btn ${showOTPBox ? "active" : ""}`} onClick={() => setShowOTPBox(true)}>
            OTP Login
          </button>
        </div>

        {!showOTPBox ? (
          // Password Login
          <div className="login-form">
            <input
              type="password"
              placeholder="Enter main password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={passwordLogin}>Login</button>
          </div>
        ) : (
          // OTP Login
          <div className="login-form">
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <button onClick={checkUserAndGenerateOTP}>Get OTP</button>

            {generatedOTP && (
              <div className="otp-section">
                <div className="otp-display">
                  Your OTP: <span className="otp-code">{generatedOTP}</span>
                </div>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={enteredOTP}
                  onChange={(e) => setEnteredOTP(e.target.value)}
                />
                <button onClick={verifyOTP}>Verify OTP</button>
              </div>
            )}
          </div>
        )}

        <button onClick={() => setSection("home")} className="back-btn">
          Back to Home
        </button>
      </div>
    )
  }

  // Friends Section
  if (loggedIn === "friends") {
    return (
      <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
        {renderToast()}

        <h2>INTROSPECTIVES</h2>
        <div className="action-buttons">
          <button onClick={logout}>Logout</button>
          <button onClick={() => setLoggedIn("gallery")} style={{ marginLeft: 10 }}>
            Switch to Gallery
          </button>
          <button onClick={() => setSection("home")} style={{ marginLeft: 10 }}>
            Back to Home
          </button>
        </div>
        <form onSubmit={handleFriendSubmit} className="friend-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact">Contact</label>
            <input
              id="contact"
              type="text"
              placeholder="Contact"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="met">How I met them</label>
            <input
              id="met"
              type="text"
              placeholder="How I met them"
              value={form.met}
              onChange={(e) => setForm({ ...form, met: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="photo">Photo</label>
            <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} />
          </div>
          <button type="submit" className="submit-btn">
            {editingIndex !== null ? "Update" : "Add"}
          </button>
        </form>
        <ul className="friends-list">
          {friends.map((friend, i) => (
            <li key={i} className="friend-item">
              {friend.photo ? (
                <img src={friend.photo || "/placeholder.svg"} alt={friend.name} className="friend-photo" />
              ) : (
                <div className="friend-photo">?</div>
              )}
              <div className="friend-info">
                <p className="friend-name">{friend.name}</p>
                <p>Contact: {friend.contact}</p>
                <p>Met: {friend.met}</p>
              </div>
              <div className="friend-actions">
                <button onClick={() => editFriend(i)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => deleteFriend(i)} className="delete-btn">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // Login Section for Gallery
  if (section === "gallery" && !galleryLoggedIn) {
    return (
      <LoginSection
        title="Enter Gallery Password"
        password={galleryPassword}
        setPassword={setGalleryPassword}
        onLogin={() => {
          if (galleryPassword === "122") {
            setGalleryLoggedIn(true)
            setLoggedIn("gallery")
            showToast("Gallery access granted!", "success")
          } else {
            showToast("Wrong gallery password!", "error")
          }
          setGalleryPassword("")
        }}
        onBack={() => setSection("home")}
        darkMode={darkMode}
        showHint={false}
      />
    )
  }

  // Gallery Section
  if (loggedIn === "gallery" && galleryLoggedIn) {
    return (
      <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
        {renderToast()}

        <h2>ENLARGEMENTS</h2>
        <div className="action-buttons">
          <button onClick={logout}>Logout</button>
          <button onClick={() => setLoggedIn("friends")} style={{ marginLeft: 10 }}>
            Switch to Friends
          </button>
          <button onClick={() => setSection("home")} style={{ marginLeft: 10 }}>
            Back to Home
          </button>
        </div>
        <div className="upload-container">
          <label className="upload-btn">
            Upload Images
            <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} style={{ display: "none" }} />
          </label>
        </div>
        <div className="gallery-grid">
          {gallery.map((img, idx) => (
            <div key={idx} className="gallery-post">
              <div className="gallery-image-container">
                <img src={img.url || "/placeholder.svg"} alt={`Gallery ${idx}`} className="gallery-image" />
              </div>
              <p className="gallery-caption">{img.caption}</p>
              <div className="gallery-actions">
                <button onClick={() => updateCaption(idx)} className="edit-btn" title="Edit caption">
                  ✏️
                </button>
                <button onClick={() => deleteGalleryImg(idx)} className="delete-btn" title="Delete image">
                  🗑️
                </button>
                <a href={img.url} download={`image_${idx + 1}.jpg`} className="download-icon" title="Download">
                  ⬇️
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Voice Missions Login Section
  if (section === "voice-notes" && !voiceMissionsLoggedIn) {
    return (
      <LoginSection
        title="Enter Voice Missions Password"
        hint="Hint: The sacred sound that connects all consciousness"
        password={voicePassword}
        setPassword={setVoicePassword}
        onLogin={() => {
          if (voicePassword === "om") {
            setVoiceMissionsLoggedIn(true)
            showToast("Voice Missions access granted!", "success")
          } else {
            showToast("Incorrect password. Try again.", "error")
          }
          setVoicePassword("")
        }}
        onBack={() => setSection("home")}
        darkMode={darkMode}
        showHint={true}
      />
    )
  }

  // Voice Notes Section
  if (section === "voice-notes" && voiceMissionsLoggedIn) {
    return (
      <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
        {renderToast()}

        <h2>VOICE MISSIONS</h2>
        <button onClick={() => setSection("home")} className="back-btn">
          Back to Home
        </button>
        <div className="action-buttons">
          <button
            onClick={() => {
              setVoiceMissionsLoggedIn(false)
              showToast("Logged out of Voice Missions", "info")
            }}
          >
            Logout
          </button>
        </div>

        <div className="voice-notes-container">
          <div className="voice-notes-form">
            <h3>Record New Mission</h3>
            <div className="form-group">
              <label htmlFor="mission-title">Mission Title</label>
              <input
                id="mission-title"
                type="text"
                placeholder="Enter mission title"
                value={missionTitle}
                onChange={(e) => setMissionTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="mission-text">Mission Details (Optional)</label>
              <textarea
                id="mission-text"
                placeholder="Enter mission details or notes..."
                value={missionText}
                onChange={(e) => setMissionText(e.target.value)}
                className="mission-input"
              />
            </div>
            <div className="form-group">
              <label>Voice Recording</label>
              <AudioRecorder onSave={handleSaveVoiceNote} />
            </div>
          </div>

          <div className="voice-notes-list">
            <h3>Saved Missions</h3>
            {voiceNotes.length === 0 ? (
              <p className="no-notes">No voice missions recorded yet.</p>
            ) : (
              voiceNotes.map((note) => (
                <div key={note.id} className="voice-note-item">
                  <div className="voice-note-header">
                    <h4>{note.title}</h4>
                    <span className="voice-note-date">
                      {new Date(note.date).toLocaleDateString()} {new Date(note.date).toLocaleTimeString()}
                    </span>
                  </div>
                  {note.description && <p className="voice-note-description">{note.description}</p>}
                  <AudioPlayer audioSrc={note.audio} />
                  <button onClick={() => deleteVoiceNote(note.id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // Her Login Section
  if (section === "her" && !herLoggedIn) {
    return (
      <LoginSection
        title="Enter HER Password"
        password={herPassword}
        setPassword={setHerPassword}
        onLogin={() => {
          if (herPassword === "love") {
            setHerLoggedIn(true)
            showToast("HER section access granted!", "success")
          } else {
            showToast("Incorrect password. Try again.", "error")
          }
          setHerPassword("")
        }}
        onBack={() => setSection("home")}
        darkMode={darkMode}
        showHint={false}
      />
    )
  }

  // Her Section
  if (section === "her" && herLoggedIn) {
    return (
      <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
        {renderToast()}

        <h2>HER</h2>
        <button onClick={() => setSection("home")} className="back-btn">
          Back to Home
        </button>
        <div className="action-buttons">
          <button
            onClick={() => {
              setHerLoggedIn(false)
              showToast("Logged out of HER section", "info")
            }}
          >
            Logout
          </button>
        </div>

        <div className="upload-container">
          <label className="upload-btn">
            Upload Images & Videos
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleHerMediaUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <div className="her-media-grid">
          {herMedia.map((media, idx) => (
            <div key={idx} className="her-media-item">
              <div className="her-media-container">
                {media.type === "image" ? (
                  <img src={media.url || "/placeholder.svg"} alt={media.caption} className="her-image" />
                ) : (
                  <VideoPlayer videoSrc={media.url} />
                )}
              </div>
              <p className="her-media-caption">{media.caption}</p>
              <div className="her-media-date">
                {new Date(media.date).toLocaleDateString()} {new Date(media.date).toLocaleTimeString()}
              </div>
              <div className="her-media-actions">
                <button onClick={() => updateHerCaption(idx)} className="edit-btn" title="Edit caption">
                  ✏️
                </button>
                <button onClick={() => deleteHerMedia(idx)} className="delete-btn" title="Delete media">
                  🗑️
                </button>
                <a
                  href={media.url}
                  download={`her_${media.type}_${idx + 1}.${media.type === "video" ? "mp4" : "jpg"}`}
                  className="download-icon"
                  title="Download"
                >
                  ⬇️
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Calendar Section
  if (section === "calendar") {
    return (
      <div className={`calendar-container ${darkMode ? "dark-mode" : ""}`}>
        {renderToast()}

        <h2>📅 Calendar Notes</h2>
        <button onClick={() => setSection("home")} className="back-btn">
          Back to Home
        </button>

        <div className="calendar-layout">
          <div className="calendar-input-section">
            <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} events={events} />

            <div className="event-input">
              <h3>Add Note for {selectedDate}</h3>
              <textarea
                rows={4}
                placeholder="What happened that day?"
                value={eventText}
                onChange={(e) => setEventText(e.target.value)}
              />
              <button onClick={handleSaveEvent} disabled={!selectedDate || !eventText}>
                Save Note
              </button>
            </div>
          </div>

          <div className="events-list">
            <h3>📖 Saved Entries</h3>
            {Object.keys(events).length === 0 && <p>No events added yet.</p>}
            {Object.entries(events)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .map(([date, note]) => (
                <div key={date} className="calendar-note">
                  <div className="note-header">
                    <strong>{date}</strong>
                    <button
                      className="delete-btn small"
                      onClick={() => {
                        if (window.confirm("Delete this note?")) {
                          const updatedEvents = { ...events }
                          delete updatedEvents[date]
                          setEvents(updatedEvents)
                          showToast("Note deleted", "info")
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="note-content">{note}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default App