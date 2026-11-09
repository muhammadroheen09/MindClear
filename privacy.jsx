export default function Privacy({ onClose, darkMode }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 rounded-2xl shadow-2xl space-y-4 border ${darkMode ? 'bg-[#1e1c1b] border-white/10 text-[#E5E0D8]' : 'bg-white border-black/10 text-[#2C2A29]'}`}>
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-serif italic font-medium">Privacy Policy</h2>
          <button onClick={onClose} className="text-xs uppercase px-2 py-1 rounded bg-stone-200 dark:bg-stone-800">Close</button>
        </div>
        <div className="space-y-3 text-xs leading-relaxed opacity-90">
          <p><strong>1. Data Privacy:</strong> MindClear operates on a strictly non-custodial, client-side model. Your notes never leave your device.</p>
          <p><strong>2. Third-Party Sharing:</strong> Because we do not collect or store your personal data on external databases, there is no data shared with third parties.</p>
          <p><strong>3. Browser Cache:</strong> Clearing your browser history or local storage will permanently erase your saved journal notes.</p>
        </div>
      </div>
    </div>
  );
}