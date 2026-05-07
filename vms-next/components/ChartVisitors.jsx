export default function ChartVisitors({ visitors }) {
  // Hitung jumlah visitor per hari berdasarkan data riil
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = [0, 0, 0, 0, 0, 0, 0];

  visitors?.forEach(v => {
    const d = new Date(v.created_at);
    data[d.getDay()] += 1;
  });

  const maxVal = Math.max(...data, 1); // Hindari pembagian dengan nol

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center h-64">
      <h3 className="text-lg font-bold text-gray-800 mb-4 w-full text-left">Visitor Analytics (Weekly)</h3>
      <div className="w-full flex items-end justify-around h-40 gap-2">
        {days.map((day, i) => (
          <div key={day} className="flex flex-col items-center gap-2">
            <div 
              className="bg-indigo-500 rounded-t-md w-8 md:w-12 hover:bg-indigo-600 transition-all cursor-pointer relative group" 
              style={{ height: `${(data[i] / maxVal) * 100}%`, minHeight: data[i] > 0 ? '10px' : '0px' }}
            >
              {data[i] > 0 && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                  {data[i]}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 font-medium">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
