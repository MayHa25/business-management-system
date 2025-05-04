"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(1, "נא להזין סיסמה"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // שלב האישור מול Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || !userSnap.data().approved) {
        toast({
          variant: "destructive",
          title: "גישה נדחתה",
          description: "המשתמש לא אושר על ידי המנהלת",
        });
        await signOut(auth);
        return;
      }

      toast({
        title: "התחברת בהצלחה",
        description: "מיד תועבר לדף הבית",
      });

      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בהתחברות",
        description: "אימייל או סיסמה שגויים",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0b3d2e]">התחברות למערכת</h1>
          <p className="text-gray-600 mt-2">התחבר לחשבון שלך</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="הזן את כתובת האימייל שלך"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">סיסמה</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="הזן סיסמה"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0b3d2e] hover:bg-[#0b3d2e]/90"
            disabled={isLoading}
          >
            {isLoading ? "מתחבר..." : "התחברות"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">אין לך חשבון? </span>
          <Link href="/login" className="text-[#0b3d2e] hover:underline">
            התחבר דרך מנהלת בלבד
          </Link>
        </div>
      </div>
    </div>
  );
}
