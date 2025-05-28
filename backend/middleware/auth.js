import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const attachUserAndProceed = (decoded) => {
    if (!decoded?.userId) {
      return res.status(403).json({ message: 'Invalid token payload: missing userId' });
    }
    req.user = { userId: decoded.userId };
    return next();
  };

  const verifyAccessToken = () => {
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err || !decoded) {
        return verifyRefreshToken();  // Try refresh token if access fails
      }
      attachUserAndProceed(decoded);
    });
  };

  const verifyRefreshToken = () => {
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err || !decoded) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      const { userId, username, email } = decoded; // ✅ Extract from refresh token payload

    const newAccessToken = jwt.sign(
      { userId, username, email }, // ✅ Include all fields
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      attachUserAndProceed(decoded);
    });
  };

  if (accessToken) {
    verifyAccessToken();
  } else {
    verifyRefreshToken();
  }
};
