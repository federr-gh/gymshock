// scripts/populateDB.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Producto = require('../models/Exercise');
const productos = require('../../data/GymShockGif.json');

const populateDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conectado a MongoDB');

        await Producto.deleteMany({});
        console.log('Colección de productos limpiada');

        const insertedProducts = await Producto.insertMany(productos);
        console.log(`${insertedProducts.length} productos insertados correctamente`);

        console.log('Base de datos poblada con éxito');
    } catch (error) {
        console.error('Error al poblar la base de datos:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Conexión a MongoDB cerrada');
    }
};

populateDB();