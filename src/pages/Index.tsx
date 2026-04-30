import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PhoneFrame } from "@/components/studysync/PhoneFrame";
import { BottomNav, type Tab } from "@/components/studysync/BottomNav";
import { Onboarding } from "@/components/studysync/Onboarding";
import { HomePage } from "@/components/studysync/HomePage";
import { BuddiesPage } from "@/components/studysync/BuddiesPage";
import { SpotsPage } from "@/components/studysync/SpotsPage";
import { GroupsPage } from "@/components/studysync/GroupsPage";
import { ProfilePage } from "@/components/studysync/ProfilePage";
import { FocusPage } from "@/components/studysync/FocusPage";
import { GuidedTour } from "@/components/studysync/GuidedTour";

const Index = () => {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [focusLocked, setFocusLocked] = useState(false);

  return (
    <PhoneFrame>
      {!authed ? (
        <Onboarding onComplete={() => setAuthed(true)} />
      ) : (
        <>
          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              >
                {tab === "home" && <HomePage onNavigate={setTab} />}
                {tab === "buddies" && <BuddiesPage />}
                {tab === "spots" && <SpotsPage />}
                {tab === "focus" && <FocusPage onLockChange={setFocusLocked} />}
                {tab === "groups" && <GroupsPage />}
                {tab === "profile" && <ProfilePage onSignOut={() => setAuthed(false)} />}
              </motion.div>
            </AnimatePresence>
          </main>
          <BottomNav
            active={tab}
            onChange={(t) => {
              if (focusLocked && t !== "focus") return;
              setTab(t);
            }}
            locked={focusLocked}
          />
          {!focusLocked && <GuidedTour onNavigate={setTab} />}
        </>
      )}
    </PhoneFrame>
  );
};

export default Index;
