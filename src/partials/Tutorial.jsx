import { useState, useEffect } from 'react';
import axios from 'axios';
import pencil from '../images/pencil_no_background.png';

const Tutorial = ({ loggedIn, getHighlightedElement, isTeacher }) => {
  const [dialogVisible, setDialogVisible] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialScreens, setTutorialScreens] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  // New state for target positions (used for the arrow)
  const [toolboxTarget, setToolboxTarget] = useState(null);
  const [controlPanelTarget, setControlPanelTarget] = useState(null);

  const loggedInScreens = [
    "Tu znajdziesz narzędzia.",
    "Tu możesz dodać zdjęcia, które wykorzystasz w trakcie lekcji.",
    "Tu zaprosisz korepetytora, rozpoczniesz i zakończysz lekcję.",
    "Aby dodać nową kartę, kliknij tutaj."
  ];
  const notLoggedInScreens = [
    "Tu znajdziesz narzędzia.",
    "Tu możesz dodać zdjęcia, które wykorzystasz w trakcie lekcji.",
    "Tu zaprosisz korepetytora, rozpoczniesz i zakończysz lekcję.",
    "Tu dodasz nową kartę."
  ];

  const stepsElements = {
    1: "toolbox",
    2: "toolbox-Image",
    3: "controlPanel",
    4: "newTab"
  };

  useEffect(() => {
    if (loggedIn && isTeacher !== '1') {
      axios.get('/api/user/info')
        .then(res => {
          console.log(res.data);
          setShowTutorial(res.data.showTutorial);
        })
        .catch(err => {
          // Handle error if needed
        });
    }
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) {
      setTutorialScreens(notLoggedInScreens);
    } else if (showTutorial && isTeacher !== '1') {
      setTutorialScreens(loggedInScreens);
    }
  }, [loggedIn, showTutorial]);

  useEffect(() => {
    //console.log(`Current step: ${currentStep + 1}`);
    //console.log(`Current element: ${stepsElements[currentStep + 1]}`);
    if (showTutorial || !loggedIn) getHighlightedElement(stepsElements[currentStep + 1]);
  }, [currentStep, showTutorial]);

  // For steps 0 & 1, compute the center position of the element with id "toolbox-Image"
  useEffect(() => {
    if (currentStep === 0 || currentStep === 1) {
      const el = document.getElementById('toolbox-Image');
      if (el) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setToolboxTarget({ x: centerX, y: centerY });
      }
    }
  }, [currentStep]);

  // For step 2, compute the center position of the element with id "controlPanel"
  useEffect(() => {
    if (currentStep === 2) {
      const el = document.getElementById('controlPanel');
      if (el) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setControlPanelTarget({ x: centerX, y: centerY });
      }
    }
  }, [currentStep]);

  const handleClose = () => {
    setDialogVisible(false);
    setCurrentStep(undefined);
    if (loggedIn) {
      axios.post('/api/tutorialCompleted');
    }
  };

  const handleNextButton = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };

  const modalContent = (
    <div className="flex flex-col items-center">
      <div className="flex items-center">
        <h2 style={{ whiteSpace: 'pre-line' }} className="mr-4">
          {tutorialScreens[currentStep]}
        </h2>
      </div>
      {currentStep < tutorialScreens.length - 1 ? (
        <button onClick={handleNextButton} className="p-button p-component p-button-text mt-4">
          Dalej
        </button>
      ) : (
        <button onClick={handleClose} className="p-button p-component p-button-text mt-4">
          Zakończ
        </button>
      )}
    </div>
  );

  // Always center the modal
  const modalWidth = window.innerWidth * 0.35;
  const modalLeftEdge = window.innerWidth / 2 - modalWidth / 2;
  const modalRightEdge = window.innerWidth / 2 + modalWidth / 2;
  const modalCenterY = window.innerHeight / 2;

  // Determine arrow start and target coordinates based on the current step 
  let arrowStart = null;
  let arrowTarget = null;

  if (currentStep === 0 || currentStep === 1) {
    // Arrow from modal left edge to toolbox target
    if (toolboxTarget) {
      arrowStart = { x: modalLeftEdge, y: modalCenterY };
      arrowTarget = toolboxTarget;
    }
  } else if (currentStep === 2) {
    // Arrow from modal right edge to controlPanel target
    if (controlPanelTarget) {
      arrowStart = { x: modalRightEdge, y: modalCenterY };
      arrowTarget = controlPanelTarget;
    }
  }

  // Adjust the arrow's endpoint so the arrowhead doesn't overlap the target element.
  let adjustedArrowTarget = arrowTarget;
  if (arrowStart && arrowTarget) {
    const dx = arrowTarget.x - arrowStart.x;
    const dy = arrowTarget.y - arrowStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const offset = 24; // slightly longer margin for arrowhead
    if (distance > offset) {
      adjustedArrowTarget = {
        x: arrowTarget.x - (offset * dx) / distance,
        y: arrowTarget.y - (offset * dy) / distance
      };
    }
  }

  // Wylicz pozycję dla gifa i modala jako dymka
  const gifSize = 80;
  const offset = 16; // odległość od elementu
  const bubbleOffset = 24; // odległość dymka od gifa
  const bubbleWidth = 300;

  let gifPosition = null;
  let bubblePosition = null;
  let bubbleTailPosition = {};

  if ((currentStep === 0 || currentStep === 1) && toolboxTarget) {
    const toolboxPanel = document.getElementById('toolbox');
    let panelMiddleY = toolboxTarget.y;
    if (toolboxPanel && currentStep === 0) {
      // Krok 1: połowa wysokości panelu z narzędziami
      const panelRect = toolboxPanel.getBoundingClientRect();
      panelMiddleY = panelRect.top + panelRect.height / 2;
    }
    if (currentStep === 1) {
      // Krok 2: pozostaw poprzednie położenie - trochę niżej, obok narzędzia image
      panelMiddleY = toolboxTarget.y; // przesunięcie w dół względem środka image
    }
    gifPosition = {
      left: toolboxTarget.x + (gifSize / 2) + offset,
      top: panelMiddleY - (gifSize / 2)
    };
    bubblePosition = {
      left: gifPosition.left + gifSize + bubbleOffset,
      top: gifPosition.top + gifSize / 2 - 90
    };
    bubbleTailPosition = {
      left: gifPosition.left + gifSize,
      top: gifPosition.top + gifSize / 2 - 10
    };
  } else if (currentStep === 2 && controlPanelTarget) {
    const el = document.getElementById('controlPanel');
    if (el) {
      const rect = el.getBoundingClientRect();
      gifPosition = {
        left: rect.left - gifSize - offset,
        top: rect.top + rect.height / 2 - gifSize / 2
      };
      bubblePosition = {
        left: gifPosition.left - 320 - bubbleOffset, // 320px = szerokość dymka
        top: gifPosition.top + gifSize / 2 - 75
      };
      bubbleTailPosition = {
        left: gifPosition.left,
        top: gifPosition.top + gifSize / 2 - 10
      };
    }
  } else if (currentStep === 3) {
    const el = document.getElementById('newTab');
    if (el) {
      const rect = el.getBoundingClientRect();
      gifPosition = {
        left: rect.left + rect.width / 2 - gifSize / 2, // środek elementu
        top: rect.bottom + offset // poniżej dolnej krawędzi
      };
      bubblePosition = {
        left: gifPosition.left + gifSize + bubbleOffset, // dymek po prawej stronie od gifa
        top: gifPosition.top + gifSize / 2 - 85
      };
      bubbleTailPosition = {
        left: gifPosition.left + gifSize,
        top: gifPosition.top + gifSize / 2 - 10
      };
    }
  }

  return (
    tutorialScreens.length > 0 && dialogVisible && (
      <div id="tutorial-dialog-background" className="fixed inset-0 z-[30] bg-black/60 pointer-events-auto">
        {/* GIF przy wskazywanym elemencie */}
        {gifPosition && (
          <img
            src={pencil}
            alt="Wskazujący gif"
            style={{
              position: 'absolute',
              left: `${gifPosition.left}px`,
              top: `${gifPosition.top}px`,
              width: `${gifSize}px`,
              height: `${gifSize}px`,
              zIndex: 40,
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Dymek komiksowy */}
        {bubblePosition && (
          <div
            style={{
              position: 'absolute',
              left: `${bubblePosition.left}px`,
              top: `${bubblePosition.top}px`,
              width: `${bubbleWidth}px`,
              minHeight: '120px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
              borderRadius: '28px',
              boxShadow: '0 8px 32px rgba(60,60,120,0.18)',
              padding: '14px 18px',
              textAlign: 'center',
              zIndex: 41,
              fontFamily: "'Montserrat', 'Poppins', 'Roboto', sans-serif",
              color: '#22223b',
              animation: 'bubbleFadeIn 0.6s',
            }}
          >
            <div
              style={{
                marginBottom: '18px',
                letterSpacing: '0.02em',
                fontSize: '1.05rem',
                fontWeight: 'normal',
                background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)', // spójny gradient z resztą strony
                borderTopLeftRadius: '18px',
                borderTopRightRadius: '18px',
                padding: '4px 0',
                color: 'white',
                boxShadow: '0 2px 8px rgba(60,60,120,0.08)',
                margin: '-14px -18px 18px -18px',
              }}
            >
              {`Krok ${currentStep + 1} z ${tutorialScreens.length}`}
            </div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 'normal',
                lineHeight: '1.6',
                marginBottom: '22px',
                letterSpacing: '0.01em'
              }}
            >
              {tutorialScreens[currentStep]}
            </div>
            {currentStep < tutorialScreens.length - 1 ? (
              <button
                onClick={handleNextButton}
                style={{
                  background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)', // spójny gradient z paskiem
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '8px 28px',
                  marginBottom: '4px',
                  letterSpacing: '0.08em',
                  fontSize: '1rem',
                  fontWeight: 'normal',
                  boxShadow: '0 2px 8px rgba(60,60,120,0.12)',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Dalej
              </button>
            ) : (
              <button
                onClick={handleClose}
                style={{
                  background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)', // spójny gradient z paskiem
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '8px 28px',
                  marginBottom: '4px',
                  letterSpacing: '0.08em',
                  fontSize: '1rem',
                  fontWeight: 'normal',
                  boxShadow: '0 2px 8px rgba(60,60,120,0.12)',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Zakończ
              </button>
            )}
            {/* Ogon dymka */}
            <div
              style={{
                position: 'absolute',
                left: currentStep === 2 ? '100%' : '-24px',
                top: '70px',
                width: 0,
                height: 0,
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderLeft: currentStep === 2 ? '24px solid #E7ECFE' : 'none',
                borderRight: currentStep === 2 ? 'none' : '24px solid #F5F8FC',
                zIndex: 42
              }}
            />
            {/* Animacja fade-in */}
            <style>
              {`
                @keyframes bubbleFadeIn {
                  from { opacity: 0; transform: scale(0.95);}
                  to { opacity: 1; transform: scale(1);}
                }
              `}
            </style>
          </div>
        )}
      </div>
    )
  );
}

export default Tutorial;