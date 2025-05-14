const Exercise = require('../models/Exercise');

const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Obtener todos los ejercicios
 * @route   GET /api/exercises
 */
exports.getExercises = asyncHandler(async (req, res) => {
    const { bodyPart, equipment, target, search, page = 1, limit = 2000 } = req.query;

    const filter = {};
    if (bodyPart && bodyPart !== 'all') filter.bodyPart = bodyPart;
    if (equipment) filter.equipment = equipment;
    if (target) filter.target = target;

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { target: { $regex: search, $options: 'i' } },
            { bodyPart: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const exercises = await Exercise.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ name: 1 });

    const total = await Exercise.countDocuments(filter);

    res.json({
        success: true,
        count: exercises.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        data: exercises
    });
});

/**
 * @desc    Obtener un ejercicio por ID
 * @route   GET /api/exercises/:id
 */
exports.getExerciseById = asyncHandler(async (req, res) => {
    const exercise = await Exercise.findOne({ id: req.params.id });

    if (!exercise) {
        return res.status(404).json({
            success: false,
            message: 'Ejercicio no encontrado'
        });
    }

    res.json({ success: true, data: exercise });
});

/**
 * @desc    Obtener lista de partes del cuerpo
 * @route   GET /api/exercises/bodyPartList
 */
exports.getBodyPartList = asyncHandler(async (req, res) => {
    const bodyParts = await Exercise.distinct('bodyPart');
    res.json({ success: true, data: bodyParts });
});

/**
 * @desc    Obtener ejercicios por parte del cuerpo
 * @route   GET /api/exercises/bodyPart/:bodyPart
 */
exports.getExercisesByBodyPart = asyncHandler(async (req, res) => {
    const { bodyPart } = req.params;
    const exercises = await Exercise.find({ bodyPart });
    res.json({ success: true, count: exercises.length, data: exercises });
});

/**
 * @desc    Obtener ejercicios similares
 * @route   GET /api/exercises/:id/similar
 */
exports.getSimilarExercises = asyncHandler(async (req, res) => {
    const exercise = await Exercise.findOne({ id: req.params.id });

    if (!exercise) {
        return res.status(404).json({
            success: false,
            message: 'Ejercicio no encontrado'
        });
    }

    const similarExercises = await Exercise.find({
        id: { $ne: exercise.id },
        $or: [
            { target: exercise.target },
            { bodyPart: exercise.bodyPart }
        ]
    }).limit(6);

    res.json({ success: true, count: similarExercises.length, data: similarExercises });
});

exports.createExercise = asyncHandler(async (req, res) => {
    const exerciseData = req.body;
    
    // Validar datos de entrada
    if (!exerciseData.name || !exerciseData.bodyPart || !exerciseData.target || !exerciseData.equipment) {
        return res.status(400).json({
            success: false,
            message: 'Por favor proporcione todos los campos requeridos'
        });
    }
    
    // Generar ID único si no se proporciona
    if (!exerciseData.id) {
        // Generar ID basado en el nombre (slug)
        exerciseData.id = exerciseData.name
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-');
    }
    
    // Crear nuevo ejercicio
    const exercise = new Exercise(exerciseData);
    await exercise.save();
    
    res.status(201).json({
        success: true,
        data: exercise
    });
});

/**
 * @desc    Actualizar un ejercicio existente
 * @route   PUT /api/exercises/:id
 * @access  Private (Admin)
 */
exports.updateExercise = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const exerciseData = req.body;
    
    // Encontrar y actualizar ejercicio
    const exercise = await Exercise.findOneAndUpdate(
        { id },
        exerciseData,
        { new: true, runValidators: true }
    );
    
    if (!exercise) {
        return res.status(404).json({
            success: false,
            message: 'Ejercicio no encontrado'
        });
    }
    
    res.json({
        success: true,
        data: exercise
    });
});

/**
 * @desc    Eliminar un ejercicio
 * @route   DELETE /api/exercises/:id
 * @access  Private (Admin)
 */
exports.deleteExercise = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const exercise = await Exercise.findOneAndDelete({ id });
    
    if (!exercise) {
        return res.status(404).json({
            success: false,
            message: 'Ejercicio no encontrado'
        });
    }
    
    res.json({
        success: true,
        message: 'Ejercicio eliminado correctamente'
    });
});