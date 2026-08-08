import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  CircularProgress,
  IconButton,
  InputAdornment,
  Alert,
  useMediaQuery,
  useTheme,
  Modal,
  Fade,
  Backdrop
} from '@mui/material';
import {
  Email as EmailIcon,
  VpnKey as KeyIcon,
  Visibility,
  VisibilityOff,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  ShowChart as ShowChartIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getVersionFormatted } from '../config/version';
import { getAuth, sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { app, db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const CompanyLogo = () => {
  return (
    <Avatar
      sx={{
        width: 100,
        height: 100,
        bgcolor: '#ff0000',
        color: '#ffffff',
        border: '3px solid #000000',
        boxShadow: '0 4px 20px rgba(255,0,0,0.4)',
      }}
    >
      <AccountBalanceIcon sx={{ fontSize: 50 }} />
    </Avatar>
  );
};

// ============================================
// COMPONENTE MODAL DE RESTABLECER CONTRASEÑA (CORREGIDO)
// ============================================
const RestablecerContrasenaModal = ({ isOpen, onClose, onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState('');
  const [verificando, setVerificando] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRestablecer = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);
    setError('');
    setVerificando(true);

    try {
      // 🔥 Usar getAuth() sin parámetros para usar la app por defecto
      const auth = getAuth();
      
      // Verificar si el email existe en Firebase Auth
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      if (signInMethods.length === 0) {
        // También verificar en Firestore
        try {
          const usuariosRef = collection(db, 'usuarios');
          const q = query(usuariosRef, where('email', '==', email));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            setError('No existe una cuenta asociada a este correo electrónico');
            setVerificando(false);
            setLoading(false);
            return;
          }
        } catch (firestoreError) {
          console.warn('Error verificando en Firestore:', firestoreError);
          // Si hay error en Firestore, continuar con Auth
        }
      }
      
      setVerificando(false);
      
      // 🔥 ENVIAR CORREO DE RESTABLECIMIENTO - CONFIGURACIÓN CORRECTA
      const actionCodeSettings = {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      };
      
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      
      setSuccess(true);
      setEmailEnviado(email);
      setLoading(false);
      
    } catch (error) {
      console.error('Error al enviar correo de restablecimiento:', error);
      setVerificando(false);
      setLoading(false);
      
      // Manejar errores específicos
      if (error.code === 'auth/user-not-found') {
        setError('No existe una cuenta asociada a este correo electrónico');
      } else if (error.code === 'auth/invalid-email') {
        setError('El correo electrónico no es válido');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Espera unos minutos y vuelve a intentar.');
      } else if (error.code === 'auth/missing-continue-uri') {
        setError('Error de configuración. Contacta al administrador.');
      } else if (error.message?.includes('API key')) {
        setError('Error de configuración de Firebase. Contacta al administrador.');
      } else {
        setError('Error al enviar el correo de restablecimiento. Intenta nuevamente.');
      }
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setError('');
      setSuccess(false);
      setEmailEnviado('');
      setVerificando(false);
      onClose();
    }
  };

  const handleBack = () => {
    if (!loading) {
      setEmail('');
      setError('');
      setSuccess(false);
      setEmailEnviado('');
      setVerificando(false);
      onBack();
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Fade in={isOpen}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 420,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            p: 4,
            outline: 'none',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid rgba(255,0,0,0.2)',
            mx: 2,
          }}
          component={motion.div}
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ duration: 0.3 }}
        >
          {/* Botón volver */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton
              onClick={handleBack}
              disabled={loading}
              sx={{
                color: '#666666',
                '&:hover': {
                  color: '#ff0000',
                  bgcolor: 'rgba(255,0,0,0.05)',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#000000',
                ml: 1,
              }}
            >
              Restablecer Contraseña
            </Typography>
          </Box>

          {success ? (
            // ✅ ÉXITO - Correo enviado
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#000000',
                  mb: 1,
                }}
              >
                ¡Correo Enviado!
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#666666',
                  mb: 2,
                }}
              >
                Hemos enviado un enlace de restablecimiento a:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#ff0000',
                  mb: 3,
                }}
              >
                {emailEnviado}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#999999',
                  fontSize: '0.8rem',
                  mb: 3,
                }}
              >
                Revisa tu bandeja de entrada y sigue las instrucciones para crear una nueva contraseña.
                <br />
                <span style={{ color: '#666666' }}>
                  Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
                </span>
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={handleClose}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #ff0000, #cc0000)',
                  color: '#ffffff',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderRadius: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #cc0000, #990000)',
                  },
                }}
              >
                Volver al inicio de sesión
              </Button>
            </Box>
          ) : (
            // 📝 FORMULARIO
            <form onSubmit={handleRestablecer}>
              <Typography
                variant="body2"
                sx={{
                  color: '#666666',
                  mb: 3,
                }}
              >
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </Typography>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    border: '1px solid #ff0000',
                    bgcolor: '#fff5f5',
                    color: '#000000',
                    '& .MuiAlert-icon': {
                      color: '#ff0000',
                    },
                  }}
                >
                  {error}
                </Alert>
              )}

              {verificando && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <CircularProgress size={20} sx={{ color: '#ff0000' }} />
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Verificando correo electrónico...
                  </Typography>
                </Box>
              )}

              <TextField
                fullWidth
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || verificando}
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#999999' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff0000',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff0000',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#ff0000',
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || verificando || !email}
                size={isMobile ? "medium" : "large"}
                sx={{
                  py: 1.5,
                  background: loading || verificando ? '#999999' : 'linear-gradient(135deg, #ff0000, #cc0000)',
                  color: '#ffffff',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderRadius: 2,
                  '&:hover': {
                    background: loading || verificando ? '#999999' : 'linear-gradient(135deg, #cc0000, #990000)',
                  },
                }}
              >
                {loading || verificando ? (
                  <CircularProgress size={24} sx={{ color: '#ffffff' }} />
                ) : (
                  'Enviar enlace de restablecimiento'
                )}
              </Button>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  onClick={handleBack}
                  disabled={loading || verificando}
                  sx={{
                    color: '#666666',
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    '&:hover': {
                      color: '#ff0000',
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  ← Volver al inicio de sesión
                </Button>
              </Box>
            </form>
          )}
        </Box>
      </Fade>
    </Modal>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showResetModal, setShowResetModal] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Efecto para seguir el mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generar partículas para el fondo
  const particles = Array.from({ length: 40 });
  const currencySymbols = ['RD$', '$', '€'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResetModal = () => {
    setShowResetModal(true);
  };

  const handleCloseResetModal = () => {
    setShowResetModal(false);
  };

  const handleBackToLogin = () => {
    setShowResetModal(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: 'linear-gradient(135deg, #0a0000 0%, #1a0000 30%, #2a0000 70%, #0a0000 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Efecto de líneas de gráfico financiero */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.15,
          pointerEvents: 'none',
        }}
      >
        <motion.path
          d="M0,400 Q200,300 400,350 T800,200 T1200,300 T1600,150"
          stroke="#ff0000"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M0,300 Q300,400 600,250 T1000,400 T1400,200 T1800,350"
          stroke="#ff0000"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
        />
        <motion.path
          d="M0,500 Q400,200 800,450 T1200,300 T1600,400 T2000,250"
          stroke="#ff0000"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 2 }}
        />
      </svg>

      {/* Efecto de dinero cayendo */}
      {particles.map((_, i) => (
        <Box
          key={i}
          component={motion.div}
          initial={{
            x: Math.random() * window.innerWidth,
            y: -50,
            rotate: 0,
            opacity: 0.2
          }}
          animate={{
            y: window.innerHeight + 50,
            rotate: 360,
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{
            duration: Math.random() * 12 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5
          }}
          sx={{
            position: 'absolute',
            color: i % 3 === 0 ? '#ff0000' : i % 3 === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,200,0,0.15)',
            fontSize: Math.random() * 24 + 12,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: 1,
            textShadow: i % 3 === 0 ? '0 0 10px rgba(255,0,0,0.3)' : 'none',
          }}
        >
          {currencySymbols[i % currencySymbols.length]}
        </Box>
      ))}

      {/* Efecto de spotlight que sigue al mouse */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255,0,0,0.15) 0%, transparent 50%)`,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Cuadrícula de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(255,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Destellos de luz roja */}
      <Box
        component={motion.div}
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,0,0,0.2) 0%, transparent 70%)',
          filter: 'blur(50px)',
          zIndex: 1,
        }}
      />

      <Box
        component={motion.div}
        animate={{
          opacity: [0.1, 0.25, 0.1],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,0,0,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 1,
        }}
      />

      {/* Contenedor del login */}
      <Container 
        maxWidth="sm" 
        sx={{ 
          position: 'relative', 
          zIndex: 10,
        }}
      >
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          elevation={0}
          sx={{
            p: isMobile ? 3 : 5,
            borderRadius: 2,
            background: '#ffffff',
            border: '1px solid rgba(255,0,0,0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,0,0,0.2) inset, 0 0 30px rgba(255,0,0,0.2)',
            position: 'relative',
            backdropFilter: 'blur(5px)',
            backgroundColor: 'rgba(255,255,255,0.98)',
          }}
        >
          {/* Logo y título */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <CompanyLogo />

            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 700,
                color: '#000000',
                letterSpacing: '0.5px',
                mt: 2,
                mb: 0.5,
              }}
            >
              EYS Inversiones
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#666666',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <AccountBalanceIcon sx={{ color: '#ff0000', fontSize: 16 }} />
              Préstamos y Finanzas
              <TrendingUpIcon sx={{ color: '#ff0000', fontSize: 16 }} />
            </Typography>

            <Box
              sx={{
                width: 60,
                height: 3,
                background: '#ff0000',
                mt: 2,
                borderRadius: 1,
              }}
            />
          </Box>

          {/* Mensaje de error */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 1,
                border: '1px solid rgba(255,0,0,0.3)',
                bgcolor: '#fff5f5',
                color: '#000000',
                '& .MuiAlert-icon': {
                  color: '#ff0000',
                },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#999999' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff0000',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff0000',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#ff0000',
                  },
                }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon sx={{ color: '#999999' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#666666' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff0000',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff0000',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#ff0000',
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                component={motion.button}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                size={isMobile ? "medium" : "large"}
                sx={{
                  py: isMobile ? 1.2 : 1.5,
                  background: '#ff0000',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderRadius: 1,
                  border: 'none',
                  boxShadow: '0 4px 10px rgba(255,0,0,0.3)',
                  '&:hover': {
                    background: '#cc0000',
                    boxShadow: '0 6px 15px rgba(255,0,0,0.4)',
                  },
                  '&:disabled': {
                    background: '#999999',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#ffffff' }} />
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 1,
                }}
              >
                <Button
                  onClick={handleOpenResetModal}
                  sx={{
                    color: '#666666',
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    '&:hover': {
                      color: '#ff0000',
                      background: 'transparent',
                    },
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Button>

                <Typography
                  variant="caption"
                  sx={{
                    color: '#999999',
                  }}
                >
                  {getVersionFormatted()}
                </Typography>
              </Box>
            </Box>
          </form>

          {/* Footer */}
          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'center',
              gap: 3,
            }}
          >
            <Typography variant="caption" sx={{ color: '#999999', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AttachMoneyIcon sx={{ fontSize: 14, color: '#ff0000' }} />
              Préstamos Seguros
            </Typography>
            <Typography variant="caption" sx={{ color: '#999999', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ShowChartIcon sx={{ fontSize: 14, color: '#ff0000' }} />
              Tasas Competitivas
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* 🔥 MODAL DE RESTABLECER CONTRASEÑA - CENTRALIZADO */}
      <RestablecerContrasenaModal
        isOpen={showResetModal}
        onClose={handleCloseResetModal}
        onBack={handleBackToLogin}
      />
    </Box>
  );
};

export default Login;