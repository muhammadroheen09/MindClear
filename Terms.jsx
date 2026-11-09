export default function Terms({ onClose, darkMode }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 rounded-2xl shadow-2xl space-y-4 border ${darkMode ? 'bg-[#1e1c1b] border-white/10 text-[#E5E0D8]' : 'bg-white border-black/10 text-[#2C2A29]'}`}>
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-serif italic font-medium">Terms & Conditions</h2>
          <button onClick={onClose} className="text-xs uppercase px-2 py-1 rounded bg-stone-200 dark:bg-stone-800">Close</button>
        </div>
        <div className="space-y-3 text-xs leading-relaxed opacity-90">
          <p><strong>1. Self-Care Disclaimer:</strong> MindClear is designed strictly as a digital mindfulness, venting, and self-care notebook. It is not a medical device, licensed therapy, or psychiatric treatment substitute.</p>
          <p><strong>2. Age Requirement:</strong> You must be at least 13 years of age to use this application.</p>
          <p><strong>3. Non-Custodial Data:</strong> All journal entries, thoughts, and weather checks are stored locally in your browser's LocalStorage. We do not harvest or store your personal thoughts on any external servers.</p>
          <p><strong>4. Limitation of Liability:</strong> The creators assume no responsibility for any emotional distress or decisions made based on entries written inside this application.</p>
        </div>
      </div>
    </div>
  );
}