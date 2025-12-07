module.exports = (req, res) => {
    res.status(200).json({
        message: "Simple JS endpoint working",
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
};
