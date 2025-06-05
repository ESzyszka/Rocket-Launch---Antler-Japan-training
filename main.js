import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Mic, MicOff, Volume2 } from 'lucide-react';

const SpaceLaunchSimulator = () => {
  const [isLaunched, setIsLaunched] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript.toLowerCase();
        setTranscript(transcript);
        
        if (event.results[current].isFinal) {
          handleVoiceCommand(transcript);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = (text) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      synthRef.current.speak(utterance);
    }
  };

  const handleVoiceCommand = (command) => {
    setLastCommand(command);
    
    if (command.includes('launch') || command.includes('blast off') || command.includes('take off')) {
      if (!isLaunched && countdown === 0) {
        speak('Initiating launch sequence');
        startCountdown();
      } else if (isLaunched) {
        speak('Rocket has already been launched');
      } else {
        speak('Launch sequence already in progress');
      }
    } else if (command.includes('reset') || command.includes('restart')) {
      handleReset();
      speak('Mission reset. Ready for launch');
    } else if (command.includes('status') || command.includes('report')) {
      if (isLaunched) {
        speak('Mission successful. Rocket is in orbit');
      } else if (countdown > 0) {
        speak(`Launch sequence in progress. T minus ${countdown} seconds`);
      } else {
        speak('Rocket is ready for launch. Say launch to begin countdown');
      }
    } else {
      speak('Command not recognized. Try saying launch, reset, or status');
    }
  };

  const toggleListening = () => {
    if (!voiceSupported) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const startCountdown = () => {
    setCountdown(10);
    speak('T minus 10');
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsLaunched(true);
          speak('Liftoff! We have liftoff!');
          return 0;
        }
        if (prev <= 5) {
          speak(prev - 1);
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRocketClick = () => {
    if (isLaunched || countdown > 0) return;
    
    speak('Launch sequence initiated');
    startCountdown();
  };

  const handleReset = () => {
    setIsLaunched(false);
    setCountdown(0);
    setTranscript('');
    setLastCommand('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Stars */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-green-800 to-green-600" />
      <div className="absolute bottom-32 w-full h-8 bg-gray-600" />

      {/* Launch Pad */}
      <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 w-20 h-8 bg-gray-400 rounded-t-lg" />

      {/* Rocket */}
      <div
        className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-1000 cursor-pointer hover:scale-110 ${
          isLaunched 
            ? 'bottom-96 animate-bounce' 
            : 'bottom-48'
        }`}
        onClick={handleRocketClick}
        style={{
          transform: isLaunched 
            ? 'translateX(-50%) translateY(-400px)' 
            : 'translateX(-50%)',
        }}
      >
        <Rocket 
          size={80} 
          className={`text-red-500 ${isLaunched ? 'animate-spin' : ''}`} 
        />
        {isLaunched && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
            <div className="w-8 h-16 bg-gradient-to-t from-orange-500 via-yellow-400 to-red-500 animate-pulse" />
          </div>
        )}
      </div>

      {/* Mission Control Panel */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white p-6 rounded-lg max-w-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Rocket size={20} />
          Mission Control
        </h2>
        
        <div className="space-y-3">
          <div>
            <strong>Status:</strong> {
              isLaunched ? 'In Orbit' : 
              countdown > 0 ? `T-${countdown}` : 
              'Ready for Launch'
            }
          </div>
          
          {countdown > 0 && (
            <div className="text-red-400 text-2xl font-mono">
              T-{countdown}
            </div>
          )}
          
          <button
            onClick={handleReset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            disabled={countdown > 0}
          >
            Reset Mission
          </button>
        </div>
      </div>

      {/* Voice Control Panel */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-6 rounded-lg max-w-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Volume2 size={20} />
          Voice Agent
        </h2>
        
        <div className="space-y-3">
          <button
            onClick={toggleListening}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded transition-colors ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            disabled={!voiceSupported}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            {isListening ? 'Stop Listening' : 'Start Voice Control'}
          </button>
          
          {!voiceSupported && (
            <p className="text-yellow-400 text-sm">Voice not supported</p>
          )}
          
          {transcript && (
            <div className="text-sm">
              <strong>Hearing:</strong> {transcript}
            </div>
          )}
          
          {lastCommand && (
            <div className="text-sm text-green-400">
              <strong>Last Command:</strong> {lastCommand}
            </div>
          )}
          
          <div className="text-xs text-gray-400 space-y-1">
            <p><strong>Voice Commands:</strong></p>
            <p>• "Launch" - Start countdown</p>
            <p>• "Reset" - Reset mission</p>
            <p>• "Status" - Mission report</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-lg mb-2">Click the rocket or use voice commands to launch!</p>
        <p className="text-sm opacity-75">Voice Agent powered by Web Speech API</p>
      </div>
    </div>
  );
};

export default SpaceLaunchSimulator;
