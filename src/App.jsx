const { useState, useEffect } = React;
const { 
  ThemeProvider, createTheme, 
  CssBaseline, Box, Drawer, AppBar, Toolbar, 
  Typography, List, ListItem, ListItemIcon, 
  ListItemText, IconButton, Paper, InputBase,
  CircularProgress
} = MaterialUI;

// Create a dark theme instance
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1E1E1E'
    }
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    h6: {
      fontWeight: 600,
      letterSpacing: '0.02em'
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '0.02em'
    },
    body1: {
      fontWeight: 400,
      letterSpacing: '0.01em'
    }
  }
});

function App() {
  const [apps, setApps] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWindowControl = (action) => {
    window.ipcRenderer.send('window-control', action);
  };

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const appList = await window.ipcRenderer.invoke('get-apps');
      setApps(appList);
    } catch (error) {
      console.error('Error loading apps:', error);
    }
  };

  const handleAppLaunch = (appName) => {
    window.ipcRenderer.send('launch-app', appName);
    addMessage('system', `Launching ${appName}...`);
  };

  const addMessage = (type, content) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type,
      content,
      timestamp: new Date()
    }]);
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        addMessage('system', 'Listening...');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        addMessage('user', transcript);
        
        if (transcript.includes('open') || transcript.includes('launch')) {
          const appName = transcript.replace(/(open|launch)/g, '').trim();
          const matchedApp = apps.find(app => 
            app.toLowerCase().includes(appName)
          );
          
          if (matchedApp) {
            handleAppLaunch(matchedApp);
          } else {
            addMessage('system', `Could not find app "${appName}"`);
          }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      addMessage('system', 'Speech recognition is not supported in your browser.');
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    addMessage('user', inputValue);
    
    if (inputValue.toLowerCase().includes('open') || inputValue.toLowerCase().includes('launch')) {
      const appName = inputValue.toLowerCase().replace(/(open|launch)/g, '').trim();
      const matchedApp = apps.find(app => 
        app.toLowerCase().includes(appName)
      );
      
      if (matchedApp) {
        handleAppLaunch(matchedApp);
      } else {
        addMessage('system', `Could not find app "${appName}"`);
      }
    }

    setInputValue('');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', position: 'relative' }}>
        {/* Window Controls */}
        <Box
          sx={{
            position: 'fixed',
            top: 8,
            left: 12,
            zIndex: 9999,
            display: 'flex',
            gap: '8px'
          }}
        >
          <Box
            onClick={() => handleWindowControl('close')}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#FF5F57',
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
          />
          <Box
            onClick={() => handleWindowControl('minimize')}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#FEBC2E',
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
          />
          <Box
            onClick={() => handleWindowControl('maximize')}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#28C840',
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
          />
        </Box>

        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              background: 'rgba(30, 30, 30, 0.8)',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            },
          }}
        >
          <Toolbar sx={{ paddingTop: '16px' }}>
            <Typography
              variant="h6"
              sx={{
                color: '#FFFFFF',
                fontWeight: 600,
                letterSpacing: '0.02em',
                fontSize: '20px',
                ml: 2,
                mt: '8px',
                position: 'relative',
                left: '32px'
              }}
            >
              god
            </Typography>
          </Toolbar>
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {apps.map((app) => (
                <ListItem 
                  button 
                  key={app}
                  onClick={() => handleAppLaunch(app)}
                  sx={{
                    '&:hover': {
                      background: '#2D2D2D'
                    }
                  }}
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        background: '#2D2D2D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {app[0].toUpperCase()}
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary={app} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* Main content */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            position: 'relative', 
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <AppBar 
            position="fixed" 
            sx={{ 
              background: 'rgba(30, 30, 30, 0.8)',
              boxShadow: 'none',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Toolbar>
              <Typography 
                variant="h5" 
                noWrap 
                component="div" 
                sx={{ 
                  flexGrow: 1, 
                  color: '#FFFFFF',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  fontSize: '24px'
                }}
              >
                god
              </Typography>
              <IconButton 
                color="inherit" 
                onClick={startListening}
                disabled={isListening}
              >
                {isListening ? (
                  <CircularProgress size={24} />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                )}
              </IconButton>
            </Toolbar>
          </AppBar>
          <Toolbar />

          {/* Messages */}
          <Box 
            sx={{ 
              height: 'calc(100vh - 180px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              py: 2,
              position: 'relative',
              zIndex: 1
            }}
          >
            {messages.map(message => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  px: 2
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    background: message.type === 'user' ? '#4A148C' : '#2D2D2D'
                  }}
                >
                  <Typography variant="body1">{message.content}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>

          {/* Input */}
          <Paper
            component="form"
            onSubmit={handleInputSubmit}
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              position: 'absolute',
              bottom: 24,
              left: 24,
              right: 24,
              background: 'rgba(30, 30, 30, 0.8)',
              backdropFilter: 'blur(10px)',
              zIndex: 1
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Type a command (e.g., 'open Safari')"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <IconButton type="submit" sx={{ p: '10px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </IconButton>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />); 