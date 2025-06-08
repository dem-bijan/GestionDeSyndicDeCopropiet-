const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ message: "Token manquant" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trimLeft();
    }

    let verified;
    try {
      verified = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
    } catch (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    // Ensure we have a valid user ID
    if (!verified.id) {
      console.error('No user ID in token:', verified);
      return res.status(401).json({ message: "Token invalide: ID utilisateur manquant" });
    }

    // Set user info in request
    req.user = {
      id: verified.id,
      email: verified.email,
      role: verified.role
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: "Erreur d'authentification" });
  }
};

module.exports = { verifyToken };
