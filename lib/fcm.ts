import { messaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { toast } from "@/hooks/use-toast";

export async function requestNotificationPermission() {
  if (!messaging) {
    console.warn("Firebase Messaging לא הוגדר");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast({
        title: "הרשאה נדחתה",
        description: "לא ניתן יהיה לקבל התראות בזמן אמת.",
      });
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: "BLANNfkFLvCbM9vNCFWRtUXUqniqL04QMIrD3FbiJANaHgcXisCC0G32JzHBY88VdfCaAIRaHVFlyvwhWZxaR_c"
    });

    if (token) {
      console.log("FCM Token:", token);
      toast({
        title: "הרשאה התקבלה",
        description: "ההתראות מופעלות בהצלחה.",
      });
    } else {
      console.warn("לא התקבל token");
    }
  } catch (error) {
    console.error("שגיאה בקבלת הרשאה להתראות:", error);
    toast({
      title: "שגיאה",
      description: "אירעה שגיאה בעת הפעלת ההתראות.",
    });
  }
}

export function listenToForegroundMessages() {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log("📩 הודעה מה־Firebase:", payload);
    if (payload?.notification?.title) {
      toast({
        title: payload.notification.title,
        description: payload.notification.body || "",
      });
    }
  });
}
