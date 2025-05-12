import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        if (!accessToken || !refreshToken) {
            return res.status(401).json({ message: 'Authentication tokens are missing' });
        }

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (refreshErr, refreshDecoded) => {
                    if (refreshErr) {
                        return res.status(403).json({ message: 'Invalid tokens' });
                    }

                    const newAccessToken = jwt.sign(
                        { userId: refreshDecoded.userId },
                        process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: '15m' }
                    );

                    res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: true });
                    req.user = { userId: refreshDecoded.userId };
                    next();
                });
            } else {
                req.user = { userId: decoded.userId };
                next();
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
