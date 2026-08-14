import React, { useState, useEffect } from 'react';

const SignupLoading = () => {
    const [text, setText] = useState('');
    const [phase, setPhase] = useState(1); // 1: Type Welcome, 2: Untype Welcome, 3: Type Message
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const welcomeText = "Welcome";
    const messageText = "We are creating a community for you...";

    const images = [
        '/assets/loading_3.png',
        '/assets/loading_2.png',
        '/assets/loading_volunteers.png'
    ];

    useEffect(() => {
        const imageInterval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(imageInterval);
    }, []);

    useEffect(() => {
        let timeout;

        if (phase === 1) {
            let i = 0;
            const type = () => {
                if (i <= welcomeText.length) {
                    setText(welcomeText.slice(0, i));
                    i++;
                    timeout = setTimeout(type, 150);
                } else {
                    timeout = setTimeout(() => setPhase(2), 2000);
                }
            };
            type();
        } else if (phase === 2) {
            let i = welcomeText.length;
            const untype = () => {
                if (i >= 0) {
                    setText(welcomeText.slice(0, i));
                    i--;
                    timeout = setTimeout(untype, 50);
                } else {
                    setPhase(3);
                }
            };
            untype();
        } else if (phase === 3) {
            let i = 0;
            const type = () => {
                if (i <= messageText.length) {
                    setText(messageText.slice(0, i));
                    i++;
                    timeout = setTimeout(type, 80);
                }
            };
            type();
        }

        return () => clearTimeout(timeout);
    }, [phase]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            zIndex: 9999,
            overflow: 'hidden'
        }}>
            <div style={{ width: '500px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {images.map((src, index) => (
                    <img
                        key={src}
                        src={src}
                        alt="Loading illustration"
                        style={{
                            position: 'absolute',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            opacity: index === currentImageIndex ? 1 : 0,
                            transition: 'opacity 1s ease-in-out'
                        }}
                    />
                ))}
            </div>
            <h2 style={{
                fontSize: '5rem',
                fontWeight: '400', // Pirata One is 400 weight but looks bold
                textAlign: 'center',
                minHeight: '6rem',
                fontFamily: '"Pirata One", system-ui',
                background: 'linear-gradient(to right, #8B5CF6, #e0e0e0, #8B5CF6)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                padding: '0 2rem',
                marginTop: '1rem',
                animation: 'gradient 3s linear infinite',
                lineHeight: 1.2,
                maxWidth: '90%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {text}
                <span className="cursor-blink" style={{ WebkitTextFillColor: '#8B5CF6' }}>|</span>
            </h2>
            <style>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @keyframes gradient {
                    to {
                        background-position: 200% center;
                    }
                }
                .cursor-blink {
                    animation: blink 1s infinite;
                    font-weight: 100;
                    margin-left: 5px;
                }
            `}</style>
        </div>
    );
};

export default SignupLoading;
