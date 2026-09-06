'use client'

import TimeSlider from '@/components/universal/TimeSlider'
import GhostToggle from '@/components/universal/GhostToggle'
import SnoozeMenu from '@/components/universal/SnoozeMenu'
import TeamPulse from '@/components/universal/TeamPulse'
import AnnotationsHub from '@/components/universal/AnnotationsHub'
import TagPanel from '@/components/universal/TagPanel'
import SlicesPanel from '@/components/user/SlicesPanel'
import UndoHistory from '@/components/user/UndoHistory'
import MacroRecorder from '@/components/user/MacroRecorder'
import { FocusTimer, PalettePicker, ScrubToggle } from '@/components/user/UserToolbar'
import UserCssPanel from '@/components/user/UserCssPanel'
import VoiceNav from '@/components/wow/VoiceNav'
import ThemeMixSlider from '@/components/wow/ThemeMixSlider'
import ReplayBar from '@/components/universal/ReplayBar'

/* Premium control bar — every Layer 2/3/WOW trigger, mounted once, laid out densely. */
export default function PremiumBar() {
  return (
    <div className="glass-soft flex items-center gap-1.5 overflow-x-auto px-3 py-1.5" role="toolbar" aria-label="Premium controls" style={{ scrollbarWidth: 'thin' }}>
      <TimeSlider />
      <GhostToggle />
      <ReplayBar />
      <SlicesPanel />
      <AnnotationsHub />
      <TagPanel />
      <UndoHistory />
      <MacroRecorder />
      <FocusTimer />
      <PalettePicker />
      <ScrubToggle />
      <UserCssPanel />
      <VoiceNav />
      <ThemeMixSlider />
      <SnoozeMenu />
      <TeamPulse />
      <span className="ml-auto shrink-0 select-none text-[9px] uppercase tracking-widest text-tri">command center · premium</span>
    </div>
  )
}