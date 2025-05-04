"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  fullName: z.string().min(2, "שם מלא חייב להכיל לפחות 2 תווים"),
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(6, "סיסמה חייבת להכיל לפחות 6 תווים"),
  businessName: z.string().min(2, "שם העסק חייב להכיל לפחות 2 תווים"),
  businessPhone: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // שמירת פרטים נוספים במסד הנתונים
      await setDoc(doc(db, "users", user.uid), {
        full_name: data.fullName,
        business_name: data.businessName,
        business_phone: data.businessPhone || "",
        email: data.email,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "ההרשמה הושלמה בהצלחה",
        description: "מיד תועבר לדף הבית",
      });

      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בהרשמה",
        description: "אנא נסה שנית מאוחר יותר",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0b3d2e]">הרשמה למערכת</h1>
          <p className="text-gray-600 mt-2">צור חשבון חדש לניהול העסק שלך</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">שם מלא</Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="הזן את שמך המלא"
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="businessName">שם העסק</Label>
            <Input
              id="businessName"
              {...register("businessName")}
              placeholder="הזן את שם העסק"
            />
            {errors.businessName && (
              <p className="text-sm text-red-500">{errors.businessName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessPhone">טלפון העסק (אופציונלי)</Label>
            <Input
              id="businessPhone"
              {...register("businessPhone")}
              placeholder="הזן את מספר הטלפון של העסק"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0b3d2e] hover:bg-[#0b3d2e]/90"
            disabled={isLoading}
          >
            {isLoading ? "מבצע הרשמה..." : "הרשמה"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">כבר יש לך חשבון? </span>
          <Link href="/login" className="text-[#0b3d2e] hover:underline">
            התחבר כאן
          </Link>
        </div>
      </div>
    </div>
  );
}
