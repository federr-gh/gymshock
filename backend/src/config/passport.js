// src/config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const JWTStrategy = require('passport-jwt-cookiecombo');

// Configurar estrategia local (username + password)
passport.use(new LocalStrategy(
    async function (username, password, done) {
        try {
            // Buscar usuario por username
            const user = await User.findOne({ username });

            // Si no existe el usuario
            if (!user) {
                return done(null, false, { message: 'Usuario o contraseña incorrectos' });
            }

            // Verificar contraseña
            const isMatch = await user.comparePassword(password);

            if (!isMatch) {
                return done(null, false, { message: 'Usuario o contraseña incorrectos' });
            }

            // Autenticación exitosa
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// Estrategia JWT + Cookie (protección de rutas)
passport.use(new JWTStrategy(
    {
        secretOrPublicKey: process.env.JWT_SECRET, // define esto en tu .env
        jwtCookieName: 'jwt', // nombre de la cookie
        authScheme: 'Bearer', // opcional si también aceptas Authorization: Bearer
        passReqToCallback: false
    },
    async function (payload, done) {
        try {
            const user = await User.findById(payload.id);
            if (!user) return done(null, false);

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// Serializar usuario para guardarlo en la sesión
passport.serializeUser(function (user, done) {
    process.nextTick(function () {
        done(null, {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        });
    });
});

// Deserializar usuario de la sesión
passport.deserializeUser(function (user, done) {
    process.nextTick(function () {
        return done(null, user);
    });
});

module.exports = passport;