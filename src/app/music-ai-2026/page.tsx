import { redirect } from "next/navigation";
import { MUSIC_PATH } from "@/lib/routes";

export default function HackathonHome() {
  redirect(MUSIC_PATH);
}
