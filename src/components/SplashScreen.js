'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SplashScreen({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const loadingSteps = [
    'Initializing System Components...',
    'Loading Core Business Modules...',
    'Setting Up Dashboard Framework...',
    'Preparing User Interface...',
    'Finalizing Application Setup...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 20;
        setCurrentStep(Math.floor(newProgress / 20) - 1);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          // Wait a bit more before completing
          setTimeout(() => {
            onLoadingComplete();
          }, 1000);
          return 100;
        }
        return newProgress;
      });
    }, 900); // Each step takes 900ms (20% every 900ms = 4.5 seconds total)

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className="splash-screen">
      {/* Background Animation */}
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      {/* Main Content Container */}
      <div className="splash-container">
        <div className="splash-content">
          
          {/* Logo Section */}
          <div className="logo-section">
            <div className="logo-container">
              <div className="logo-glow"></div>
              <div className="text-logo">
                <div className="logo-text">SQ</div>
                <div className="logo-subtext">INVOICE</div>
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="title-section">
            <h1 className="main-title">
              <span className="title-text">SliqInvoice</span>
              <div className="title-underline"></div>
            </h1>
            <p className="subtitle">Professional Invoice Management System</p>
            <div className="feature-badges">
              <span className="badge">Secure</span>
              <span className="badge">Professional</span>
              <span className="badge">Reliable</span>
            </div>
          </div>

          {/* Loading Section */}
          <div className="loading-section">
            <div className="loading-status">
              <div className="status-text">
                {currentStep >= 0 && currentStep < loadingSteps.length && (
                  <span className="status-message">{loadingSteps[currentStep]}</span>
                )}
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="progress-wrapper">
              <div className="progress-track">
                <div className="progress-bg"></div>
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                >
                  <div className="progress-glow"></div>
                </div>
              </div>
              
              {/* Percentage Display */}
              <div className="percentage-display">
                <div className="percentage-circle">
                  <svg className="progress-ring" width="60" height="60">
                    <circle
                      className="progress-ring-bg"
                      cx="30"
                      cy="30"
                      r="26"
                      fill="transparent"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="2"
                    />
                    <circle
                      className="progress-ring-progress"
                      cx="30"
                      cy="30"
                      r="26"
                      fill="transparent"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${163.36}`}
                      strokeDashoffset={`${163.36 - (163.36 * progress) / 100}`}
                      transform="rotate(-90 30 30)"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4facfe" />
                        <stop offset="100%" stopColor="#00f2fe" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="percentage-text">{progress}%</div>
                </div>
              </div>
            </div>

            {/* Loading Animation */}
            <div className="loading-animation">
              <div className="pulse-dot"></div>
              <div className="pulse-dot"></div>
              <div className="pulse-dot"></div>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .splash-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B73FF 100%);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow: hidden;
        }

        .background-animation {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .floating-shape {
          position: absolute;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 50%;
          animation: float 20s infinite linear;
        }

        .shape-1 {
          width: 200px;
          height: 200px;
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 300px;
          height: 300px;
          top: 50%;
          right: -150px;
          animation-delay: -10s;
        }

        .shape-3 {
          width: 150px;
          height: 150px;
          bottom: -75px;
          left: 20%;
          animation-delay: -5s;
        }

        .shape-4 {
          width: 250px;
          height: 250px;
          top: 20%;
          right: 10%;
          animation-delay: -15s;
        }

        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -20px) rotate(90deg); }
          50% { transform: translate(-20px, -40px) rotate(180deg); }
          75% { transform: translate(-40px, 20px) rotate(270deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }

        .splash-container {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 30px;
          padding: 60px 40px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          max-width: 500px;
          width: 90%;
          text-align: center;
          animation: slideUp 0.8s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .splash-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
        }

        .logo-section {
          position: relative;
        }

        .logo-container {
          position: relative;
          display: inline-block;
        }

        .logo-glow {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        .logo-image {
          border-radius: 25px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          padding: 25px;
          position: relative;
          z-index: 2;
          transition: transform 0.3s ease;
        }

        .logo-image:hover {
          transform: scale(1.05);
        }

        .text-logo {
          width: 140px;
          height: 140px;
          border-radius: 25px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          transition: transform 0.3s ease;
        }

        .text-logo:hover {
          transform: scale(1.05);
        }

        .logo-text {
          font-size: 2.5rem;
          font-weight: 900;
          color: white;
          letter-spacing: -1px;
          margin-bottom: -5px;
        }

        .logo-subtext {
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          letter-spacing: 2px;
        }

        .title-section {
          text-align: center;
        }

        .main-title {
          position: relative;
          margin: 0 0 15px 0;
        }

        .title-text {
          font-size: 3.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          letter-spacing: -2px;
          display: inline-block;
          animation: titleGlow 3s ease-in-out infinite alternate;
        }

        @keyframes titleGlow {
          0% { filter: brightness(1) drop-shadow(0 0 5px rgba(255, 255, 255, 0.3)); }
          100% { filter: brightness(1.1) drop-shadow(0 0 15px rgba(255, 255, 255, 0.5)); }
        }

        .title-underline {
          height: 4px;
          background: linear-gradient(90deg, transparent 0%, #4facfe 50%, transparent 100%);
          margin: 10px auto;
          border-radius: 2px;
          animation: underlineExpand 2s ease-in-out infinite alternate;
        }

        @keyframes underlineExpand {
          0% { width: 60%; }
          100% { width: 80%; }
        }

        .subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          margin: 0 0 20px 0;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .feature-badges {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .badge {
          background: rgba(255, 255, 255, 0.15);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .badge:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }

        .loading-section {
          width: 100%;
        }

        .loading-status {
          margin-bottom: 25px;
        }

        .status-message {
          font-size: 1rem;
          opacity: 0.8;
          font-weight: 500;
          letter-spacing: 0.3px;
          animation: fadeInOut 0.5s ease-in-out;
        }

        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 0.8; transform: translateY(0); }
        }

        .progress-wrapper {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .progress-track {
          flex: 1;
          position: relative;
          height: 12px;
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .progress-fill {
          position: relative;
          height: 100%;
          background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
          border-radius: 10px;
          transition: width 0.6s ease;
          overflow: hidden;
        }

        .progress-glow {
          position: absolute;
          top: 0;
          right: 0;
          width: 30px;
          height: 100%;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 100%);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-30px); }
          100% { transform: translateX(30px); }
        }

        .percentage-display {
          position: relative;
        }

        .percentage-circle {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .progress-ring {
          transform: rotate(-90deg);
          transition: stroke-dashoffset 0.6s ease;
        }

        .percentage-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1rem;
          font-weight: 700;
          color: #4facfe;
        }

        .loading-animation {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 10px;
        }

        .pulse-dot {
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: pulseDot 1.4s infinite ease-in-out both;
        }

        .pulse-dot:nth-child(1) { animation-delay: -0.32s; }
        .pulse-dot:nth-child(2) { animation-delay: -0.16s; }
        .pulse-dot:nth-child(3) { animation-delay: 0; }

        @keyframes pulseDot {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .splash-container {
            padding: 40px 25px;
            max-width: 95%;
          }
          
          .title-text {
            font-size: 2.5rem;
          }
          
          .subtitle {
            font-size: 1rem;
          }
          
          .logo-image {
            width: 110px !important;
            height: 110px !important;
            padding: 20px;
          }

          .progress-wrapper {
            flex-direction: column;
            gap: 15px;
          }

          .percentage-circle {
            width: 50px;
            height: 50px;
          }

          .percentage-text {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .feature-badges {
            gap: 8px;
          }
          
          .badge {
            font-size: 0.75rem;
            padding: 4px 12px;
          }
        }
      `}</style>
    </div>
  );
}
