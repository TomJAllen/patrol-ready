import ProfileTabs from "@/components/ProfileTabs";

// Profile: your badges and streaks, your history and your account settings
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-3">
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">Profile</h1>
        <ProfileTabs />
      </header>
      {children}
    </div>
  );
}
