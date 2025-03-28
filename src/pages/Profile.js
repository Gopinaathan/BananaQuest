"use client"

import { useEffect, useState } from "react"
import { getAuth, onAuthStateChanged, signOut, updateEmail } from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import app from "../services/firebaseConfig"
import "./styles/Profile.css"

function Profile() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const auth = getAuth(app)
  const db = getFirestore(app)

  const avatarStyles = ["adventurer", "avataaars", "big-ears", "micah"]

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          setUser(currentUser)
          setEmail(currentUser.email)
          const userDocRef = doc(db, "users", currentUser.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUsername(userData.username || "User")
            setAvatar(userData.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.uid}`)
            setSelectedAvatar(userData.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.uid}`)
          }
        } catch (error) {
          console.error("Session invalid or expired:", error)
          handleLogout()
        }
      } else {
        setUser(null)
        navigate("/auth")
      }
    })

    return () => unsubscribe()
  }, [auth, db, navigate])

  const handleAvatarSelect = (style) => {
    const newAvatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${user.uid}`
    setSelectedAvatar(newAvatarUrl)
  }

  const handleSetAvatar = async () => {
    if (!user) return
    setAvatar(selectedAvatar)
    try {
      await setDoc(doc(db, "users", user.uid), { avatar: selectedAvatar }, { merge: true })
    } catch (error) {
      console.error("Error saving avatar:", error)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    try {
      await setDoc(doc(db, "users", user.uid), { username, email }, { merge: true })
      if (email !== user.email) {
        await updateEmail(user, email)
      }
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut(auth)
      localStorage.clear()
      sessionStorage.clear()
      setUser(null)
      setTimeout(() => {
        navigate("/auth")
      }, 2000)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">PLAYER PROFILE</h2>
        {isLoggingOut ? (
          <p className="profile-info">Logging out... Redirecting to Auth Page</p>
        ) : user ? (
          <>
            <div className="profile-photo-container">
              <img src={avatar || "/placeholder.svg"} alt="Avatar" className="profile-photo" />
            </div>

            <div className="avatar-selection-container">
              <p className="section-label">Select an Avatar:</p>
              <div className="avatar-options">
                {avatarStyles.map((style) => (
                  <img
                    key={style}
                    src={`https://api.dicebear.com/7.x/${style}/svg?seed=${user.uid}`}
                    alt={style}
                    className={`avatar-option ${selectedAvatar.includes(style) ? "selected" : ""}`}
                    onClick={() => handleAvatarSelect(style)}
                  />
                ))}
              </div>
              <button className="game-btn" onClick={handleSetAvatar}>
                Set Avatar
              </button>
            </div>

            <div className="profile-info-container">
              <div className="info-row">
                <label className="info-label">Username:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="info-input"
                  />
                ) : (
                  <p className="info-value">{username}</p>
                )}
              </div>

              <div className="info-row">
                <label className="info-label">Email:</label>
                {isEditing ? (
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="info-input" />
                ) : (
                  <p className="info-value">{email}</p>
                )}
              </div>
            </div>

            <div className="button-container">
              {isEditing ? (
                <button className="game-btn" onClick={handleSaveProfile}>
                  Save
                </button>
              ) : (
                <button className="game-btn" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="loading-container">
            <div className="loading-icon"></div>
            <p className="profile-info">Loading profile...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile

