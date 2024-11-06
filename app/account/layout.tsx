import {AuthProvider} from "app/context/AuthContext";

// app/auth/layout.tsx
export default function AccountLayout({children}: {children: React.ReactNode}) {
    return (
        // <html lang="en">
        <AuthProvider>
            <div>
                {children}
            </div>
        </AuthProvider>

        // </html>
    );
}
