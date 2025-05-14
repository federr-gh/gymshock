// src/controllers/authController.js
const User = require('../models/User');
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Login utilizando Passport.js
exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: info.message || 'Credenciales inválidas'
            });
        }

        req.login(user, (err) => {
            if (err) {
                return next(err);
            }

            // Crear payload para el token
            const payload = {
                id: user._id,
                username: user.username,
                role: user.role
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '1d'
            });

            // Establecer cookie segura (httpOnly)
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 día
            });

            // También enviar el token en el JSON (para Postman)
            return res.json({
                success: true,
                token,
                user: payload
            });
            
        });
    })(req, res, next);
};

// Registro de nuevos usuarios
exports.register = async (req, res, next) => {
    try {
        const { username, email, password, name } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico o nombre de usuario ya están registrados'
            });
        }

        // Crear nuevo usuario
        const user = new User({
            username,
            email,
            password,
            name
        });

        await user.save();

        // Iniciar sesión automáticamente
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }

            return res.status(201).json({
                success: true,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error en el registro'
        });
    }
};

// Cerrar sesión
exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al cerrar sesión'
            });
        }
        res.json({
            success: true,
            message: 'Sesión cerrada correctamente'
        });
    });
};

// Obtener información del usuario actual
exports.getMe = (req, res) => {
    // Si el usuario está autenticado, Passport lo añade a req.user
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }

    res.json({
        success: true,
        user: req.user
    });
};