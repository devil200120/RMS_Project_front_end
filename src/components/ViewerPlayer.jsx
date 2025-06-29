import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';

const glassBg = {
  background: 'rgba(255,255,255,0.09)',
  borderRadius: '32px',
  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
  backdropFilter: 'blur(14px) saturate(180%)',
  WebkitBackdropFilter: 'blur(14px) saturate(180%)',
  border: '1.5px solid rgba(255,255,255,0.18)',
  padding: '32px',
  maxWidth: '90vw',
  minWidth: '340px',
  minHeight: '300px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  animation: 'fadein 1.2s cubic-bezier(.4,0,.2,1)'
};

const fadeKeyframes = `
@keyframes fadein {
  from { opacity: 0; transform: translateY(40px) scale(0.98);}
  to   { opacity: 1; transform: translateY(0) scale(1);}
}
`;

function ViewerPlayer() {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);

  // Redirect non-viewers
  useEffect(() => {
    if (!user || user.role !== "VIEWER") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await api.get('/schedules/current');
        if (res.data.success && res.data.data) {
          setContent(res.data.data);
          setError(null);
        } else {
          setContent(null);
          setError('No active schedule');
        }
      } catch (err) {
        console.error('Error fetching current schedule:', err);
        setContent(null);
        setError('Failed to fetch scheduled content');
      }
    };

    fetchContent();
    const interval = setInterval(fetchContent, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleDownload = () => {
    if (content.filePath) {
      const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');
      window.open(`${API_BASE}/${content.filePath}`, "_blank");
    } else if (content.url) {
      window.open(content.url, "_blank");
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

  // Add fade-in keyframes to document head once
  useEffect(() => {
    if (!document.getElementById('viewer-fadein-keyframes')) {
      const style = document.createElement('style');
      style.id = 'viewer-fadein-keyframes';
      style.innerHTML = fadeKeyframes;
      document.head.appendChild(style);
    }
  }, []);

  // Animated Glassmorphic Loader/Error
  if (error) {
    return (
      <div style={{
        position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
        background: "linear-gradient(120deg, #2b5876 0%, #4e4376 100%)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={glassBg}>
          <span style={{
            fontSize: 32, fontWeight: 700, color: "#fff",
            textShadow: "0 2px 8px rgba(0,0,0,0.33)"
          }}>
            {error}
          </span>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div style={{
        position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
        background: "linear-gradient(120deg, #2b5876 0%, #4e4376 100%)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={glassBg}>
          <span style={{
            fontSize: 28, fontWeight: 600, color: "#fff",
            textShadow: "0 2px 8px rgba(0,0,0,0.33)"
          }}>
            No scheduled content to play.
          </span>
        </div>
      </div>
    );
  }

  // Main display
  return (
    <div style={{
      position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
      background: "linear-gradient(120deg, #2b5876 0%, #4e4376 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
      overflow: "auto"
    }}>
      <div style={glassBg}>
        <h2 style={{
          color: "#fff", letterSpacing: 1, marginBottom: 24,
          textShadow: "0 2px 8px rgba(0,0,0,0.22)"
        }}>
          {content.title}
        </h2>
        {content.type === "image" && (
          <img
            src={`${API_BASE}/${content.filePath}`}
            alt={content.title}
            style={{
              maxWidth: "64vw", maxHeight: "50vh",
              borderRadius: "18px", boxShadow: "0 2px 32px rgba(0,0,0,0.12)",
              marginBottom: 24, transition: "box-shadow .3s"
            }}
          />
        )}
        {content.type === "video" && (
          <video
            src={`${API_BASE}/${content.filePath}`}
            controls
            autoPlay
            loop
            style={{
              maxWidth: "64vw", maxHeight: "50vh",
              borderRadius: "18px", boxShadow: "0 2px 32px rgba(0,0,0,0.12)",
              marginBottom: 24, transition: "box-shadow .3s"
            }}
          />
        )}
        {content.type === "url" && (
          <iframe
            src={content.url}
            title={content.title}
            style={{
              width: "62vw", height: "48vh",
              border: "none", borderRadius: "16px",
              background: "#fff", marginBottom: 24
            }}
          />
        )}
        {content.type === "html" && (
          <div
            dangerouslySetInnerHTML={{ __html: content.htmlContent }}
            style={{
              background: "rgba(255,255,255,0.7)", color: "#222",
              padding: 32, borderRadius: 16,
              maxWidth: "60vw", maxHeight: "44vh", overflow: "auto",
              marginBottom: 24, boxShadow: "0 2px 24px rgba(0,0,0,0.10)"
            }}
          />
        )}
        <button
          onClick={handleDownload}
          style={{
            marginTop: 8,
            padding: "14px 44px",
            fontSize: "1.15rem",
            borderRadius: 32,
            background: "rgba(255,255,255,0.20)",
            color: "#fff",
            border: "2px solid rgba(255,255,255,0.55)",
            cursor: "pointer",
            fontWeight: 600,
            letterSpacing: 1,
            boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
            transition: "background .25s, color .25s, border .25s, box-shadow .25s"
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.35)";
            e.currentTarget.style.color = "#222";
            e.currentTarget.style.border = "2px solid #fff";
            e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.22)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.20)";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.border = "2px solid rgba(255,255,255,0.55)";
            e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.18)";
          }}
        >
          Download
        </button>
      </div>
    </div>
  );
}

export default ViewerPlayer;
