// auth.ts
import { AuthService } from "@/services/authService";
import { UserRole } from "@/types/auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET, // Add this line
    session: {
        strategy: "jwt", // Explicitly set JWT strategy
    },
    trustHost: true, // Important for production
    pages: {
        signIn: "/login",
        signOut: "/logout",
        error: "/error",
    },
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id || token.sub || "";
                session.user.role = (token.role as UserRole) || "user";
                session.user.username = token.username || "";
            }
            return session;
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.username = user.username;
            }
            return token;
        },
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, request) { // Añadido el parámetro request
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                try {
                    const response = await AuthService.login({
                        username: credentials.username as string,
                        password: credentials.password as string,
                    });

                    if (response.success && response.user) {
                        // Garantizar que el role sea del tipo UserRole
                        const userRole: UserRole =
                            response.user.role === "admin" ? "admin" : "user";

                        // Aseguramos que el objeto cumple con la interfaz User de next-auth
                        return {
                            id: response.user.id,
                            name: response.user.username,
                            email: response.user.email,
                            username: response.user.username,
                            role: userRole,
                            image: null
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        }),
    ],
});