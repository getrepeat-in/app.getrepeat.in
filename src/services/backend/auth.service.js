import "@/models/Image";
import jwt from "jsonwebtoken";
import * as argon2 from "argon2";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { getRestaurantFromSlug } from "@/lib/api/hooks/getRestaurant";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "90d";

export class AuthService {
    static async register(slug, { name, phone, password }) {
        await dbConnect();
        
        const restaurant = await getRestaurantFromSlug(slug);
        
        if (!restaurant) {
            throw new Error("Restaurant not found!");
        }

        const existingUser = await User.findOne({ phone, restaurant: restaurant._id });
        if (existingUser) {
            throw new Error("A user with this phone number already exists for this restaurant");
        }

        const passwordHash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 14,
            timeCost: 2,
            parallelism: 1
        });

        const newUser = await User.create({
            name,
            phone,
            passwordHash,
            image: restaurant.logo || null,
            restaurant: restaurant._id
        });

        const token = jwt.sign(
            { userId: newUser._id, restaurantId: restaurant._id, phone: newUser.phone },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return { token };
    }

    static async login(slug, { phone, password }) {
        await dbConnect();

        const restaurant = await getRestaurantFromSlug(slug);
        
        if (!restaurant) {
            throw new Error("Restaurant not found!");
        }

        const user = await User.findOne({ phone, restaurant: restaurant._id }).select("+passwordHash");
        if (!user) {
            throw new Error("Invalid phone number or password");
        }

        if (user.status !== "ACTIVE") {
            throw new Error(`Your account is ${user.status.toLowerCase()}`);
        }

        const isPasswordValid = await argon2.verify(user.passwordHash, password);
        if (!isPasswordValid) {
            throw new Error("Invalid phone number or password");
        }

        const token = jwt.sign(
            { userId: user._id, restaurantId: restaurant._id, phone: user.phone },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return { token };
    }

    static async me(slug, token) {
        if (!token) {
            throw new Error("No token provided");
        }
        await dbConnect();

        const restaurant = await getRestaurantFromSlug(slug);
        if (!restaurant) {
            throw new Error("Restaurant not found!");
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            throw new Error("Invalid token");
        }

        const user = await User.findOne({ _id: decoded.userId, restaurant: restaurant._id }).populate("image");
        if (!user) {
            throw new Error("User not found");
        }

        if (user.status !== "ACTIVE") {
            throw new Error(`Your account is ${user.status.toLowerCase()}`);
        }

        return {
            _id: user._id,
            name: user.name,
            phone: user.phone,
            restaurant: user.restaurant,
            status: user.status,
            avatar: user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.phone,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    static async updateProfile(slug, token, data) {
        if (!token) {
            throw new Error("No token provided");
        }
        await dbConnect();

        const restaurant = await getRestaurantFromSlug(slug);
        if (!restaurant) {
            throw new Error("Restaurant not found!");
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            throw new Error("Invalid token");
        }

        const user = await User.findOne({ _id: decoded.userId, restaurant: restaurant._id }).populate("image");
        if (!user) {
            throw new Error("User not found");
        }

        const { name, phone, password, image } = data;
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (image !== undefined) user.image = image;

        if (password) {
            user.passwordHash = await argon2.hash(password, {
                type: argon2.argon2id,
                memoryCost: 2 ** 14,
                timeCost: 2,
                parallelism: 1
            });
        }

        await user.save();

        return {
            _id: user._id,
            name: user.name,
            phone: user.phone,
            restaurant: user.restaurant,
            status: user.status,
            avatar: user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.phone,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
}