import { useEffect } from 'react';
import { getAgeYears } from './types/activeLife';
import { useActiveLifeStore } from './stores/useActiveLifeStore';
import { useLegacyArchiveStore } from './stores/useLegacyArchiveStore';
import { StartScreen } from './components/StartScreen';
import { BirthCertificateView } from './components/BirthCertificateView';
import { ChildhoodView } from './components/ChildhoodView';
import { AdultDashboard } from './components/AdultDashboard';
import { TombstoneView } from './components/TombstoneView';
import { EventModal } from './components/EventModal';

export function App() {
  const life = useActiveLifeStore((s) => s.life);
  const hasConfirmedBirthCertificate = useActiveLifeStore((s) => s.hasConfirmedBirthCertificate);
  const colorMode = useLegacyArchiveStore((s) => s.colorMode ?? 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('light', colorMode === 'light');
  }, [colorMode]);

  if (!life) {
    return <StartScreen />;
  }

  if (!life.isAlive) {
    return <TombstoneView />;
  }

  if (!hasConfirmedBirthCertificate && life.profile.totalDays === 0) {
    return <BirthCertificateView />;
  }

  const age = getAgeYears(life.profile.totalDays);

  return (
    <>
      {age < 13 ? <ChildhoodView /> : <AdultDashboard />}
      <EventModal />
    </>
  );
}

export default App;
