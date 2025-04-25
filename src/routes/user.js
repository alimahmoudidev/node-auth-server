const express = require("express");
const authMiddleware = require("../middleware/auth");
const userController = require("../controllers/user");

const router = express.Router();

/**
 * @swagger
 * /api/user/info-user:
 *   get:
 *     summary: Get user information
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/info-user", authMiddleware, userController.userInfo);


module.exports = router;
