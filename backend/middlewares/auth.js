export function requireAdmin (req, res, next) {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).json({error: "No autorizado"});
    }

    const token = authHeader.split(" ")[1];

    if(token !== process.env.ADMIN_TOKEN) {
        return res.status(403).json({error: "Acceso prohibido"});
    }

    next();
}